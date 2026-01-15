#!/bin/bash
set -e

# Setup Environment
export CHAIN_ID="localdydxprotocol"
export FEES="5000000000000000adv4tnt"
export NODE="http://localhost:26657"

echo "Fetching keys..."
export ALICE=$(./build/dydxprotocold keys show alice --home ./tmp_keyring --keyring-backend test -a)
export BOB=$(./build/dydxprotocold keys show bob --home ./tmp_keyring --keyring-backend test -a)

echo "Alice: $ALICE"
echo "Bob: $BOB"  

# Helper function
dydx_tx() {
  echo "Running: dydxprotocold tx $@"
  ./build/dydxprotocold tx "$@" --home ./tmp_keyring --keyring-backend test --chain-id "$CHAIN_ID" --fees "$FEES" --gas 200000 -y --node "$NODE" --broadcast-mode sync --from "$ALICE"
  sleep 4 # Wait for block inclusion
}

get_gtb() {
  local height=$(curl -s "$NODE/status" | jq -r .result.sync_info.latest_block_height)
  echo $((height + 20))
}

echo "---------------------------------------------------"
echo "1. Testing Short-Term Limit Order (GoodTilBlock)"
echo "---------------------------------------------------"
# Place Short-Term Order
GTB=$(get_gtb)
echo "Current Height approx: $((GTB-20)), Using GTB: $GTB"
dydx_tx clob place-order "$ALICE" 0 201 35 1 1000000 100000 "$GTB"

echo "---------------------------------------------------"
echo "2. Testing Long-Term Limit Order (GoodTilBlockTime)"
echo "---------------------------------------------------"
GTBT=$(($(date +%s) + 3600))
dydx_tx clob place-order "$ALICE" 0 202 35 1 1000000 100000 0 --good-til-block-time "$GTBT"

echo "---------------------------------------------------"
echo "3. Testing Order Cancellation"
echo "---------------------------------------------------"
# 1. Place an order to cancel
echo "Placing order to cancel..."
GTB=$(get_gtb)
dydx_tx clob place-order "$ALICE" 0 203 35 1 1000000 100000 "$GTB"

# 2. Cancel it
echo "Cancelling order..."
GTB=$(get_gtb)
dydx_tx clob cancel-order "$ALICE" 0 203 35 "$GTB"

echo "---------------------------------------------------"
echo "4. Testing Batch Cancellation (Attempt)"
echo "---------------------------------------------------"
# Note: This might fail if the binary is missing the --clientIds flag definition
echo "Placing orders for batch cancel..."
GTB=$(get_gtb)
dydx_tx clob place-order "$ALICE" 0 204 35 1 1000000 100000 "$GTB"
dydx_tx clob place-order "$ALICE" 0 205 35 1 1000000 100000 "$GTB"

echo "Attempting batch cancel..."
GTB=$(get_gtb)
# We use || true to not exit script if this specific command fails due to missing flag
./build/dydxprotocold tx clob batch-cancel "$ALICE" 0 35 "$GTB" --clientIds="204 205" \
  --home ./tmp_keyring --keyring-backend test --chain-id "$CHAIN_ID" \
  --fees "$FEES" --gas 200000 -y --node "$NODE" --broadcast-mode sync --from "$ALICE" || echo "Batch cancel failed (expected if flag missing)"

echo "---------------------------------------------------"
echo "Trade Tests Completed!"
echo "---------------------------------------------------"
