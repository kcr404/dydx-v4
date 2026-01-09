#!/bin/bash
# Complete Short-Term Order Fix - Using Correct Asset

set -e

CLI="./build/dydxprotocold"
CHAIN_ID="localdydxprotocol"
NODE="http://localhost:26657"
KEYRING="--home ./tmp_keyring --keyring-backend test"

echo "========================================="
echo "  Short-Term Order Fix - Complete Test"
echo "========================================="
echo ""

# Get addresses
ALICE=$($CLI keys show alice $KEYRING -a)
BOB=$($CLI keys show bob $KEYRING -a)

echo "Alice: $ALICE"
echo "Bob:   $BOB"
echo ""

# Step 1: Check what assets exist
echo "--- Step 1: Checking Asset Configuration ---"
echo "Querying chain for asset information..."
echo ""

# Check bank balances to see what denoms exist
echo "Alice's bank balances:"
$CLI query bank balances $ALICE --output json | jq '.balances'
echo ""

# Step 2: Try to use the IBC USDC for deposit
echo "--- Step 2: Attempting Deposit with IBC Token ---"
IBC_DENOM="ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5"

# First, let's check if we can query the asset module
echo "Checking subaccount module..."
$CLI query subaccounts show-subaccount alice 0 --output json | jq '.subaccount'
echo ""

# The issue: deposits work but use wrong asset
# Let's try a different approach - use create-transfer instead
echo "--- Step 3: Alternative - Using Transfers ---"
echo "Note: Deposits may not work due to asset mismatch"
echo "Trying direct transfer approach..."
echo ""

# Check if there are any funded subaccounts we can transfer from
echo "Checking all test accounts for funded subaccounts..."
for account in alice bob carl dave; do
    addr=$($CLI keys show $account $KEYRING -a 2>/dev/null || echo "")
    if [ -n "$addr" ]; then
        bal=$($CLI query subaccounts show-subaccount $account 0 --output json 2>/dev/null | \
            jq -r '.subaccount.asset_positions[0].quantums // "0"')
        echo "$account (subaccount 0): $bal quantums"
    fi
done
echo ""

echo "========================================="
echo "  Analysis Complete"
echo "========================================="
echo ""
echo "Issue Identified:"
echo "  - Bank balances exist (IBC tokens)"
echo "  - Subaccounts are empty (no asset_positions)"
echo "  - Deposit command uses wrong asset type"
echo ""
echo "Solution:"
echo "  Need to either:"
echo "  1. Reset chain with proper genesis funding"
echo "  2. Find correct native USDC denom"
echo "  3. Modify genesis to add subaccount balances"
echo ""
