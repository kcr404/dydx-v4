#!/bin/bash

echo "========================================="
echo "  Comprehensive Order + Indexer Test"
echo "========================================="

ALICE="tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy"
INDEXER_HOST="10.30.21.162"

# Get current height
HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
echo -e "\n📊 Current Height: $HEIGHT"

# Test 1: Place LONG-TERM order (known to work)
echo -e "\n========================================="
echo "TEST 1: Long-Term Order (Control)"
echo "========================================="

GTB_TIME=$(($(date +%s) + 300))
CLIENT_ID_LT=$((RANDOM))

echo "Placing long-term order..."
echo "  Client ID: $CLIENT_ID_LT"
echo "  Good Til Time: $GTB_TIME"

LT_RESULT=$(docker exec protocol-tradeviewd0-1 tradeviewd tx clob place-order \
  $ALICE 0 $CLIENT_ID_LT 0 64 1000000 100000 $GTB_TIME \
  --from alice --keyring-backend test --chain-id localtradeview \
  --home /tradeview/chain/.alice \
  --fees "5000000000000000atvx" --gas 200000 --broadcast-mode sync -y 2>&1)

LT_TXHASH=$(echo "$LT_RESULT" | grep -oP 'txhash: \K[A-F0-9]+')
LT_CODE=$(echo "$LT_RESULT" | grep -oP 'code: \K[0-9]+')

echo "  TxHash: $LT_TXHASH"
echo "  Code: $LT_CODE"

# Test 2: Place SHORT-TERM order
echo -e "\n========================================="
echo "TEST 2: Short-Term Order (Testing)"
echo "========================================="

GTB=$((HEIGHT + 20))
CLIENT_ID_ST=$((RANDOM))

echo "Placing short-term order..."
echo "  Client ID: $CLIENT_ID_ST"
echo "  Good Til Block: $GTB"

ST_RESULT=$(docker exec protocol-tradeviewd0-1 tradeviewd tx clob place-order \
  $ALICE 0 $CLIENT_ID_ST 0 0 1000000 100000 $GTB \
  --from alice --keyring-backend test --chain-id localtradeview \
  --home /tradeview/chain/.alice \
  --fees "5000000000000000atvx" --gas 200000 --broadcast-mode sync -y 2>&1)

ST_TXHASH=$(echo "$ST_RESULT" | grep -oP 'txhash: \K[A-F0-9]+')
ST_CODE=$(echo "$ST_RESULT" | grep -oP 'code: \K[0-9]+')

echo "  TxHash: $ST_TXHASH"
echo "  Code: $ST_CODE"

# Wait for blocks
echo -e "\n⏳ Waiting 5 seconds for block inclusion..."
sleep 5

# Test 3: Check transaction queryability
echo -e "\n========================================="
echo "TEST 3: Transaction Queryability"
echo "========================================="

echo -e "\nLong-Term Order Transaction:"
LT_TX_RESULT=$(curl -s "http://localhost:26657/tx?hash=0x$LT_TXHASH" | jq -r '.result.tx_result.code // "NOT_FOUND"')
echo "  Query Result: $LT_TX_RESULT"

echo -e "\nShort-Term Order Transaction:"
ST_TX_RESULT=$(curl -s "http://localhost:26657/tx?hash=0x$ST_TXHASH" | jq -r '.result.tx_result.code // "NOT_FOUND"')
echo "  Query Result: $ST_TX_RESULT"

# Test 4: Check indexer database
echo -e "\n========================================="
echo "TEST 4: Indexer Database Check"
echo "========================================="

echo -e "\nQuerying indexer database for orders..."

# Query via indexer API
echo -e "\nVia Indexer REST API:"
INDEXER_ORDERS=$(curl -s "http://$INDEXER_HOST:3002/v4/orders?address=$ALICE&limit=10" 2>&1)

