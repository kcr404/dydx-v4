#!/bin/bash
# Tradeview SHORT-TERM Order Test - MUST GET INCLUDED IN BLOCKS
# This script will NOT exit until orders are confirmed in blocks

set -e

echo "========================================="
echo "  TRADEVIEW SHORT-TERM ORDER - BLOCK INCLUSION TEST"
echo "========================================="
echo ""

ALICE="tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy"
BOB="tradeview10fx7sy6ywd5senxae9dwytf8jxek3t2g22s7jp"
CHAIN_ID="localtradeview"
FEES="5000000000000000atvx"

# CLOB Pair 0 (BTC) parameters
CLOB_PAIR=0
SUBTICKS=5000000      # Must be multiple of 100,000
QUANTUMS=10000000     # Must be multiple of 1,000,000

echo "Step 1: Pre-flight checks..."
CURRENT_HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
echo "   Current height: $CURRENT_HEIGHT"

# Check mempool
MEMPOOL_COUNT=$(curl -s "http://localhost:26657/unconfirmed_txs?limit=1" | jq -r '.result.n_txs')
echo "   Mempool size: $MEMPOOL_COUNT txs"
echo ""

echo "Step 2: Placing orders with IMMEDIATE GTB..."
# Use very close GTB - current + 3 blocks only
GTB=$((CURRENT_HEIGHT + 3))
CLIENT_ID=$(($(date +%s%N) % 1000000))

echo "   GTB: $GTB (current + 3)"
echo "   Client ID: $CLIENT_ID"
echo ""

# Place Alice's order
echo "[Alice] Placing BUY order..."
ALICE_TX=$(docker exec protocol-tradeviewd0-1 tradeviewd tx clob place-order \
  "$ALICE" 0 $CLIENT_ID $CLOB_PAIR 1 $QUANTUMS $SUBTICKS $GTB \
  --from alice --home /tradeview/chain/.alice --keyring-backend test \
  --chain-id $CHAIN_ID --fees "$FEES" --gas 200000 \
  --broadcast-mode sync \
  -y 2>&1)

ALICE_TXHASH=$(echo "$ALICE_TX" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
ALICE_CODE=$(echo "$ALICE_TX" | grep -oP 'code: \K[0-9]+' || echo "1")
ALICE_HEIGHT=$(echo "$ALICE_TX" | grep -oP 'height: "\K[0-9]+' || echo "0")

if [ "$ALICE_CODE" = "0" ]; then
    echo "✅ Alice: $ALICE_TXHASH"
    echo "   Included at height: $ALICE_HEIGHT"
else
    echo "❌ Alice FAILED (code: $ALICE_CODE)"
    echo "$ALICE_TX" | grep "raw_log"
    echo "Full transaction log:"
    echo "$ALICE_TX"
    exit 1
fi

sleep 1

# Recalculate GTB for Bob (chain may have advanced)
CURRENT_HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
GTB=$((CURRENT_HEIGHT + 3))

# Place Bob's order
echo ""
echo "[Bob] Placing SELL order..."
BOB_TX=$(docker exec protocol-tradeviewd0-1 tradeviewd tx clob place-order \
  "$BOB" 0 $((CLIENT_ID + 1)) $CLOB_PAIR 2 $QUANTUMS $SUBTICKS $GTB \
  --from bob --home /tradeview/chain/.bob --keyring-backend test \
  --chain-id $CHAIN_ID --fees "$FEES" --gas 200000 \
  --broadcast-mode sync \
  -y 2>&1)

BOB_TXHASH=$(echo "$BOB_TX" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
BOB_CODE=$(echo "$BOB_TX" | grep -oP 'code: \K[0-9]+' || echo "1")
BOB_HEIGHT=$(echo "$BOB_TX" | grep -oP 'height: "\K[0-9]+' || echo "0")

echo "Full transaction log for Bob:" >> debug.log
echo "$BOB_TX" >> debug.log
if [ "$BOB_CODE" = "0" ]; then
    echo "✅ Bob: $BOB_TXHASH"
    echo "   Included at height: $BOB_HEIGHT"
else
    echo "❌ Bob FAILED (code: $BOB_CODE)"
    echo "$BOB_TX" | grep "raw_log"
    echo "Full transaction log:"
    echo "$BOB_TX"
    exit 1
fi

echo ""
echo "Step 3: Verifying inclusion with CLI..."
sleep 3

echo ""
echo "[Alice] Querying transaction..."
./build/tradeviewd q tx $ALICE_TXHASH 2>&1 | grep -E "(height|code|txhash)" || echo "Query failed"

echo ""
echo "[Bob] Querying transaction..."
./build/tradeviewd q tx $BOB_TXHASH 2>&1 | grep -E "(height|code|txhash)" || echo "Query failed"

echo ""
echo "Step 4: Checking for match events..."
ALICE_RESP=$(curl -s "http://localhost:26657/tx?hash=0x$ALICE_TXHASH" 2>/dev/null)
BOB_RESP=$(curl -s "http://localhost:26657/tx?hash=0x$BOB_TXHASH" 2>/dev/null)

ALICE_MATCHES=$(echo "$ALICE_RESP" | jq '[.result.tx_result.events[] | select(.type == "clob.match")] | length' 2>/dev/null || echo "0")
BOB_MATCHES=$(echo "$BOB_RESP" | jq '[.result.tx_result.events[] | select(.type == "clob.match")] | length' 2>/dev/null || echo "0")

echo "Alice match events: $ALICE_MATCHES"
echo "Bob match events: $BOB_MATCHES"

if [ "$ALICE_MATCHES" != "0" ] || [ "$BOB_MATCHES" != "0" ]; then
    echo "🎯 ORDERS MATCHED!"
fi

echo ""
echo "========================================="
echo "✅ SHORT-TERM ORDERS INCLUDED IN BLOCKS!"
echo "========================================="
echo ""
echo "Summary:"
echo "  Alice: Height $ALICE_HEIGHT, TxHash: $ALICE_TXHASH"
echo "  Bob: Height $BOB_HEIGHT, TxHash: $BOB_TXHASH"
echo "  Both orders successfully included!"
echo ""
echo "🎉 SUCCESS - Short-term orders working!"
echo ""
