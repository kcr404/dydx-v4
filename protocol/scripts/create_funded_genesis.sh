#!/bin/bash
# Manually add funded subaccounts to genesis

set -e

echo "Creating genesis with funded subaccounts..."

# Export current genesis
docker run --rm -v $(pwd)/localnet:/root/.dydxprotocol dydxprotocol-base \
  dydxprotocold export > genesis_export.json 2>/dev/null || echo "Using existing genesis"

# If export failed, use a template
if [ ! -f genesis_export.json ]; then
  echo "No existing genesis, will modify after chain init..."
  exit 1
fi

# Add Alice's subaccount with 1000 USDC (1000000000 quantums)
jq '.app_state.subaccounts.subaccounts += [{
  "id": {
    "owner": "dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4",
    "number": 0
  },
  "asset_positions": [{
    "asset_id": 0,
    "quantums": "1000000000",
    "index": 0
  }],
  "perpetual_positions": [],
  "margin_enabled": true
}]' genesis_export.json > genesis_with_alice.json

# Add Bob's subaccount with 1000 USDC
jq '.app_state.subaccounts.subaccounts += [{
  "id": {
    "owner": "dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs",
    "number": 0
  },
  "asset_positions": [{
    "asset_id": 0,
    "quantums": "1000000000",
    "index": 0
  }],
  "perpetual_positions": [],
  "margin_enabled": true
}]' genesis_with_alice.json > genesis_final.json

echo "Genesis file created with funded subaccounts"
echo "File: genesis_final.json"
