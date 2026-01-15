#!/bin/bash
# Verify Short-Term Orders - Multiple Methods
# Since short-term orders don't appear in /tx, we check other sources

set -e

echo "========================================="
echo "  Short-Term Order Verification"
echo "========================================="
echo ""

# Configuration
ALICE="dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4"
BOB="dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs"
CLOB_PAIR_ID=35  # TEST-USD market

# Get latest block height
LATEST_HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
echo "📊 Current block height: $LATEST_HEIGHT"
echo ""

# Method 1: Check for MsgProposedOperations in recent blocks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Method 1: Checking MsgProposedOperations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

START_HEIGHT=$((LATEST_HEIGHT - 10))
for height in $(seq $START_HEIGHT $LATEST_HEIGHT); do
    HAS_PROPOSED=$(curl -s "http://localhost:26657/block_results?height=$height" 2>/dev/null | \
        jq -r '.result.txs_results[]?.events[]? | select(.type == "message") | .attributes[] | select(.key == "action" and (.value | contains("MsgProposedOperations"))) | .value' 2>/dev/null)
    
    if [ ! -z "$HAS_PROPOSED" ]; then
        TX_COUNT=$(curl -s "http://localhost:26657/block?height=$height" | jq '.result.block.data.txs | length')
        echo "   ✅ Block $height: Found MsgProposedOperations ($TX_COUNT txs in block)"
    fi
done
echo ""

# Method 2: Check subaccount balances/positions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Method 2: Checking Subaccount State"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Alice's subaccount (owner: $ALICE, number: 0):"
docker exec protocol-dydxprotocold0-1 dydxprotocold query subaccounts get \
    "$ALICE" 0 --node tcp://localhost:26657 --output json 2>/dev/null | \
    jq '{
        perpetual_positions: .subaccount.perpetual_positions,
        asset_positions: .subaccount.asset_positions
    }' || echo "   ⚠️  Could not query Alice subaccount"

echo ""
echo "Bob's subaccount (owner: $BOB, number: 0):"
docker exec protocol-dydxprotocold1-1 dydxprotocold query subaccounts get \
    "$BOB" 0 --node tcp://localhost:26657 --output json 2>/dev/null | \
    jq '{
        perpetual_positions: .subaccount.perpetual_positions,
        asset_positions: .subaccount.asset_positions
    }' || echo "   ⚠️  Could not query Bob subaccount"

echo ""

# Method 3: Check CLOB pair state
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Method 3: CLOB Pair State"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "CLOB Pair $CLOB_PAIR_ID (TEST-USD) configuration:"
./build/dydxprotocold query clob list-clob-pair --node http://localhost:26657 --output json 2>/dev/null | \
    jq ".clob_pair[] | select(.id == $CLOB_PAIR_ID)" || echo "   ⚠️  Could not query CLOB pair"

echo ""

# Method 4: Check indexer database (if available)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Method 4: Indexer Database Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Recent orders in indexer database:"
docker exec indexer_postgres_1 psql -U dydx_dev -d dydx_dev -c \
    "SELECT id, \"subaccountId\", \"clientId\", side, size, price, status, type, \"createdAtHeight\", \"goodTilBlockTime\" 
     FROM orders 
     ORDER BY \"createdAtHeight\" DESC 
     LIMIT 10;" 2>/dev/null || echo "   ⚠️  Indexer database not accessible"

echo ""

# Method 5: Check indexer API (if comlink is working)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Method 5: Indexer REST API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Checking Comlink health:"
COMLINK_HEALTH=$(curl -s http://localhost:3002/v4/height 2>/dev/null)
if [ ! -z "$COMLINK_HEALTH" ]; then
    echo "   ✅ Comlink is responding: $COMLINK_HEALTH"
    
    echo ""
    echo "Alice's orders via API:"
    curl -s "http://localhost:3002/v4/orders?address=$ALICE&subaccountNumber=0&limit=5" 2>/dev/null | \
        jq '.' || echo "   ⚠️  API query failed"
else
    echo "   ⚠️  Comlink is not responding (check Redis connection)"
fi

echo ""
echo "========================================="
echo "  Verification Summary"
echo "========================================="
echo ""
echo "✅ Short-term orders are submitted via gRPC"
echo "✅ They appear in blocks as MsgProposedOperations"
echo "✅ They do NOT appear in /tx endpoint (by design)"
echo ""
echo "To verify execution:"
echo "  1. Check for MsgProposedOperations in blocks"
echo "  2. Monitor subaccount positions for changes"
echo "  3. Query indexer database (if Ender is processing)"
echo "  4. Use indexer REST API (if Comlink/Redis are healthy)"
echo ""
echo "Note: Short-term orders are MemClob operations,"
echo "      not standalone transactions in the tx index."
echo ""
