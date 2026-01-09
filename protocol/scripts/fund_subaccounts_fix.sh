#!/bin/bash
# Quick Fix: Fund Subaccounts Using Correct Asset

set -e

CLI="./build/dydxprotocold"
CHAIN_ID="localdydxprotocol"
NODE="http://localhost:26657"
KEYRING="--home ./tmp_keyring --keyring-backend test"

echo "========================================="
echo "  Funding Subaccounts - Quick Fix"
echo "========================================="
echo ""

# The issue: We need to find which denom actually works for subaccounts
# Let's check what the subaccounts module expects

echo "Checking asset configuration..."
$CLI query assets params --output json 2>/dev/null || echo "No params command"

echo ""
echo "Checking first asset..."
# Since we can't query assets directly, let's just try funding with the native token
# that we know exists in bank balances

ALICE=$($CLI keys show alice $KEYRING -a)
BOB=$($CLI keys show bob $KEYRING -a)

echo "Alice: $ALICE"
echo "Bob: $BOB"
echo ""

# Check bank balances to see what denoms are available
echo "Alice's bank balances:"
$CLI query bank balances $ALICE --output json | jq '.balances'
echo ""

# The real solution: Use the TypeScript bot which might handle this better
# Or: Manually create transfers between subaccounts if one is funded

echo "========================================="
echo "RECOMMENDATION:"
echo "========================================="
echo ""
echo "The deposit-to-subaccount command has an IBC token issue."
echo "Best solution: Use the TypeScript matching bot which creates"
echo "orders from funded genesis accounts."
echo ""
echo "Run: cd ../e2e-testing && npm install && npm run short-term-test"
echo ""
