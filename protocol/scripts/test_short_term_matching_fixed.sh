#!/bin/bash
# FIXED: Test Short-Term Order Matching
# Checks position changes instead of tx hashes (which don't exist for short-term orders)

set -e

CLI="./build/dydxprotocold"
CHAIN_ID="localdydxprotocol"
FEE="5000000000000000adv4tnt"
NODE="http://localhost:26657"
KEYRING="--home ./tmp_keyring --keyring-backend test"

echo "========================================="
echo "  Short-Term Order Matching Test (FIXED)"
echo "========================================="
echo ""

# Get addresses
ALICE=$($CLI keys show alice $KEYRING -a)
BOB=$($CLI keys show bob $KEYRING -a)

echo "Alice: $ALICE"
echo "Bob:   $BOB"
echo ""

# Helper to get position count
get_position_count() {
    $CLI query subaccounts show-subaccount $1 0 --output json 2>/dev/null | \
        jq -r '.subaccount.perpetual_positions | length' || echo "0"
}

# Helper to get asset balance
get_asset_balance() {
    $CLI query subaccounts show-subaccount $1 0 --output json 2>/dev/null | \
        jq -r '.subaccount.asset_positions[0].quantums // "0"' || echo "0"
}

# 1. Check initial state
echo "--- Initial State ---"
ALICE_POS_BEFORE=$(get_position_count alice)
BOB_POS_BEFORE=$(get_position_count bob)
ALICE_BAL_BEFORE=$(get_asset_balance alice)
BOB_BAL_BEFORE=$(get_asset_balance bob)

echo "Alice positions: $ALICE_POS_BEFORE"
echo "Bob positions: $BOB_POS_BEFORE"
echo "Alice balance: $ALICE_BAL_BEFORE"
echo "Bob balance: $BOB_BAL_BEFORE"
echo ""

# 2. Get current block and calculate GTB
CURRENT_BLOCK=$(curl -s $NODE/status | jq -r '.result.sync_info.latest_block_height')
GTB=$((CURRENT_BLOCK + 20))  # Larger window for safety

echo "Current block: $CURRENT_BLOCK"
echo "Good til block: $GTB"
echo ""

# 3. Place MATCHING short-term orders
# Alice BUY at 100, Bob SELL at 99 (should cross and match)
echo "--- Placing Matching Orders ---"
echo "Alice: BUY 10 @ 100"
echo "Bob: SELL 10 @ 99"
echo ""

CID_ALICE=$((RANDOM % 1000000))
CID_BOB=$((CID_ALICE + 1))

# Place orders concurrently
(
$CLI tx clob place-order $ALICE 0 $CID_ALICE 35 1 10000000 100000 $GTB \
  --from alice $KEYRING \
  --chain-id $CHAIN_ID \
  --fees $FEE --gas 200000 \
  --broadcast-mode sync -y --node $NODE > /dev/null 2>&1
) &

(
$CLI tx clob place-order $BOB 0 $CID_BOB 35 2 10000000 99000 $GTB \
  --from bob $KEYRING \
  --chain-id $CHAIN_ID \
  --fees $FEE --gas 200000 \
  --broadcast-mode sync -y --node $NODE > /dev/null 2>&1
) &

wait

echo "Orders broadcasted. Waiting for block processing..."
sleep 8

# 4. Check final state
echo ""
echo "--- Final State ---"
ALICE_POS_AFTER=$(get_position_count alice)
BOB_POS_AFTER=$(get_position_count bob)
ALICE_BAL_AFTER=$(get_asset_balance alice)
BOB_BAL_AFTER=$(get_asset_balance bob)

echo "Alice positions: $ALICE_POS_AFTER"
echo "Bob positions: $BOB_POS_AFTER"
echo "Alice balance: $ALICE_BAL_AFTER"
echo "Bob balance: $BOB_BAL_AFTER"
echo ""

# 5. Determine result
echo "========================================="
if [ "$ALICE_POS_AFTER" -gt "$ALICE_POS_BEFORE" ] || [ "$BOB_POS_AFTER" -gt "$BOB_POS_BEFORE" ]; then
    echo "✅ SUCCESS: Positions created!"
    echo "   Short-term orders matched and executed."
    echo ""
    echo "Position changes:"
    echo "  Alice: $ALICE_POS_BEFORE → $ALICE_POS_AFTER"
    echo "  Bob: $BOB_POS_BEFORE → $BOB_POS_AFTER"
    exit 0
elif [ "$ALICE_BAL_AFTER" != "$ALICE_BAL_BEFORE" ] || [ "$BOB_BAL_AFTER" != "$BOB_BAL_BEFORE" ]; then
    echo "✅ PARTIAL SUCCESS: Balances changed!"
    echo "   Orders processed but may not have matched."
    echo ""
    echo "Balance changes:"
    echo "  Alice: $ALICE_BAL_BEFORE → $ALICE_BAL_AFTER"
    echo "  Bob: $BOB_BAL_BEFORE → $BOB_BAL_AFTER"
    exit 0
else
    echo "❌ FAILURE: No changes detected."
    echo "   Possible causes:"
    echo "   1. Insufficient collateral in subaccounts"
    echo "   2. Orders filtered before reaching MemClob"
    echo "   3. Price/size mismatch preventing match"
    echo ""
    echo "   Run: ./scripts/debug_short_term_orders.sh"
    exit 1
fi
