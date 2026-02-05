#!/bin/bash
# Fund Subaccounts and Test Orders
# This script funds Alice and Bob's subaccounts via bank module and then tests orders

set -e

echo "========================================="
echo "  Fund Subaccounts & Test Orders"
echo "========================================="
echo ""

ALICE="tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy"
BOB="tradeview10fx7sy6ywd5senxae9dwytf8jxek3t2g22s7jp"
CHAIN_ID="localtradeview"
USDC_DENOM="ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5"
NATIVE_DENOM="adv4tnt"

echo "Step 1: Checking current balances..."
echo ""
echo "Alice's bank balance:"
docker exec protocol-dydxprotocold0-1 dydxprotocold query bank balances $ALICE --output json 2>&1 | jq '.balances' || echo "No balances"

echo ""
echo "Bob's bank balance:"
docker exec protocol-dydxprotocold1-1 dydxprotocold query bank balances $BOB --output json 2>&1 | jq '.balances' || echo "No balances"

echo ""
echo "Alice's subaccount:"
curl -s "http://localhost:1317/dydxprotocol/subaccounts/subaccount/$ALICE/0" 2>/dev/null | jq '.subaccount' || echo "No subaccount"

echo ""
echo "Bob's subaccount:"
curl -s "http://localhost:1317/dydxprotocol/subaccounts/subaccount/$BOB/0" 2>/dev/null | jq '.subaccount' || echo "No subaccount"

echo ""
echo "========================================="
echo "Step 2: Depositing to subaccounts..."
echo "========================================="
echo ""

# Alice deposit
echo "Depositing 1000 USDC to Alice's subaccount..."
ALICE_DEPOSIT=$(docker exec protocol-dydxprotocold0-1 dydxprotocold tx sending deposit-to-subaccount \
  $ALICE 0 0 1000000000 \
  --from alice --home /dydxprotocol/chain/.alice --keyring-backend test \
  --chain-id $CHAIN_ID \
  --fees "5000000000000000${NATIVE_DENOM}" \
  --gas 200000 \
  --broadcast-mode block \
  --yes 2>&1)

echo "$ALICE_DEPOSIT" | grep -E "(code|txhash)" || echo "$ALICE_DEPOSIT"

sleep 2

# Bob deposit
echo ""
echo "Depositing 1000 USDC to Bob's subaccount..."
BOB_DEPOSIT=$(docker exec protocol-dydxprotocold1-1 dydxprotocold tx sending deposit-to-subaccount \
  $BOB 0 0 1000000000 \
  --from bob --home /dydxprotocol/chain/.bob --keyring-backend test \
  --chain-id $CHAIN_ID \
  --fees "5000000000000000${NATIVE_DENOM}" \
  --gas 200000 \
  --broadcast-mode block \
  --yes 2>&1)

echo "$BOB_DEPOSIT" | grep -E "(code|txhash)" || echo "$BOB_DEPOSIT"

echo ""
echo "========================================="
echo "Step 3: Verifying subaccount funding..."
echo "========================================="
echo ""

sleep 3

echo "Alice's subaccount after deposit:"
curl -s "http://localhost:1317/dydxprotocol/subaccounts/subaccount/$ALICE/0" 2>/dev/null | jq '.subaccount.asset_positions'

echo ""
echo "Bob's subaccount after deposit:"
curl -s "http://localhost:1317/dydxprotocol/subaccounts/subaccount/$BOB/0" 2>/dev/null | jq '.subaccount.asset_positions'

echo ""
echo "========================================="
echo "Step 4: Testing orders with funded accounts..."
echo "========================================="
echo ""

# Get GTB
GTB=$(($(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height') + 5))
CLIENT_ID_ALICE=$(($(date +%s%N) % 1000000))
CLIENT_ID_BOB=$((CLIENT_ID_ALICE + 1))

echo "Good Til Block: $GTB"
echo "Alice Client ID: $CLIENT_ID_ALICE"
echo "Bob Client ID: $CLIENT_ID_BOB"
echo ""

# Alice BUY
echo "[Alice] Placing BUY order..."
ALICE_ORDER=$(docker exec protocol-dydxprotocold0-1 dydxprotocold tx clob place-order \
  "$ALICE" 0 $CLIENT_ID_ALICE 0 1 1000000 100000 $GTB \
  --from alice --home /dydxprotocol/chain/.alice --keyring-backend test \
  --chain-id $CHAIN_ID \
  --fees "5000000000000000${NATIVE_DENOM},5000${USDC_DENOM}" \
  --gas 200000 \
  --broadcast-mode sync \
  --yes \
  --node tcp://localhost:26657 2>&1)

ALICE_TXHASH=$(echo "$ALICE_ORDER" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
echo "Alice TxHash: $ALICE_TXHASH"

sleep 1

# Bob SELL
echo "[Bob] Placing SELL order..."
BOB_ORDER=$(docker exec protocol-dydxprotocold1-1 dydxprotocold tx clob place-order \
  "$BOB" 0 $CLIENT_ID_BOB 0 2 1000000 100000 $GTB \
  --from bob --home /dydxprotocol/chain/.bob --keyring-backend test \
  --chain-id $CHAIN_ID \
  --fees "5000000000000000${NATIVE_DENOM},5000${USDC_DENOM}" \
  --gas 200000 \
  --broadcast-mode sync \
  --yes \
  --node tcp://localhost:26657 2>&1)

BOB_TXHASH=$(echo "$BOB_ORDER" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
echo "Bob TxHash: $BOB_TXHASH"

echo ""
echo "Waiting for inclusion..."
sleep 5

# Check inclusion
check_tx() {
    local txhash=$1
    local name=$2
    
    if [ -z "$txhash" ]; then
        echo "⚠️  $name: No txhash"
        return
    fi
    
    RESP=$(curl -s "http://localhost:26657/tx?hash=0x$txhash" 2>/dev/null)
    if echo "$RESP" | jq -e '.result' > /dev/null 2>&1; then
        HEIGHT=$(echo "$RESP" | jq -r '.result.height')
        CODE=$(echo "$RESP" | jq -r '.result.tx_result.code')
        if [ "$CODE" = "0" ]; then
            echo "✅ $name: INCLUDED at height $HEIGHT"
            MATCH=$(echo "$RESP" | jq '[.result.tx_result.events[] | select(.type == "clob.match")] | length')
            if [ "$MATCH" != "0" ]; then
                echo "   🎯 MATCHED!"
            fi
        else
            echo "❌ $name: FAILED (code $CODE)"
        fi
    else
        echo "⚠️  $name: NOT INCLUDED"
    fi
}

check_tx "$ALICE_TXHASH" "Alice"
check_tx "$BOB_TXHASH" "Bob"

echo ""
echo "========================================="
echo "✅ Complete!"
echo "========================================="
