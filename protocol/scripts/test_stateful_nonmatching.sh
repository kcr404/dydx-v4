#!/bin/bash
# Place STATEFUL CLOB orders (Long-Term) that DO NOT MATCH
# This validates if Taker orders disappear while Maker orders persist.

set -e
CHAIN_ID="localdydxprotocol"
FEE="5000000000000000adv4tnt"
NODE="http://localhost:26657"

ALICE=$(./build/dydxprotocold keys show alice --home ./tmp_keyring --keyring-backend test -a)
BOB=$(./build/dydxprotocold keys show bob --home ./tmp_keyring --keyring-backend test -a)

CID_ALICE=$(date +%s)
CID_BOB=$((CID_ALICE + 1))
CID_ALICE=$((CID_ALICE % 1000000))
CID_BOB=$((CID_BOB % 1000000))

GTBT=$(($(date +%s) + 3600))

echo "=========================================="
echo "Placing NON-MATCHING STATEFUL orders"
echo "Alice Buy @ 100 USDC"
echo "Bob Sell @ 200 USDC"
echo "=========================================="

# Bob Sell @ 200 (Subticks 200000)
echo -e "\n[Bob] Placing SELL order..."
BOB_TXHASH=$(./build/dydxprotocold tx clob place-order \
  "$BOB" 0 "$CID_BOB" 35 2 1000000 100000 0 \
  --good-til-block-time "$GTBT" \
  --from "$BOB" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 \
  --broadcast-mode sync -y --node "$NODE" 2>&1 | grep -oP 'txhash: \K[0-9A-F]+' || echo "")

echo "Bob txhash: $BOB_TXHASH"

# Alice Buy (Restored)
echo -e "\n[Alice] Placing BUY order..."
ALICE_TXHASH=$(./build/dydxprotocold tx clob place-order \
  "$ALICE" 0 "$CID_ALICE" 35 1 1000000 100000 0 \
  --good-til-block-time "$GTBT" \
  --from "$ALICE" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 \
  --broadcast-mode sync -y --node "$NODE" 2>&1 | grep -oP 'txhash: \K[0-9A-F]+' || echo "")

echo "Alice txhash: $ALICE_TXHASH"

# Poll
check_tx() {
  local txhash=$1
  local name=$2
  local found=false
  for i in $(seq 1 30); do
    RESP=$(curl -s "$NODE/tx?hash=0x$txhash")
    if echo "$RESP" | jq -e '.result' >/dev/null 2>&1; then
      HEIGHT=$(echo "$RESP" | jq -r '.result.height')
      echo "[$name] INCLUDED at height $HEIGHT"
      found=true
      break
    fi
    sleep 1
  done
  if [ "$found" = false ]; then echo "[$name] NOT FOUND"; fi
}

check_tx "$ALICE_TXHASH" "Alice"
check_tx "$BOB_TXHASH" "Bob"
