#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Short-Term Orders - Complete Test${NC}"
echo -e "${BLUE}=========================================${NC}"

# Configuration
ALICE="tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy"
CHAIN_ID="localtradeview"
HOME_DIR="/tradeview/chain/.alice"

# Get current height
HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
echo -e "\n${YELLOW}📊 Current Block Height: $HEIGHT${NC}"

# Function to place order
place_order() {
    local SIDE=$1
    local CLIENT_ID=$2
    local GTB=$3
    
    echo -e "${BLUE}  Placing $SIDE order (ClientID: $CLIENT_ID, GTB: $GTB)...${NC}"
    
    RESULT=$(docker exec protocol-tradeviewd0-1 tradeviewd tx clob place-order \
        $ALICE 0 $CLIENT_ID $SIDE 1 1000000 100000 $GTB \
        --from alice --keyring-backend test --chain-id $CHAIN_ID \
        --home $HOME_DIR \
        --fees "5000000000000000atvx" --gas 200000 --broadcast-mode sync -y 2>&1)
    
    TXHASH=$(echo "$RESULT" | grep "txhash:" | awk '{print $2}')
    CODE=$(echo "$RESULT" | grep "^code:" | awk '{print $2}')
    
    if [ "$CODE" == "0" ]; then
        echo -e "${GREEN}    ✅ Success! TxHash: $TXHASH${NC}"
        return 0
    else
        echo -e "${RED}    ❌ Failed! Code: $CODE${NC}"
        return 1
    fi
}

# Place orders
echo -e "\n${YELLOW}📝 Placing Orders...${NC}"
GTB=$((HEIGHT + 20))

BUY_COUNT=0
SELL_COUNT=0

# Place 3 BUY orders
echo -e "\n${BLUE}BUY Orders:${NC}"
for i in {1..3}; do
    if place_order 0 $((RANDOM)) $GTB; then
        ((BUY_COUNT++))
    fi
    sleep 1
done

# Place 3 SELL orders
echo -e "\n${BLUE}SELL Orders:${NC}"
for i in {1..3}; do
    if place_order 1 $((RANDOM)) $GTB; then
        ((SELL_COUNT++))
    fi
    sleep 1
done

echo -e "\n${YELLOW}📊 Orders Summary:${NC}"
echo -e "  ${GREEN}✅ BUY orders placed: $BUY_COUNT/3${NC}"
echo -e "  ${GREEN}✅ SELL orders placed: $SELL_COUNT/3${NC}"

# Wait for inclusion
echo -e "\n${YELLOW}⏳ Waiting for orders to be included in blocks...${NC}"
sleep 5

# Verify in blocks
LATEST=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
START_BLOCK=$((LATEST - 5))

echo -e "\n${YELLOW}🔍 Verifying MsgProposedOperations in blocks $START_BLOCK to $LATEST...${NC}"

FOUND_COUNT=0
for height in $(seq $START_BLOCK $LATEST); do
    RESULT=$(curl -s "http://localhost:26657/block_results?height=$height" | \
        jq -r '.result.txs_results[]?.events[]? | select(.type == "message") | .attributes[] | select(.value | contains("MsgProposedOperations"))' 2>/dev/null)
    
    if [ -n "$RESULT" ]; then
        echo -e "  ${GREEN}✅ Block $height: MsgProposedOperations found${NC}"
        ((FOUND_COUNT++))
    fi
done

if [ $FOUND_COUNT -gt 0 ]; then
    echo -e "\n${GREEN}✅ Orders successfully included in $FOUND_COUNT blocks!${NC}"
else
    echo -e "\n${RED}❌ No MsgProposedOperations found!${NC}"
fi

# Check specific block details
echo -e "\n${YELLOW}�� Block $LATEST Details:${NC}"
TX_COUNT=$(curl -s "http://localhost:26657/block?height=$LATEST" | jq '.result.block.data.txs | length')
echo -e "  Transactions in block: $TX_COUNT"

# Check account status
echo -e "\n${YELLOW}👤 Alice's Account Status:${NC}"
ACCOUNT=$(curl -s "http://localhost:1317/dydxprotocol/subaccounts/subaccount/$ALICE/0" | jq)
USDC_BALANCE=$(echo "$ACCOUNT" | jq -r '.subaccount.asset_positions[0].quantums // "0"')
POSITIONS=$(echo "$ACCOUNT" | jq -r '.subaccount.perpetual_positions | length')

echo -e "  USDC Balance: ${GREEN}$USDC_BALANCE${NC}"
echo -e "  Open Positions: ${YELLOW}$POSITIONS${NC}"

# Summary
echo -e "\n${BLUE}=========================================${NC}"
echo -e "${GREEN}✅ Test Complete!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "  Orders Placed: ${GREEN}$((BUY_COUNT + SELL_COUNT))/6${NC}"
echo -e "  Blocks with Orders: ${GREEN}$FOUND_COUNT${NC}"
echo -e "  Current Height: ${YELLOW}$LATEST${NC}"
echo -e "${BLUE}=========================================${NC}"