if echo "$INDEXER_ORDERS" | jq -e '.orders' > /dev/null 2>&1; then
    ORDER_COUNT=$(echo "$INDEXER_ORDERS" | jq '.orders | length')
    echo "  Total orders found: $ORDER_COUNT"
    
    # Check for our specific orders
    LT_FOUND=$(echo "$INDEXER_ORDERS" | jq ".orders[] | select(.clientId == \"$CLIENT_ID_LT\") | .clientId" 2>/dev/null)
    ST_FOUND=$(echo "$INDEXER_ORDERS" | jq ".orders[] | select(.clientId == \"$CLIENT_ID_ST\") | .clientId" 2>/dev/null)
    
    if [ -n "$LT_FOUND" ]; then
        echo "  ✅ Long-term order (Client ID: $CLIENT_ID_LT) FOUND"
    else
        echo "  ❌ Long-term order (Client ID: $CLIENT_ID_LT) NOT FOUND"
    fi
    
    if [ -n "$ST_FOUND" ]; then
        echo "  ✅ Short-term order (Client ID: $CLIENT_ID_ST) FOUND"
    else
        echo "  ❌ Short-term order (Client ID: $CLIENT_ID_ST) NOT FOUND"
    fi
else
    echo "  ⚠️  Could not connect to indexer API"
    echo "  Response: $INDEXER_ORDERS"
fi

# Test 5: Check indexer logs for events
echo -e "\n========================================="
echo "TEST 5: Indexer Service Logs"
echo "========================================="

echo -e "\nChecking indexer-socks logs for recent events..."
ssh -i ~/devnet-testnode-tradeview.pem ubuntu@$INDEXER_HOST \
    "docker logs indexer-socks-1 --tail 50 2>&1 | grep -i 'order\|event\|message' | tail -10" || echo "  Could not access indexer logs"

# Test 6: Check block events
echo -e "\n========================================="
echo "TEST 6: Block Events Analysis"
echo "========================================="

LATEST=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
echo -e "\nChecking last 3 blocks for events ($((LATEST-2)) to $LATEST)..."

for h in $(seq $((LATEST-2)) $LATEST); do
    echo -e "\n  Block $h:"
    
    # Count transactions
    TX_COUNT=$(curl -s "http://localhost:26657/block?height=$h" | jq '.result.block.data.txs | length')
    echo "    Transactions: $TX_COUNT"
    
    # Check for MsgProposedOperations
    PROPOSED_OPS=$(curl -s "http://localhost:26657/block_results?height=$h" | \
        jq -r '.result.txs_results[]?.events[]? | select(.type == "message") | .attributes[] | select(.value | contains("MsgProposedOperations"))' 2>/dev/null | wc -l)
    
    if [ "$PROPOSED_OPS" -gt 0 ]; then
        echo "    ✅ MsgProposedOperations: Found"
        
        # Check if this transaction has ANY events
        EVENT_COUNT=$(curl -s "http://localhost:26657/block_results?height=$h" | \
            jq '.result.txs_results[0].events | length' 2>/dev/null)
        echo "    Events in first TX: $EVENT_COUNT"
    fi
done

# Summary
echo -e "\n========================================="
echo "SUMMARY"
echo "========================================="

echo -e "\n📊 Order Placement:"
echo "  Long-Term:  Code $LT_CODE, TxHash: $LT_TXHASH"
echo "  Short-Term: Code $ST_CODE, TxHash: $ST_TXHASH"

echo -e "\n🔍 Transaction Queryability:"
echo "  Long-Term:  $LT_TX_RESULT"
echo "  Short-Term: $ST_TX_RESULT"

echo -e "\n📦 Indexer Status:"
if [ -n "$LT_FOUND" ]; then
    echo "  Long-Term:  ✅ Found in indexer"
else
    echo "  Long-Term:  ❌ Not in indexer"
fi

if [ -n "$ST_FOUND" ]; then
    echo "  Short-Term: ✅ Found in indexer"
else
    echo "  Short-Term: ❌ Not in indexer"
fi

echo -e "\n========================================="
echo "Test Complete!"
echo "========================================="
