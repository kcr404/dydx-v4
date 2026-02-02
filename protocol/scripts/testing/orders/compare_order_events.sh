#!/bin/bash

echo "========================================="
echo "  Comparing Short-Term vs Long-Term Order Events"
echo "========================================="

ALICE="tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy"

# Get current height
HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
echo "Current Height: $HEIGHT"

GTB=$((HEIGHT + 50))
GTBT=$(($(date +%s) + 300))  # 5 minutes from now

echo -e "\n========================================="
echo "  1. PLACING LONG-TERM ORDER"
echo "========================================="

CLIENT_ID_LT=$((RANDOM))
echo "ClientID: $CLIENT_ID_LT"
echo "GoodTilBlockTime: $GTBT"

LT_OUTPUT=$(docker exec protocol-tradeviewd0-1 tradeviewd tx clob place-order \
  $ALICE 0 $CLIENT_ID_LT 0 64 1000000 100000 $GTBT \
  --from alice --keyring-backend test --chain-id localtradeview \
  --home /tradeview/chain/.alice \
  --fees "5000000000000000atvx" --gas 200000 --broadcast-mode sync -y 2>&1)

LT_TXHASH=$(echo "$LT_OUTPUT" | grep "txhash:" | awk '{print $2}')
echo "Long-Term TxHash: $LT_TXHASH"

sleep 3

echo -e "\n========================================="
echo "  2. PLACING SHORT-TERM ORDER"
echo "========================================="

CLIENT_ID_ST=$((RANDOM))
echo "ClientID: $CLIENT_ID_ST"
echo "GoodTilBlock: $GTB"

ST_OUTPUT=$(docker exec protocol-tradeviewd0-1 tradeviewd tx clob place-order \
  $ALICE 0 $CLIENT_ID_ST 0 0 1000000 100000 $GTB \
  --from alice --keyring-backend test --chain-id localtradeview \
  --home /tradeview/chain/.alice \
  --fees "5000000000000000atvx" --gas 200000 --broadcast-mode sync -y 2>&1)

ST_TXHASH=$(echo "$ST_OUTPUT" | grep "txhash:" | awk '{print $2}')
echo "Short-Term TxHash: $ST_TXHASH"

sleep 5

echo -e "\n========================================="
echo "  3. COMPARING TRANSACTION EVENTS"
echo "========================================="

echo -e "\n--- LONG-TERM ORDER EVENTS ---"
curl -s "http://localhost:26657/tx?hash=0x$LT_TXHASH" | jq '.result.tx_result.events[] | select(.type == "message" or .type == "order_fill" or .type == "transfer" or .type == "coin_spent" or .type == "coin_received")' 2>/dev/null

echo -e "\n--- SHORT-TERM ORDER EVENTS ---"
curl -s "http://localhost:26657/tx?hash=0x$ST_TXHASH" | jq '.result.tx_result.events[] | select(.type == "message" or .type == "order_fill" or .type == "transfer" or .type == "coin_spent" or .type == "coin_received")' 2>/dev/null

echo -e "\n========================================="
echo "  4. CHECKING BLOCK INCLUSION"
echo "========================================="

LATEST=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')

echo -e "\nSearching for transactions in recent blocks ($((LATEST - 10)) to $LATEST)..."

for height in $(seq $((LATEST - 10)) $LATEST); do
    BLOCK_TXS=$(curl -s "http://localhost:26657/block?height=$height" | jq -r '.result.block.data.txs[]?' 2>/dev/null)
    
    if echo "$BLOCK_TXS" | grep -q "$LT_TXHASH"; then
        echo "✓ Long-term order found in block $height"
    fi
    
    if echo "$BLOCK_TXS" | grep -q "$ST_TXHASH"; then
        echo "✓ Short-term order found in block $height"
    fi
done

echo -e "\n========================================="
echo "  5. CHECKING MSGPROPOSEDOPERATIONS"
echo "========================================="

echo -e "\nChecking if orders appear in MsgProposedOperations..."

for height in $(seq $((LATEST - 10)) $LATEST); do
    PROPOSED_OPS=$(curl -s "http://localhost:26657/block_results?height=$height" | \
        jq -r '.result.txs_results[]?.events[]? | select(.type == "message") | .attributes[] | select(.value | contains("MsgProposedOperations"))' 2>/dev/null)
    
    if [ -n "$PROPOSED_OPS" ]; then
        echo "Block $height: MsgProposedOperations present"
        
        # Try to decode and check for our client IDs
        curl -s "http://localhost:26657/block_results?height=$height" | \
            jq -r '.result.txs_results[]?.events[]? | select(.type == "message")' 2>/dev/null | \
            grep -E "MsgProposedOperations|$CLIENT_ID_LT|$CLIENT_ID_ST" || true
    fi
done

echo -e "\n========================================="
echo "  6. FULL EVENT DUMP FOR COMPARISON"
echo "========================================="

echo -e "\n--- LONG-TERM ORDER FULL TX RESULT ---"
curl -s "http://localhost:26657/tx?hash=0x$LT_TXHASH" | jq '.result.tx_result' 2>/dev/null > /tmp/lt_order_events.json
cat /tmp/lt_order_events.json

echo -e "\n--- SHORT-TERM ORDER FULL TX RESULT ---"
curl -s "http://localhost:26657/tx?hash=0x$ST_TXHASH" | jq '.result.tx_result' 2>/dev/null > /tmp/st_order_events.json
cat /tmp/st_order_events.json

echo -e "\n========================================="
echo "  7. SUMMARY"
echo "========================================="

echo ""
echo "Long-Term Order:"
echo "  ClientID: $CLIENT_ID_LT"
echo "  TxHash: $LT_TXHASH"
echo "  OrderFlags: 64 (LONG_TERM)"
echo "  GoodTilBlockTime: $GTBT"

echo ""
echo "Short-Term Order:"
echo "  ClientID: $CLIENT_ID_ST"
echo "  TxHash: $ST_TXHASH"
echo "  OrderFlags: 0 (SHORT_TERM)"
echo "  GoodTilBlock: $GTB"

echo ""
echo "Event comparison files saved:"
echo "  /tmp/lt_order_events.json"
echo "  /tmp/st_order_events.json"

echo ""
echo "To compare differences:"
echo "  diff /tmp/lt_order_events.json /tmp/st_order_events.json"

echo -e "\n========================================="
