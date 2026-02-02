#!/bin/bash

echo "========================================="
echo "  Testing Multiple Short-Term Orders"
echo "========================================="

ALICE="tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy"

# Get current height
HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
echo "Current Height: $HEIGHT"

# Place 3 BUY orders
echo -e "\n📊 Placing 3 BUY orders..."
for i in {1..3}; do
    GTB=$((HEIGHT + 20))
    CLIENT_ID=$((RANDOM))
    
    echo "  Order $i: ClientID=$CLIENT_ID, GTB=$GTB"
    docker exec protocol-tradeviewd0-1 tradeviewd tx clob place-order \
      $ALICE 0 $CLIENT_ID 0 1 1000000 100000 $GTB \
      --from alice --keyring-backend test --chain-id localtradeview \
      --home /tradeview/chain/.alice \
      --fees "5000000000000000atvx" --gas 200000 --broadcast-mode sync -y 2>&1 | grep -E "txhash|code:"
    
    sleep 1
done

# Place 3 SELL orders
echo -e "\n📊 Placing 3 SELL orders..."
for i in {1..3}; do
    GTB=$((HEIGHT + 20))
    CLIENT_ID=$((RANDOM))
    
    echo "  Order $i: ClientID=$CLIENT_ID, GTB=$GTB"
    docker exec protocol-tradeviewd0-1 tradeviewd tx clob place-order \
      $ALICE 0 $CLIENT_ID 1 1 1000000 100000 $GTB \
      --from alice --keyring-backend test --chain-id localtradeview \
      --home /tradeview/chain/.alice \
      --fees "5000000000000000atvx" --gas 200000 --broadcast-mode sync -y 2>&1 | grep -E "txhash|code:"
    
    sleep 1
done

# Wait for orders to be included
echo -e "\n⏳ Waiting for orders to be included in blocks..."
sleep 5

# Verify in recent blocks
LATEST=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
echo -e "\n✅ Checking MsgProposedOperations in blocks $((LATEST - 5)) to $LATEST..."

for height in $(seq $((LATEST - 5)) $LATEST); do
    RESULT=$(curl -s "http://localhost:26657/block_results?height=$height" | \
        jq -r '.result.txs_results[]?.events[]? | select(.type == "message") | .attributes[] | select(.value | contains("MsgProposedOperations"))' 2>/dev/null)
    
    if [ -n "$RESULT" ]; then
        echo "  ✅ Block $height: MsgProposedOperations found"
    fi
done

# Check Alice's subaccount
echo -e "\n📊 Checking Alice's subaccount positions..."
curl -s "http://localhost:1317/dydxprotocol/subaccounts/subaccount/$ALICE/0" | \
    jq '{perpetual_positions: .subaccount.perpetual_positions, asset_positions: .subaccount.asset_positions}'

echo -e "\n========================================="
echo "  ✅ Test Complete!"
echo "========================================="
