#!/bin/bash
# Optimized Short-Term Order Test
# Places orders immediately after GTB calculation for maximum inclusion chance

set -e

echo "========================================="
echo "  Optimized Short-Term Order Test"
echo "========================================="
echo ""

ALICE="tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy"
BOB="tradeview10fx7sy6ywd5senxae9dwytf8jxek3t2g22s7jp"
CHAIN_ID="localdydxprotocol"
FEES="5000000000000000adv4tnt,5000ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5"

echo "Step 1: Verifying subaccount funding..."
ALICE_BALANCE=$(curl -s "http://localhost:1317/dydxprotocol/subaccounts/subaccount/$ALICE/0" 2>/dev/null | jq -r '.subaccount.asset_positions[0].quantums // "0"')
BOB_BALANCE=$(curl -s "http://localhost:1317/dydxprotocol/subaccounts/subaccount/$BOB/0" 2>/dev/null | jq -r '.subaccount.asset_positions[0].quantums // "0"')

echo "   Alice: $ALICE_BALANCE quantums"
echo "   Bob: $BOB_BALANCE quantums"

if [ "$ALICE_BALANCE" = "0" ] || [ "$BOB_BALANCE" = "0" ]; then
    echo "   ❌ Subaccounts not funded!"
    exit 1
fi
echo "   ✅ Both accounts funded"
echo ""

echo "Step 2: Placing SHORT-TERM orders (immediate execution)..."
echo ""

# Calculate GTB and place orders IMMEDIATELY
CURRENT_HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
GTB=$((CURRENT_HEIGHT + 10))  # Increased window
CLIENT_ID=$(($(date +%s%N) % 1000000))

echo "   Current Height: $CURRENT_HEIGHT"
echo "   Good Til Block: $GTB (window: 10 blocks)"
echo "   Client ID Base: $CLIENT_ID"
echo ""

# Place Alice's order
echo "   [Alice] Placing BUY order (1M @ 100k)..."
ALICE_TX=$(docker exec protocol-dydxprotocold0-1 dydxprotocold tx clob place-order \
  "$ALICE" 0 $CLIENT_ID 0 1 1000000 100000 $GTB \
  --from alice --home /dydxprotocol/chain/.alice --keyring-backend test \
  --chain-id $CHAIN_ID --fees "$FEES" --gas 200000 \
  --broadcast-mode sync -y --node tcp://localhost:26657 2>&1)

ALICE_TXHASH=$(echo "$ALICE_TX" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
ALICE_CODE=$(echo "$ALICE_TX" | grep -oP 'code: \K[0-9]+' || echo "0")

if [ "$ALICE_CODE" = "0" ] && [ ! -z "$ALICE_TXHASH" ]; then
    echo "   ✅ Alice: $ALICE_TXHASH"
else
    echo "   ❌ Alice failed (code: $ALICE_CODE)"
    echo "$ALICE_TX" | grep -i error | head -2
fi

# Immediately place Bob's order (no sleep)
echo "   [Bob] Placing SELL order (1M @ 99k)..."
BOB_TX=$(docker exec protocol-dydxprotocold1-1 dydxprotocold tx clob place-order \
  "$BOB" 0 $((CLIENT_ID + 1)) 0 2 1000000 99000 $GTB \
  --from bob --home /dydxprotocol/chain/.bob --keyring-backend test \
  --chain-id $CHAIN_ID --fees "$FEES" --gas 200000 \
  --broadcast-mode sync -y --node tcp://localhost:26657 2>&1)

BOB_TXHASH=$(echo "$BOB_TX" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
BOB_CODE=$(echo "$BOB_TX" | grep -oP 'code: \K[0-9]+' || echo "0")

if [ "$BOB_CODE" = "0" ] && [ ! -z "$BOB_TXHASH" ]; then
    echo "   ✅ Bob: $BOB_TXHASH"
else
    echo "   ❌ Bob failed (code: $BOB_CODE)"
    echo "$BOB_TX" | grep -i error | head -2
fi

echo ""
echo "Step 3: Checking mempool..."
MEMPOOL=$(curl -s "http://localhost:26657/unconfirmed_txs?limit=50" 2>/dev/null)
N_TXS=$(echo "$MEMPOOL" | jq -r '.result.n_txs // "0"')
echo "   Transactions in mempool: $N_TXS"

if [ "$N_TXS" != "0" ]; then
    echo "   📋 Pending transactions:"
    echo "$MEMPOOL" | jq -r '.result.txs[]?.hash' 2>/dev/null | head -5 | while read hash; do
        echo "      - $hash"
    done
fi

echo ""
echo "Step 4: Waiting for block inclusion (15 seconds)..."
sleep 15

# Check inclusion with detailed output
check_tx() {
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
        GAS_USED=$(echo "$RESP" | jq -r '.result.tx_result.gas_used')
        
        if [ "$CODE" = "0" ]; then
            echo "   ✅ $name: INCLUDED at height $HEIGHT"
            echo "      Gas used: $GAS_USED"
            
            # Check for match events
            MATCH_EVENTS=$(echo "$RESP" | jq '[.result.tx_result.events[] | select(.type == "clob.match")] | length' 2>/dev/null)
            if [ "$MATCH_EVENTS" != "0" ] && [ ! -z "$MATCH_EVENTS" ]; then
                echo "      🎯 MATCHED! ($MATCH_EVENTS match events)"
                
                # Show match details
                echo "$RESP" | jq -r '.result.tx_result.events[] | select(.type == "clob.match") | .attributes[] | select(.key == "maker" or .key == "taker" or .key == "fill_amount") | "         \(.key): \(.value)"' 2>/dev/null | head -10
            fi
        else
            LOG=$(echo "$RESP" | jq -r '.result.tx_result.log')
            echo "   ❌ $name: FAILED at height $HEIGHT (code $CODE)"
            echo "      Error: $LOG"
        fi
    else
        echo "   ⚠️  $name: NOT INCLUDED"
        echo "      Possible reasons:"
        echo "      - GTB expired (current: $(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height'), GTB was: $GTB)"
        echo "      - Order filtered in PrepareProposal"
        echo "      - Insufficient collateral"
    fi
}

echo ""
check_tx "$ALICE_TXHASH" "Alice"
echo ""
check_tx "$BOB_TXHASH" "Bob"

echo ""
echo "Step 5: Final verification..."
FINAL_HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
echo "   Current height: $FINAL_HEIGHT"
echo "   GTB was: $GTB"
echo "   Blocks remaining: $((GTB - FINAL_HEIGHT))"

echo ""
echo "========================================="
echo "  Test Complete"
echo "========================================="
echo ""
echo "💡 Tips for successful order inclusion:"
echo "   1. Calculate GTB immediately before placing orders"
echo "   2. Use larger GTB window (10+ blocks)"
echo "   3. Place orders rapidly without delays"
echo "   4. Ensure subaccounts have sufficient collateral"
echo "   5. Check mempool to see if orders are pending"
echo ""
