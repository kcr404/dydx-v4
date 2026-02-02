
#!/bin/bash
# Place Stateful CLOB orders on pair 35
# These use GoodTilBlockTime instead of GoodTilBlock

set -e

cd "$(dirname "$0")"
if [ -d "../build" ]; then
  cd ..
fi

# Get addresses
FROM_ALICE=$(./build/dydxprotocold keys show alice --home ./tmp_keyring --keyring-backend test -a)
FROM_BOB=$(./build/dydxprotocold keys show bob --home ./tmp_keyring --keyring-backend test -a)

FEE="5000000000000000adv4tnt,5000ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5"
CLOB_PAIR_ID=35
CHAIN_ID="localdydxprotocol"

# 1 hour from now
GTBT=$(($(date +%s) + 3600))
echo "GoodTilBlockTime: $GTBT"

echo "=========================================="
echo "Placing STATEFUL orders on pair $CLOB_PAIR_ID"
echo "=========================================="

# Place Alice BUY order
echo -e "\n[Alice] Placing BUY order..."
OUTPUT=$(./build/dydxprotocold tx clob place-order \
  "$FROM_ALICE" 0 1 35 1 1000000 100000 0 \
  --good-til-block-time "$GTBT" \
  --from "$FROM_ALICE" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 \
  --broadcast-mode sync -y 2>&1)
ALICE_TXHASH=$(echo "$OUTPUT" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")

# Note: Changed client_id to 1 to avoid dedup if any

if [ -z "$ALICE_TXHASH" ]; then
  echo "ERROR: Failed to get Alice txhash. Output:"
  echo "$OUTPUT"
  exit 1
fi
echo "Alice txhash: $ALICE_TXHASH"

# Place Bob SELL order
echo -e "\n[Bob] Placing SELL order..."
OUTPUT=$(./build/dydxprotocold tx clob place-order \
  "$FROM_BOB" 0 1 35 2 1000000 100000 0 \
  --good-til-block-time "$GTBT" \
  --from "$FROM_BOB" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 \
  --broadcast-mode sync -y 2>&1)
BOB_TXHASH=$(echo "$OUTPUT" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")

if [ -z "$BOB_TXHASH" ]; then
  echo "ERROR: Failed to get Bob txhash"
  exit 1
fi
echo "Bob txhash: $BOB_TXHASH"

# Monitor
echo -e "\n=========================================="
echo "Polling for tx inclusion..."
echo "=========================================="

check_tx() {
  local txhash=$1
  local name=$2
  
  for i in $(seq 1 30); do
    RESP=$(curl -s "http://localhost:26657/tx?hash=0x$txhash")
    if echo "$RESP" | jq -e '.result' >/dev/null 2>&1; then
      HEIGHT=$(echo "$RESP" | jq -r '.result.height')
      CODE=$(echo "$RESP" | jq -r '.result.tx_result.code')
      LOG=$(echo "$RESP" | jq -r '.result.tx_result.log')
      echo "[$name] INCLUDED at height $HEIGHT, code=$CODE"
      if [ "$CODE" != "0" ]; then
        echo "  Error: $LOG"
      fi
      return 0
    fi
    sleep 1
    if [ $((i % 5)) -eq 0 ]; then echo "Waiting... ($i)"; fi
  done
  echo "[$name] NOT INCLUDED"
}

check_tx "$ALICE_TXHASH" "Alice"
check_tx "$BOB_TXHASH" "Bob"