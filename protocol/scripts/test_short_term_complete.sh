#!/bin/bash
# Complete Short-Term Order Test with Proper Funding

set -e

CLI="./build/dydxprotocold"
CHAIN_ID="localdydxprotocol"
FEE="5000000000000000adv4tnt"
NODE="http://localhost:26657"
KEYRING="--home ./tmp_keyring --keyring-backend test"

echo "========================================="
echo "  Short-Term Order Test (Complete)"
echo "========================================="
echo ""

# Get addresses
ALICE=$($CLI keys show alice $KEYRING -a)
BOB=$($CLI keys show bob $KEYRING -a)

echo "Alice: $ALICE"
echo "Bob:   $BOB"
echo ""

# Helper functions
get_asset_balance() {
    $CLI query subaccounts show-subaccount $1 0 --output json 2>/dev/null | \
        jq -r '.subaccount.asset_positions[0].quantums // "0"' || echo "0"
}

get_position_count() {
    $CLI query subaccounts show-subaccount $1 0 --output json 2>/dev/null | \
        jq -r '.subaccount.perpetual_positions | length' || echo "0"
}

# Step 1: Check and fund subaccounts if needed
echo "--- Step 1: Checking Subaccount Balances ---"
ALICE_BAL=$(get_asset_balance alice)
BOB_BAL=$(get_asset_balance bob)

echo "Alice balance: $ALICE_BAL quantums"
echo "Bob balance: $BOB_BAL quantums"
echo ""

# Fund if balance is too low (less than 100 USDC = 100000000 quantums)
if [ "$ALICE_BAL" -lt "100000000" ]; then
    echo "Funding Alice's subaccount..."
    $CLI tx sending deposit-to-subaccount $ALICE $ALICE 0 1000000000 \
      --from alice $KEYRING \
      --chain-id $CHAIN_ID \
      --fees $FEE --gas 200000 \
      -y --broadcast-mode sync --node $NODE
    sleep 5
fi

if [ "$BOB_BAL" -lt "100000000" ]; then
    echo "Funding Bob's subaccount..."
    $CLI tx sending deposit-to-subaccount $BOB $BOB 0 1000000000 \
      --from bob $KEYRING \
      --chain-id $CHAIN_ID \
      --fees $FEE --gas 200000 \
      -y --broadcast-mode sync --node $NODE
    sleep 5
fi

# Verify funding
ALICE_BAL_AFTER=$(get_asset_balance alice)
BOB_BAL_AFTER=$(get_asset_balance bob)

echo ""
echo "After funding:"
echo "Alice balance: $ALICE_BAL_AFTER quantums"
echo "Bob balance: $BOB_BAL_AFTER quantums"
echo ""

if [ "$ALICE_BAL_AFTER" -lt "100000000" ] || [ "$BOB_BAL_AFTER" -lt "100000000" ]; then
    echo "❌ ERROR: Insufficient funds after deposit!"
    echo "   Alice needs at least 100000000 quantums"
    echo "   Bob needs at least 100000000 quantums"
    exit 1
fi

echo "✅ Both accounts funded successfully!"
echo ""

# Step 2: Record initial positions
echo "--- Step 2: Recording Initial State ---"
ALICE_POS_BEFORE=$(get_position_count alice)
BOB_POS_BEFORE=$(get_position_count bob)

echo "Alice positions: $ALICE_POS_BEFORE"
echo "Bob positions: $BOB_POS_BEFORE"
echo ""

# Step 3: Place matching short-term orders
CURRENT_BLOCK=$(curl -s $NODE/status | jq -r '.result.sync_info.latest_block_height')
GTB=$((CURRENT_BLOCK + 20))

echo "--- Step 3: Placing Matching Short-Term Orders ---"
echo "Current block: $CURRENT_BLOCK"
echo "Good til block: $GTB"
echo ""
echo "Alice: BUY 10 @ 100 (quantums: 10000000, subticks: 100000)"
echo "Bob: SELL 10 @ 99 (quantums: 10000000, subticks: 99000)"
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

echo "Orders broadcasted!"
echo "Waiting for block processing (10 seconds)..."
sleep 10

# Step 4: Check results
echo ""
echo "--- Step 4: Checking Results ---"
ALICE_POS_AFTER=$(get_position_count alice)
BOB_POS_AFTER=$(get_position_count bob)
ALICE_BAL_FINAL=$(get_asset_balance alice)
BOB_BAL_FINAL=$(get_asset_balance bob)

echo "Alice positions: $ALICE_POS_BEFORE → $ALICE_POS_AFTER"
echo "Bob positions: $BOB_POS_BEFORE → $BOB_POS_AFTER"
echo "Alice balance: $ALICE_BAL_AFTER → $ALICE_BAL_FINAL"
echo "Bob balance: $BOB_BAL_AFTER → $BOB_BAL_FINAL"
echo ""

# Determine success
echo "========================================="
if [ "$ALICE_POS_AFTER" -gt "$ALICE_POS_BEFORE" ] || [ "$BOB_POS_AFTER" -gt "$BOB_POS_BEFORE" ]; then
    echo "✅ SUCCESS: Short-term orders MATCHED!"
    echo ""
    echo "Position changes detected:"
    echo "  Alice: $ALICE_POS_BEFORE → $ALICE_POS_AFTER"
    echo "  Bob: $BOB_POS_BEFORE → $BOB_POS_AFTER"
    echo ""
    echo "This confirms short-term order matching is working!"
    exit 0
elif [ "$ALICE_BAL_FINAL" != "$ALICE_BAL_AFTER" ] || [ "$BOB_BAL_FINAL" != "$BOB_BAL_AFTER" ]; then
    echo "✅ PARTIAL SUCCESS: Balance changes detected"
    echo ""
    echo "Balance changes:"
    echo "  Alice: $ALICE_BAL_AFTER → $ALICE_BAL_FINAL"
    echo "  Bob: $BOB_BAL_AFTER → $BOB_BAL_FINAL"
    exit 0
else
    echo "⚠️  NO CHANGES: Orders may not have matched"
    echo ""
    echo "Possible reasons:"
    echo "  1. Orders didn't cross (price mismatch)"
    echo "  2. Orders filtered before reaching MemClob"
    echo "  3. Insufficient liquidity"
    echo ""
    echo "Note: Short-term orders are NOT searchable by tx hash."
    echo "They're processed via MemClob and proposer operations."
    exit 1
fi
