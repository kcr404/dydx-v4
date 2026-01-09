#!/bin/bash
# Short-Term Order Test - Using Bob's Pre-Funded Account

set -e

CLI="./build/dydxprotocold"
CHAIN_ID="localdydxprotocol"
FEE="5000000000000000adv4tnt"
NODE="http://localhost:26657"
KEYRING="--home ./tmp_keyring --keyring-backend test"

echo "========================================="
echo "  Short-Term Order Test"
echo "  Using Bob's Pre-Funded Account"
echo "========================================="
echo ""

BOB=$($CLI keys show bob $KEYRING -a)
echo "Bob: $BOB"
echo ""

# Check Bob's balance
echo "--- Bob's Subaccount 0 ---"
$CLI query subaccounts show-subaccount bob 0 --output json | jq '.subaccount | {asset_positions, perpetual_positions}'
echo ""

# Get initial position count
INITIAL_POS=$($CLI query subaccounts show-subaccount bob 0 --output json | jq '.subaccount.perpetual_positions | length')
echo "Initial positions: $INITIAL_POS"
echo ""

# Place two short-term orders from Bob's account
CURRENT_BLOCK=$(curl -s $NODE/status | jq -r '.result.sync_info.latest_block_height')
GTB=$((CURRENT_BLOCK + 20))

echo "--- Placing Short-Term Orders ---"
echo "Current block: $CURRENT_BLOCK"
echo "Good til block: $GTB"
echo ""

CID1=$((RANDOM % 1000000))
CID2=$((CID1 + 1))

echo "Order 1: BUY 1 @ 100 (quantums: 1000000, subticks: 100000)"
echo "Order 2: SELL 1 @ 99 (quantums: 1000000, subticks: 99000)"
echo ""

# Place both orders from Bob (they should match against each other)
$CLI tx clob place-order $BOB 0 $CID1 35 1 1000000 100000 $GTB \
  --from bob $KEYRING \
  --chain-id $CHAIN_ID \
  --fees $FEE --gas 200000 \
  --broadcast-mode sync -y --node $NODE > /dev/null 2>&1 &

sleep 1

$CLI tx clob place-order $BOB 0 $CID2 35 2 1000000 99000 $GTB \
  --from bob $KEYRING \
  --chain-id $CHAIN_ID \
  --fees $FEE --gas 200000 \
  --broadcast-mode sync -y --node $NODE > /dev/null 2>&1 &

wait

echo "Orders broadcasted!"
echo "Waiting for processing..."
sleep 10

# Check final state
echo ""
echo "--- Final State ---"
$CLI query subaccounts show-subaccount bob 0 --output json | jq '.subaccount | {asset_positions, perpetual_positions}'
echo ""

FINAL_POS=$($CLI query subaccounts show-subaccount bob 0 --output json | jq '.subaccount.perpetual_positions | length')
echo "Final positions: $FINAL_POS"
echo ""

echo "========================================="
if [ "$FINAL_POS" -gt "$INITIAL_POS" ]; then
    echo "✅ SUCCESS: New position created!"
    echo "   Short-term orders matched!"
else
    echo "⚠️  No new positions"
    echo "   Orders may have been filtered or not matched"
fi
echo "========================================="
