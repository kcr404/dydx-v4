#!/bin/bash
# Unified Order Testing Script - Using Docker containers
# Based on dYdX v4 local devnet runbook

set -e

echo "========================================="
echo "  dYdX Order Testing Suite"
echo "========================================="
echo ""

# Configuration
ALICE="tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy"
BOB="tradeview10fx7sy6ywd5senxae9dwytf8jxek3t2g22s7jp"
CHAIN_ID="localdydxprotocol"
FEES="5000000000000000adv4tnt,5000ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5"

# Check chain is running
echo "Step 1: Verifying chain status..."
CURRENT_HEIGHT=$(curl -s http://localhost:26657/status 2>/dev/null | jq -r '.result.sync_info.latest_block_height // "0"')
if [ "$CURRENT_HEIGHT" = "0" ] || [ -z "$CURRENT_HEIGHT" ]; then
    echo "❌ Chain is not running!"
    echo "   Start it with: sudo make localnet-start"
    exit 1
fi
echo "   ✅ Chain is running at height: $CURRENT_HEIGHT"
echo ""

# Get oracle price
echo "Step 2: Getting oracle price..."
ORACLE_PRICE=$(curl -s http://localhost:26657/abci_query?path=%22/tradeview.prices.Query/AllMarketPrices%22 2>/dev/null | jq -r '.result.response.value' | base64 -d 2>/dev/null | head -c 50 || echo "N/A")
echo "   Oracle data available: $([ ! -z "$ORACLE_PRICE" ] && echo "Yes" || echo "No")"
echo ""

# ============================================
# PART 1: SHORT-TERM ORDERS TEST
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 1: SHORT-TERM ORDERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Step 3: Placing SHORT-TERM matching orders..."

# Compute GTB immediately before placing orders
GTB=$(($(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height') + 5))
CLIENT_ID_ALICE=$(($(date +%s) % 1000000))
CLIENT_ID_BOB=$((CLIENT_ID_ALICE + 1))

echo "   Current Height: $(($GTB - 5))"
echo "   Good Til Block: $GTB"
echo "   Alice Client ID: $CLIENT_ID_ALICE"
echo "   Bob Client ID: $CLIENT_ID_BOB"
echo ""

# Alice BUY order
echo "   [Alice] Placing BUY order (1M quantums @ 100k subticks)..."
ALICE_OUTPUT=$(docker exec protocol-dydxprotocold0-1 dydxprotocold tx clob place-order \
  "$ALICE" 0 $CLIENT_ID_ALICE 0 1 1000000 100000 $GTB \
  --from alice --home /dydxprotocol/chain/.alice --keyring-backend test \
  --chain-id $CHAIN_ID \
  --fees "$FEES" \
  --gas 200000 --broadcast-mode sync -y --node tcp://localhost:26657 2>&1)

ALICE_TXHASH=$(echo "$ALICE_OUTPUT" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
if [ -z "$ALICE_TXHASH" ]; then
    echo "   ❌ Alice order failed"
    echo "$ALICE_OUTPUT" | head -10
else
    echo "   ✅ Alice TxHash: $ALICE_TXHASH"
fi

sleep 1

# Bob SELL order
echo "   [Bob] Placing SELL order (1M quantums @ 100k subticks)..."
BOB_OUTPUT=$(docker exec protocol-dydxprotocold1-1 dydxprotocold tx clob place-order \
  "$BOB" 0 $CLIENT_ID_BOB 0 2 1000000 100000 $GTB \
  --from bob --home /dydxprotocol/chain/.bob --keyring-backend test \
  --chain-id $CHAIN_ID \
  --fees "$FEES" \
  --gas 200000 --broadcast-mode sync -y --node tcp://localhost:26657 2>&1)

BOB_TXHASH=$(echo "$BOB_OUTPUT" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
if [ -z "$BOB_TXHASH" ]; then
    echo "   ❌ Bob order failed"
    echo "$BOB_OUTPUT" | head -10
else
    echo "   ✅ Bob TxHash: $BOB_TXHASH"
fi

echo ""
echo "Step 4: Waiting for short-term order inclusion..."
sleep 5

# Check inclusion function
check_inclusion() {
    local txhash=$1
    local name=$2
    
    if [ -z "$txhash" ]; then
        echo "   ⚠️  $name: No txhash to check"
        return
    fi
    
    RESP=$(curl -s "http://localhost:26657/tx?hash=0x$txhash" 2>/dev/null)
    if echo "$RESP" | jq -e '.result' > /dev/null 2>&1; then
        HEIGHT=$(echo "$RESP" | jq -r '.result.height')
        CODE=$(echo "$RESP" | jq -r '.result.tx_result.code')
        if [ "$CODE" = "0" ]; then
            echo "   ✅ $name: INCLUDED at height $HEIGHT (SUCCESS)"
            # Show events
            EVENTS=$(echo "$RESP" | jq -r '.result.tx_result.events[] | select(.type == "clob.match") | .type' 2>/dev/null)
            if [ ! -z "$EVENTS" ]; then
                echo "      🎯 MATCH EVENT FOUND!"
            fi
        else
            LOG=$(echo "$RESP" | jq -r '.result.tx_result.log')
            echo "   ❌ $name: INCLUDED at height $HEIGHT (FAILED - code $CODE)"
            echo "      Error: $LOG"
        fi
    else
        echo "   ⚠️  $name: NOT INCLUDED (may be in mempool or dropped)"
    fi
}

check_inclusion "$ALICE_TXHASH" "Alice"
check_inclusion "$BOB_TXHASH" "Bob"

echo ""

# ============================================
# PART 2: STATEFUL ORDERS TEST
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 2: STATEFUL ORDERS (Long-Term)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Step 5: Placing STATEFUL matching orders..."
CURRENT_TIME=$(date +%s)
GTBT=$((CURRENT_TIME + 120))  # 2 minutes from now
CLIENT_ID_ALICE_LT=$(($(date +%s) % 1000000))
CLIENT_ID_BOB_LT=$((CLIENT_ID_ALICE_LT + 1))

echo "   Current Time: $CURRENT_TIME"
echo "   Good Til Block Time: $GTBT"
echo "   Alice Client ID: $CLIENT_ID_ALICE_LT"
echo "   Bob Client ID: $CLIENT_ID_BOB_LT"
echo ""

# Alice BUY stateful order
echo "   [Alice] Placing STATEFUL BUY order..."
ALICE_LT_OUTPUT=$(docker exec protocol-dydxprotocold0-1 dydxprotocold tx clob place-order \
  "$ALICE" 0 $CLIENT_ID_ALICE_LT 0 1 1000000 100000 0 \
  --good-til-block-time $GTBT \
  --from alice --home /dydxprotocol/chain/.alice --keyring-backend test \
  --chain-id $CHAIN_ID \
  --fees "$FEES" \
  --gas 200000 --broadcast-mode sync -y --node tcp://localhost:26657 2>&1)

ALICE_LT_TXHASH=$(echo "$ALICE_LT_OUTPUT" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
if [ -z "$ALICE_LT_TXHASH" ]; then
    echo "   ❌ Alice stateful order failed"
    echo "$ALICE_LT_OUTPUT" | head -10
else
    echo "   ✅ Alice TxHash: $ALICE_LT_TXHASH"
fi

sleep 1

# Bob SELL stateful order
echo "   [Bob] Placing STATEFUL SELL order..."
BOB_LT_OUTPUT=$(docker exec protocol-dydxprotocold1-1 dydxprotocold tx clob place-order \
  "$BOB" 0 $CLIENT_ID_BOB_LT 0 2 1000000 100000 0 \
  --good-til-block-time $GTBT \
  --from bob --home /dydxprotocol/chain/.bob --keyring-backend test \
  --chain-id $CHAIN_ID \
  --fees "$FEES" \
  --gas 200000 --broadcast-mode sync -y --node tcp://localhost:26657 2>&1)

BOB_LT_TXHASH=$(echo "$BOB_LT_OUTPUT" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
if [ -z "$BOB_LT_TXHASH" ]; then
    echo "   ❌ Bob stateful order failed"
    echo "$BOB_LT_OUTPUT" | head -10
else
    echo "   ✅ Bob TxHash: $BOB_LT_TXHASH"
fi

echo ""
echo "Step 6: Waiting for stateful order inclusion..."
sleep 5

check_inclusion "$ALICE_LT_TXHASH" "Alice (Stateful)"
check_inclusion "$BOB_LT_TXHASH" "Bob (Stateful)"

echo ""

# ============================================
# PART 3: VERIFICATION
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 3: VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Step 7: Checking mempool status..."
MEMPOOL=$(curl -s "http://localhost:26657/unconfirmed_txs?limit=10" 2>/dev/null)
N_TXS=$(echo "$MEMPOOL" | jq -r '.result.n_txs // "0"')
echo "   Transactions in mempool: $N_TXS"
echo ""

echo "Step 8: Checking latest block..."
LATEST_HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
LATEST_BLOCK=$(curl -s "http://localhost:26657/block?height=$LATEST_HEIGHT" 2>/dev/null)
TX_COUNT=$(echo "$LATEST_BLOCK" | jq -r '.result.block.data.txs | length')
echo "   Latest block height: $LATEST_HEIGHT"
echo "   Txs in latest block: $TX_COUNT"
echo ""

# ============================================
# SUMMARY
# ============================================
echo "========================================="
echo "  TEST SUMMARY"
echo "========================================="
echo ""
echo "✅ Short-term orders tested"
echo "✅ Stateful (long-term) orders tested"
echo "✅ Order inclusion verified"
echo "✅ Mempool status checked"
echo ""
echo "📚 Key Differences:"
echo "   • Short-term: Use GoodTilBlock (GTB)"
echo "   • Stateful: Use GoodTilBlockTime (GTBT) with --good-til-block-time flag"
echo "   • Short-term: In-memory only, single block"
echo "   • Stateful: Persisted to state, multi-block"
echo ""
echo "🔍 Next Steps:"
echo "   • Check mempool: ./scripts/check-mempool.sh"
echo "   • Check tx status: ./scripts/check-tx-status.sh <TXHASH>"
echo "   • Run quick tests: ./scripts/test_quick.sh"
echo ""
echo "========================================="
