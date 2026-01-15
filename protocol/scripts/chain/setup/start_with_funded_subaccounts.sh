#!/bin/bash
# Complete workflow: Start chain with funded subaccounts and test short-term orders

set -e

echo "========================================="
echo "  Starting Chain with Funded Subaccounts"
echo "========================================="
echo ""

# Step 1: Start the chain in detached mode
echo "Step 1: Starting localnet..."
sudo make localnet-startd

# Step 2: Wait for containers to initialize
echo ""
echo "Step 2: Waiting for containers to initialize..."
sleep 10

# Step 3: Stop containers to modify genesis
echo ""
echo "Step 3: Stopping containers to modify genesis..."
docker stop protocol-dydxprotocold0-1 protocol-dydxprotocold1-1 protocol-dydxprotocold2-1 protocol-dydxprotocold3-1 2>/dev/null || true

# Step 4: Modify genesis files
echo ""
echo "Step 4: Adding funded subaccounts to genesis..."

GENESIS_PATH="/dydxprotocol/chain/.alice/config/genesis.json"

# Backup original genesis
docker run --rm -v protocol_dydxprotocol0:/data alpine cp /data/chain/.alice/config/genesis.json /data/chain/.alice/config/genesis.json.backup 2>/dev/null || true

# Add funded subaccounts using jq
docker run --rm -v protocol_dydxprotocol0:/data alpine sh -c "
apk add --no-cache jq > /dev/null 2>&1
cd /data/chain/.alice/config
jq '.app_state.subaccounts.subaccounts += [
  {
    \"id\": {\"owner\": \"dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4\", \"number\": 0},
    \"asset_positions\": [{\"asset_id\": 0, \"quantums\": \"1000000000\", \"index\": 0}],
    \"perpetual_positions\": [],
    \"margin_enabled\": true
  },
  {
    \"id\": {\"owner\": \"dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs\", \"number\": 0},
    \"asset_positions\": [{\"asset_id\": 0, \"quantums\": \"1000000000\", \"index\": 0}],
    \"perpetual_positions\": [],
    \"margin_enabled\": true
  }
]' genesis.json > genesis_new.json && mv genesis_new.json genesis.json
"

# Copy to all validators
for i in 0 1 2 3; do
    docker run --rm -v protocol_dydxprotocol$i:/data alpine cp /data/chain/.alice/config/genesis.json /data/chain/.alice/config/genesis.json 2>/dev/null || true
done

echo "✅ Genesis modified with funded subaccounts"

# Step 5: Restart containers
echo ""
echo "Step 5: Restarting containers..."
docker start protocol-dydxprotocold0-1 protocol-dydxprotocold1-1 protocol-dydxprotocold2-1 protocol-dydxprotocold3-1

# Step 6: Wait for chain to start
echo ""
echo "Step 6: Waiting for chain to start producing blocks..."
sleep 15

# Step 7: Verify subaccounts
echo ""
echo "Step 7: Verifying subaccounts..."
./build/dydxprotocold query subaccounts show-subaccount alice 0 --output json | jq '.subaccount.asset_positions'
./build/dydxprotocold query subaccounts show-subaccount bob 0 --output json | jq '.subaccount.asset_positions'

# Step 8: Test short-term orders
echo ""
echo "Step 8: Testing short-term orders..."
./scripts/test_short_term_matching_fixed.sh

echo ""
echo "========================================="
echo "  Complete!"
echo "========================================="
