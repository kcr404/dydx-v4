#!/bin/bash
set -e

# Setup Environment
export CHAIN_ID="localdydxprotocol"
export FEES="5000000000000000adv4tnt"
export NODE="http://localhost:26657"

echo "Fetching keys..."
export ALICE=$(./build/dydxprotocold keys show alice --home ./tmp_keyring --keyring-backend test -a)
export BOB=$(./build/dydxprotocold keys show bob --home ./tmp_keyring --keyring-backend test -a)
export VAL_ADDR=$(./build/dydxprotocold keys show alice --home ./tmp_keyring --keyring-backend test --bech val -a)

echo "Alice: $ALICE"
echo "Bob: $BOB"
echo "Validator: $VAL_ADDR"

# Helper function
dydx_tx() {
  echo "Running: dydxprotocold tx $@"
  ./build/dydxprotocold tx "$@" --home ./tmp_keyring --keyring-backend test --chain-id "$CHAIN_ID" --fees "$FEES" --gas 200000 -y --node "$NODE" --broadcast-mode sync
  sleep 4 # Wait for block inclusion
}

echo "---------------------------------------------------"
echo "1. Testing Stateful Order Placement"
echo "---------------------------------------------------"
GTBT=$(($(date +%s) + 3600))
# Place Stateful Order (Long-Term)
dydx_tx clob place-order "$ALICE" 0 123 35 1 1000000 100000 0 --good-til-block-time "$GTBT" --from "$ALICE"

echo "---------------------------------------------------"
echo "2. Testing Vault Deposit/Withdraw"
echo "---------------------------------------------------"
# Deposit 10 USDC
dydx_tx vault deposit-to-megavault "$ALICE" 0 10000000 --from "$ALICE"

# Withdraw 100 shares
dydx_tx vault withdraw-from-megavault "$ALICE" 0 100 0 --from "$ALICE"

echo "---------------------------------------------------"
echo "3. Testing Governance"
echo "---------------------------------------------------"
# Submit Proposal
dydx_tx gov submit-legacy-proposal \
  --title "Test Proposal" \
  --description "Testing governance on localnet" \
  --type "Text" \
  --from "$ALICE"

# Vote Yes
# Proposal ID is likely 1 on a fresh chain
dydx_tx gov vote 1 yes --from "$ALICE"

echo "---------------------------------------------------"
echo "4. Testing Staking"
echo "---------------------------------------------------"
# Delegate
dydx_tx staking delegate "$VAL_ADDR" 100000000adv4tnt --from "$ALICE"

# Query Delegation
echo "Querying delegations..."
./build/dydxprotocold query staking delegations "$ALICE" --node "$NODE"

echo "---------------------------------------------------"
echo "Tests Completed!"
echo "---------------------------------------------------"
