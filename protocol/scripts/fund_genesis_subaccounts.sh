#!/bin/bash
# Fund subaccounts directly in genesis file
# This script modifies the genesis.json in the Docker container to add funded subaccounts

set -e

echo "========================================="
echo "  Funding Subaccounts in Genesis"
echo "========================================="
echo ""

# Wait for containers to be created
echo "Waiting for Docker containers to be ready..."
sleep 5

# Container name
CONTAINER="protocol-dydxprotocold0-1"

# Check if container exists
if ! docker ps -a | grep -q "$CONTAINER"; then
    echo "Error: Container $CONTAINER not found"
    echo "Please run 'make localnet-start' first"
    exit 1
fi

# Stop the container if running
echo "Stopping container..."
docker stop $CONTAINER 2>/dev/null || true

# Path to genesis in container
GENESIS_PATH="/dydxprotocol/chain/.alice/config/genesis.json"

echo "Modifying genesis file..."

# Add Alice's subaccount (1000 USDC = 1000000000 quantums)
docker exec $CONTAINER sh -c "
jq '.app_state.subaccounts.subaccounts += [{
  \"id\": {
    \"owner\": \"dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4\",
    \"number\": 0
  },
  \"asset_positions\": [{
    \"asset_id\": 0,
    \"quantums\": \"1000000000\",
    \"index\": 0
  }],
  \"perpetual_positions\": [],
  \"margin_enabled\": true
}]' $GENESIS_PATH > /tmp/genesis_temp.json && mv /tmp/genesis_temp.json $GENESIS_PATH
"

# Add Bob's subaccount (1000 USDC = 1000000000 quantums)
docker exec $CONTAINER sh -c "
jq '.app_state.subaccounts.subaccounts += [{
  \"id\": {
    \"owner\": \"dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs\",
    \"number\": 0
  },
  \"asset_positions\": [{
    \"asset_id\": 0,
    \"quantums\": \"1000000000\",
    \"index\": 0
  }],
  \"perpetual_positions\": [],
  \"margin_enabled\": true
}]' $GENESIS_PATH > /tmp/genesis_temp.json && mv /tmp/genesis_temp.json $GENESIS_PATH
"

# Copy genesis to all other validators
echo "Copying genesis to all validators..."
for validator in alice bob carl dave; do
    VALIDATOR_GENESIS="/dydxprotocol/chain/.$validator/config/genesis.json"
    docker exec $CONTAINER sh -c "cp $GENESIS_PATH $VALIDATOR_GENESIS" 2>/dev/null || true
done

echo ""
echo "✅ Genesis modified successfully!"
echo ""
echo "Funded subaccounts:"
echo "  - Alice (dydx199...): 1000 USDC"
echo "  - Bob (dydx10fx...): 1000 USDC"
echo ""
echo "Now restart the container:"
echo "  docker start $CONTAINER"
echo ""
