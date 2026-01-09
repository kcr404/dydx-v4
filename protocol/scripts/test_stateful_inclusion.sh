#!/bin/bash
# Place STATEFUL CLOB orders (Long-Term) on pair 35
# This script uses GoodTilBlockTime to create Stateful orders which should persist on-chain.

set -e

# Setup
CHAIN_ID="localdydxprotocol"
FEE="5000000000000000adv4tnt"
NODE="http://localhost:26657"

# Get addresses
ALICE=$(./build/dydxprotocold keys show alice --home ./tmp_keyring --keyring-backend test -a)
BOB=$(./build/dydxprotocold keys show bob --home ./tmp_keyring --keyring-backend test -a)

# Generate Client IDs (timestamp based to avoid collision)
CID_ALICE=$(date +%s)
CID_BOB=$((CID_ALICE + 1))
CID_ALICE=$((CID_ALICE % 1000000)) # Keep it reasonable size
CID_BOB=$((CID_BOB % 1000000))

# GoodTilBlockTime (1 hour from now)
GTBT=$(($(date +%s) + 3600))

echo "=========================================="
echo "Placing STATEFUL orders"
echo "GoodTilBlockTime: $GTBT"
echo "=========================================="

# Place Alice BUY order (Long-Term)
# Args: owner subaccount clientId clobPairId side quantums subticks goodTilBlock
# We set goodTilBlock to 0 and use --good-til-block-time flag
echo -e "\n[Alice] Placing BUY order..."
ALICE_TXHASH=$(./build/dydxprotocold tx clob place-order \
  "$ALICE" 0 "$CID_ALICE" 35 1 1000000 100000 0 \
  --good-til-block-time "$GTBT" \
  --from "$ALICE" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 \
  --broadcast-mode sync -y --node "$NODE" 2>&1 | grep -oP 'txhash: \K[0-9A-F]+' || echo "")

if [ -z "$ALICE_TXHASH" ]; then
  echo "ERROR: Failed to get Alice txhash"
  exit 1
fi
echo "Alice txhash: $ALICE_TXHASH"

# Place Bob SELL order (Long-Term)
echo -e "\n[Bob] Placing SELL order..."
BOB_TXHASH=$(./build/dydxprotocold tx clob place-order \
  "$BOB" 0 "$CID_BOB" 35 2 1000000 100000 0 \
  --good-til-block-time "$GTBT" \
  --from "$BOB" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 \
  --broadcast-mode sync -y --node "$NODE" 2>&1 | grep -oP 'txhash: \K[0-9A-F]+' || echo "")

if [ -z "$BOB_TXHASH" ]; then
  echo "ERROR: Failed to get Bob txhash"
  exit 1
fi
echo "Bob txhash: $BOB_TXHASH"

# Poll for inclusion
echo -e "\n=========================================="
echo "Polling for tx inclusion (max 30 blocks)..."
echo "=========================================="

check_tx() {
  local txhash=$1
  local name=$2
  local found=false
  
  for i in $(seq 1 30); do
    RESP=$(curl -s "$NODE/tx?hash=0x$txhash")
    if echo "$RESP" | jq -e '.result' >/dev/null 2>&1; then
      HEIGHT=$(echo "$RESP" | jq -r '.result.height')
      CODE=$(echo "$RESP" | jq -r '.result.tx_result.code')
      LOG=$(echo "$RESP" | jq -r '.result.tx_result.log // ""')
      echo "[$name] INCLUDED at height $HEIGHT, code=$CODE"
      if [ "$CODE" != "0" ]; then
        echo "  Error log: $LOG"
      fi
      found=true
      break
    fi
    sleep 1
    if [ $((i % 5)) -eq 0 ]; then
      echo "  [$name] Waiting... ($i/30)"
    fi
  done
  
  if [ "$found" = false ]; then
    echo "[$name] NOT FOUND after 30 blocks"
  fi
}

check_tx "$ALICE_TXHASH" "Alice"
check_tx "$BOB_TXHASH" "Bob"
