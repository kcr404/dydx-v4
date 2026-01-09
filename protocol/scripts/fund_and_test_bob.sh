#!/bin/bash
set -e

CHAIN_ID="localdydxprotocol"
FEE="5000000000000000adv4tnt"
NODE="http://localhost:26657"

BOB=$(./build/dydxprotocold keys show bob --home ./tmp_keyring --keyring-backend test -a)
echo "Bob: $BOB"

echo "Depositing 100 USDC to Bob's subaccount 0..."
# quantums = 100,000,000 (assuming 6 decimals)
./build/dydxprotocold tx sending deposit-to-subaccount "$BOB" "$BOB" 0 100000000 \
  --from "$BOB" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 -y --broadcast-mode sync --node "$NODE"

echo "Waiting for deposit block..."
sleep 6

echo "Retrying Bob's Statefull Order..."
./scripts/test_stateful_nonmatching.sh
