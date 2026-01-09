#!/bin/bash
set -e

# Configuration
CHAIN_ID="localdydxprotocol"
FEE="5000000000000000adv4tnt"
NODE="http://localhost:26657"

# Get Bob's address
BOB=$(./build/dydxprotocold keys show bob --home ./tmp_keyring --keyring-backend test -a)
echo "=========================================="
echo "Bob's Address: $BOB"
echo "=========================================="

# Show Bob's existing subaccounts
echo ""
echo "Checking Bob's Subaccount 0:"
./build/dydxprotocold query subaccounts show-subaccount "$BOB" 0 --node "$NODE"

echo ""
echo "Checking Bob's Subaccount 1:"
./build/dydxprotocold query subaccounts show-subaccount "$BOB" 1 --node "$NODE"

# Deposit to subaccount 1 (new subaccount)
echo ""
echo "=========================================="
echo "Depositing 50 USDC to Bob's Subaccount 1"
echo "=========================================="
./build/dydxprotocold tx sending deposit-to-subaccount "$BOB" "$BOB" 1 50000000 \
  --from "$BOB" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 -y --broadcast-mode sync --node "$NODE"

echo ""
echo "Waiting for deposit to be included in a block..."
sleep 6

echo ""
echo "Checking Bob's Subaccount 1 after deposit:"
./build/dydxprotocold query subaccounts show-subaccount "$BOB" 1 --node "$NODE"

# Place an order from subaccount 1
echo ""
echo "=========================================="
echo "Placing a SELL order from Subaccount 1"
echo "Market: Perpetual ID 35"
echo "Price: 150 USDC (subticks), Size: 1000000 quantums"
echo "=========================================="

# Generate unique client ID
CID_BOB=$(date +%s)
CID_BOB=$((CID_BOB % 1000000))

# Get GoodTilBlockTime (1 hour from now)
GTBT=$(($(date +%s) + 3600))

echo "Client ID: $CID_BOB"
echo "GoodTilBlockTime: $GTBT"

# Place STATEFUL order using subaccount 1
# Format: owner subaccount_number clientId clobPairId side quantums subticks goodTilBlock
./build/dydxprotocold tx clob place-order \
  "$BOB" 1 "$CID_BOB" 35 2 1000000 150000 0 \
  --good-til-block-time "$GTBT" \
  --from "$BOB" \
  --home ./tmp_keyring \
  --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" \
  --gas 200000 \
  -y \
  --broadcast-mode sync \
  --node "$NODE"

echo ""
echo "Waiting for order to be processed..."
sleep 6

echo ""
echo "Final state of Bob's Subaccount 1:"
./build/dydxprotocold query subaccounts show-subaccount "$BOB" 1 --node "$NODE"
