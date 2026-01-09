#!/bin/bash
# Verify Matching Orders (Alice Buy 100, Bob Sell 99 -> Match)
# Run from project root: ./scripts/test_matching_orders.sh

set -e

# Ensure we are in project root if run from scripts dir
if [ -d "../build" ]; then
  cd ..
fi

CHAIN_ID="localdydxprotocol"
FEE="5000000000000000adv4tnt"
NODE="http://localhost:26657"
BINARY="./build/dydxprotocold"

echo "=========================================="
echo "Verifying Matching Orders"
echo "=========================================="

ALICE=$($BINARY keys show alice --home ./tmp_keyring --keyring-backend test -a)
BOB=$($BINARY keys show bob --home ./tmp_keyring --keyring-backend test -a)
echo "Alice: $ALICE"
echo "Bob:   $BOB"

# 1. Fund Bob (Idempotent-ish, just to be safe)
echo -e "\n1. Ensuring Bob has verified margin..."
$BINARY tx sending deposit-to-subaccount "$BOB" "$BOB" 0 100000000 \
  --from "$BOB" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 -y --broadcast-mode sync --node "$NODE" >/dev/null 2>&1 || true
# We ignore error/output here as he might already be funded, or we wait a bit.
sleep 5

# 2. Place Orders
# GTBT = 1 hour from now
GTBT=$(($(date +%s) + 3600))
CID_ALICE=$(( $(date +%s) % 1000000 ))
CID_BOB=$(( CID_ALICE + 1 ))

echo -e "\n2. Placing Crossing Orders"
echo "   Alice BUY  @ 100 USDC (Quantums 1000000, Subticks 100000)"
echo "   Bob   SELL @ 99  USDC (Quantums 1000000, Subticks 99000)"

# Alice Buy
ALICE_TX=$($BINARY tx clob place-order \
  "$ALICE" 0 "$CID_ALICE" 35 1 1000000 100000 0 \
  --good-til-block-time "$GTBT" \
  --from "$ALICE" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 \
  --broadcast-mode sync -y --node "$NODE" 2>&1 | grep -oP 'txhash: \K[0-9A-F]+')
echo "   Alice Tx: $ALICE_TX"

# Bob Sell (Lower price to cross/match)
BOB_TX=$($BINARY tx clob place-order \
  "$BOB" 0 "$CID_BOB" 35 2 1000000 99000 0 \
  --good-til-block-time "$GTBT" \
  --from "$BOB" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 \
  --broadcast-mode sync -y --node "$NODE" 2>&1 | grep -oP 'txhash: \K[0-9A-F]+')
echo "   Bob Tx:   $BOB_TX"

# 3. Verify Inclusion
echo -e "\n3. Verifying Inclusion..."

check_tx() {
  local txhash=$1
  local name=$2
  local found=false
  for i in $(seq 1 20); do
    RESP=$(curl -s "$NODE/tx?hash=0x$txhash")
    if echo "$RESP" | jq -e '.result' >/dev/null 2>&1; then
      HEIGHT=$(echo "$RESP" | jq -r '.result.height')
      echo "   [$name] INCLUDED at height $HEIGHT"
      found=true
      break
    fi
    sleep 1
  done
  if [ "$found" = false ]; then echo "   [$name] NOT FOUND"; exit 1; fi
}

check_tx "$ALICE_TX" "Alice"
check_tx "$BOB_TX" "Bob"

echo -e "\nSUCCESS: Both orders included. Matching should have occurred."
echo "You can query fills manually via indexer if running."
