#!/bin/bash
# Place CLOB orders on pair 35 (TEST-USD, market_id 33, priced)
# This script queries current block height, calculates GTB, places order, and polls for inclusion

set -e

cd "$(dirname "$0")"
if [ -d "../build" ]; then
  cd ..
fi

# Get addresses
FROM_ALICE=$(./build/dydxprotocold keys show alice --home ./tmp_keyring --keyring-backend test -a)
FROM_BOB=$(./build/dydxprotocold keys show bob --home ./tmp_keyring --keyring-backend test -a)

FEE="5000000000000000adv4tnt,5000ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5"
CLOB_PAIR_ID=35  # TEST-USD, market_id 33
CHAIN_ID="localdydxprotocol"

# Query current block height
H=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
GTB=$((H + 5))  # Use +5 for safety

echo "=========================================="
echo "Placing orders on pair $CLOB_PAIR_ID (TEST-USD)"
echo "Current height: $H"
echo "GoodTilBlock: $GTB"
echo "=========================================="

# Place Alice BUY order
echo -e "\n[Alice] Placing BUY order..."
ALICE_TXHASH=$(./build/dydxprotocold tx clob place-order \
  "$FROM_ALICE" 0 0 $CLOB_PAIR_ID 1 1000000 100000 $GTB \
  --from "$FROM_ALICE" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 \
  --broadcast-mode sync -y 2>&1 | grep -oP 'txhash: \K[0-9A-F]+' || echo "")

if [ -z "$ALICE_TXHASH" ]; then
  echo "ERROR: Failed to get Alice txhash"
  exit 1
fi

echo "Alice txhash: $ALICE_TXHASH"

# Place Bob SELL order
echo -e "\n[Bob] Placing SELL order..."
BOB_TXHASH=$(./build/dydxprotocold tx clob place-order \
  "$FROM_BOB" 0 0 $CLOB_PAIR_ID 2 1000000 100000 $GTB \
  --from "$FROM_BOB" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 \
  --broadcast-mode sync -y 2>&1 | grep -oP 'txhash: \K[0-9A-F]+' || echo "")

if [ -z "$BOB_TXHASH" ]; then
  echo "ERROR: Failed to get Bob txhash"
  exit 1
fi

echo "Bob txhash: $BOB_TXHASH"

# Check mempool immediately
echo -e "\n=========================================="
echo "Checking mempool..."
sleep 1
MEMPOOL=$(curl -s "http://localhost:26657/unconfirmed_txs?limit=50")
N_TXS=$(echo "$MEMPOOL" | jq -r '.result.n_txs // "0"')
TOTAL=$(echo "$MEMPOOL" | jq -r '.result.total // "0"')
echo "Mempool: $N_TXS txs (total: $TOTAL)"

# Poll for inclusion
echo -e "\n=========================================="
echo "Polling for tx inclusion (max 30 blocks)..."
echo "=========================================="

check_tx() {
  local txhash=$1
  local name=$2
  local found=false
  
  for i in $(seq 1 30); do
    RESP=$(curl -s "http://localhost:26657/tx?hash=0x$txhash")
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
    CURRENT_H=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
    if [ $((i % 5)) -eq 0 ]; then
      echo "  [$name] Block $CURRENT_H, still waiting... ($i/30)"
    fi
    sleep 1
  done
  
  if [ "$found" = false ]; then
    echo "[$name] NOT FOUND after 30 blocks - may have been evicted or filtered"
  fi
}

check_tx "$ALICE_TXHASH" "Alice"
check_tx "$BOB_TXHASH" "Bob"

echo -e "\n=========================================="
echo "Final mempool status:"
curl -s "http://localhost:26657/unconfirmed_txs?limit=50" | jq '{n_txs:.result.n_txs, total:.result.total}'
echo "=========================================="

