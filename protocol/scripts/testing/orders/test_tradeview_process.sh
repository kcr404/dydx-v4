#!/bin/bash

# Step 1: Check chain ID
CHAIN_ID=$(curl -s http://localhost:26657/status | jq -r '.result.node_info.network')
echo "Chain ID: $CHAIN_ID"

# Step 2: Check balances
echo "Checking balances..."
./build/tradeviewd q bank balances tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy
./build/tradeviewd q bank balances tradeview10fx7sy6ywd5senxae9dwytf8jxek3t2g22s7jp

# Step 3: Bank send
echo "Performing bank send..."
TXHASH=$(./build/tradeviewd tx bank send \
  tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy \
  tradeview10fx7sy6ywd5senxae9dwytf8jxek3t2g22s7jp \
  100ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5 \
  --from alice \
  --keyring-backend test \
  --chain-id localtradeview \
  --fees "1000000000000atvx,5000ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5" \
  --gas 200000 \
  --broadcast-mode sync \
  -y | jq -r '.txhash')
echo "Bank send TXHASH: $TXHASH"

# Step 4: Poll transaction inclusion
until curl -s "http://localhost:26657/tx?hash=0x${TXHASH}" | jq -e '.result' >/dev/null; do
  sleep 1
done
echo "Transaction included:"
curl -s "http://localhost:26657/tx?hash=0x${TXHASH}" | jq

# Step 5: Compute GTB
GTB=$(($(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height') + 5))
echo "Good Till Block (GTB): $GTB"

# Step 6: Alice SHORT-TERM BUY order
echo "Placing Alice SHORT-TERM BUY order..."
ALICE_TXHASH=$(./build/tradeviewd tx clob place-order \
  tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy \
  0 0 35 1 1000000 100000 $GTB \
  --from alice \
  --keyring-backend test \
  --chain-id localtradeview \
  --fees "1000000000000atvx,5000ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5" \
  --gas 200000 \
  --broadcast-mode sync \
  -y | jq -r '.txhash')
echo "Alice SHORT-TERM BUY TXHASH: $ALICE_TXHASH"

# Step 7: Bob SHORT-TERM SELL order
echo "Placing Bob SHORT-TERM SELL order..."
BOB_TXHASH=$(./build/tradeviewd tx clob place-order \
  tradeview10fx7sy6ywd5senxae9dwytf8jxek3t2g22s7jp \
  0 0 35 2 1000000 100000 $GTB \
  --from bob \
  --keyring-backend test \
  --chain-id localtradeview \
  --fees "1000000000000atvx,5000ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5" \
  --gas 200000 \
  --broadcast-mode sync \
  -y | jq -r '.txhash')
echo "Bob SHORT-TERM SELL TXHASH: $BOB_TXHASH"

# Step 8: Poll Bob's transaction inclusion
until curl -s "http://localhost:26657/tx?hash=0x${BOB_TXHASH}" | jq -e '.result' >/dev/null; do
  sleep 1
done
echo "Bob's transaction included:"
curl -s "http://localhost:26657/tx?hash=0x${BOB_TXHASH}" | jq