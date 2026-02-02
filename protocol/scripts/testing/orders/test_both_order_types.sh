#!/bin/bash
# Test Both Short-Term and Long-Term Orders
# Verifies both order types can be placed and included in blocks

set -e

echo "========================================="
echo "  Testing Short-Term & Long-Term Orders"
echo "========================================="
echo ""

ALICE="tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy"
CHAIN_ID="localtradeview"
FEES="5000000000000000atvx"

# Get current block height for short-term order
HEIGHT=$(curl -s 'http://localhost:26657/status' | jq -r '.result.sync_info.latest_block_height')
GTB=$((HEIGHT + 20))
echo "Current Height: $HEIGHT"
echo "GoodTilBlock: $GTB"

# Calculate timestamp for long-term order
GTBT=$(($(date +%s) + 3600))
echo "GoodTilBlockTime: $GTBT"
echo ""

# Generate unique client IDs
CLIENT_ID_SHORT=$(($(date +%s%N) % 1000000))
CLIENT_ID_LONG=$((CLIENT_ID_SHORT + 1))

echo "========================================="
echo "1. Placing SHORT-TERM Order"
echo "========================================="
SHORT_TX=$(./build/tradeviewd tx clob place-order \
  "$ALICE" 0 $CLIENT_ID_SHORT 0 1 1000000 100000 $GTB \
  --from alice \
  --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEES" \
  --gas 200000 \
  --broadcast-mode sync \
  -y 2>&1)

SHORT_HASH=$(echo "$SHORT_TX" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
echo "Short-Term Order TxHash: $SHORT_HASH"
echo "$SHORT_TX" | grep -E "OrderFlags|GoodTilOneof"
echo ""

sleep 2

echo "========================================="
echo "2. Placing LONG-TERM Order"
echo "========================================="
LONG_TX=$(./build/tradeviewd tx clob place-order \
  "$ALICE" 0 $CLIENT_ID_LONG 0 1 1000000 100000 0 \
  --good-til-block-time $GTBT \
  --from alice \
  --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEES" \
  --gas 200000 \
  --broadcast-mode sync \
  -y 2>&1)

LONG_HASH=$(echo "$LONG_TX" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
echo "Long-Term Order TxHash: $LONG_HASH"
echo "$LONG_TX" | grep -E "OrderFlags|GoodTilOneof"
echo ""

echo "========================================="
echo "3. Waiting for Block Inclusion..."
echo "========================================="
sleep 5

# Verify short-term order
echo ""
echo "--- Short-Term Order Verification ---"
if [ -n "$SHORT_HASH" ]; then
    SHORT_RESULT=$(curl -s "http://localhost:26657/tx?hash=0x${SHORT_HASH}")
    if echo "$SHORT_RESULT" | jq -e '.result' > /dev/null 2>&1; then
        SHORT_HEIGHT=$(echo "$SHORT_RESULT" | jq -r '.result.height')
        SHORT_CODE=$(echo "$SHORT_RESULT" | jq -r '.result.tx_result.code')
        echo "✅ Included in block: $SHORT_HEIGHT"
        echo "   Status code: $SHORT_CODE"
        if [ "$SHORT_CODE" = "0" ]; then
            echo "   ✅ SUCCESS"
        else
            echo "   ❌ FAILED"
        fi
    else
        echo "⚠️  Not yet included"
    fi
else
    echo "❌ No transaction hash"
fi

# Verify long-term order
echo ""
echo "--- Long-Term Order Verification ---"
if [ -n "$LONG_HASH" ]; then
    LONG_RESULT=$(curl -s "http://localhost:26657/tx?hash=0x${LONG_HASH}")
    if echo "$LONG_RESULT" | jq -e '.result' > /dev/null 2>&1; then
        LONG_HEIGHT=$(echo "$LONG_RESULT" | jq -r '.result.height')
        LONG_CODE=$(echo "$LONG_RESULT" | jq -r '.result.tx_result.code')
        echo "✅ Included in block: $LONG_HEIGHT"
        echo "   Status code: $LONG_CODE"
        if [ "$LONG_CODE" = "0" ]; then
            echo "   ✅ SUCCESS"
        else
            echo "   ❌ FAILED"
        fipython3 -m http.server 8000
    else
        echo "⚠️  Not yet included"
    fi
else
    echo "❌ No transaction hash"
fi

echo ""
echo "========================================="
echo "4. Summary"
echo "========================================="
echo "Short-Term Order:"
echo "  Client ID: $CLIENT_ID_SHORT"
echo "  GoodTilBlock: $GTB"
echo "  TxHash: $SHORT_HASH"
echo ""
echo "Long-Term Order:"
echo "  Client ID: $CLIENT_ID_LONG"
echo "  GoodTilBlockTime: $GTBT"
echo "  TxHash: $LONG_HASH"
echo ""
echo "✅ Test Complete!"
