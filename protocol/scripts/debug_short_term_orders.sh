#!/bin/bash
# Debug Short-Term Order Issues

set -e

CLI="./build/dydxprotocold"
CHAIN_ID="localdydxprotocol"
NODE="http://localhost:26657"
KEYRING="--home ./tmp_keyring --keyring-backend test"

echo "========================================="
echo "  Short-Term Order Debugging"
echo "========================================="
echo ""

# Get addresses
ALICE=$($CLI keys show alice $KEYRING -a)
BOB=$($CLI keys show bob $KEYRING -a)

echo "Alice: $ALICE"
echo "Bob:   $BOB"
echo ""

# Check bank balances
echo "--- Bank Balances ---"
echo "Alice:"
$CLI query bank balances $ALICE --output json | jq '.balances'
echo ""
echo "Bob:"
$CLI query bank balances $BOB --output json | jq '.balances'
echo ""

# Check subaccount balances
echo "--- Subaccount Balances ---"
echo "Alice subaccount 0:"
$CLI query subaccounts show-subaccount alice 0 --output json | jq '.subaccount'
echo ""
echo "Bob subaccount 0:"
$CLI query subaccounts show-subaccount bob 0 --output json | jq '.subaccount'
echo ""

# Check CLOB pairs
echo "--- CLOB Pairs ---"
$CLI query clob list-clob-pair --output json | jq '.clob_pair[0]'
echo ""

# Check current block
CURRENT_BLOCK=$(curl -s $NODE/status | jq -r '.result.sync_info.latest_block_height')
echo "Current block: $CURRENT_BLOCK"
echo ""

# Fund subaccounts if needed
echo "--- Funding Subaccounts ---"
echo "Depositing to Alice..."
$CLI tx sending deposit-to-subaccount $ALICE $ALICE 0 1000000000 \
  --from alice $KEYRING \
  --chain-id $CHAIN_ID \
  --fees 5000000000000000adv4tnt \
  --gas 200000 -y --broadcast-mode sync --node $NODE

echo "Depositing to Bob..."
$CLI tx sending deposit-to-subaccount $BOB $BOB 0 1000000000 \
  --from bob $KEYRING \
  --chain-id $CHAIN_ID \
  --fees 5000000000000000adv4tnt \
  --gas 200000 -y --broadcast-mode sync --node $NODE

echo "Waiting for deposits..."
sleep 5

# Check subaccounts again
echo ""
echo "--- After Funding ---"
echo "Alice subaccount:"
$CLI query subaccounts show-subaccount alice 0 --output json | jq '.subaccount.asset_positions'
echo ""
echo "Bob subaccount:"
$CLI query subaccounts show-subaccount bob 0 --output json | jq '.subaccount.asset_positions'
echo ""

echo "========================================="
echo "  Ready to test short-term orders!"
echo "========================================="
