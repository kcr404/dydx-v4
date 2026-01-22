#!/bin/bash
set -e

echo "==================================="
echo "  Bridge Flow Test"
echo "==================================="
echo ""

# 1. Check bridge module state
echo "Step 1: Checking bridge module state..."
./build/dydxprotocold query bridge get-event-params --node http://localhost:26657
echo ""

# 2. Query Ethereum for events
echo "Step 2: Querying Ethereum for bridge events..."
echo "(Using Sepolia testnet)"
go run scripts/bridge_events/bridge_events.go \
  -rpc https://eth-sepolia.g.alchemy.com/v2/demo \
  -address 0xcca9D5f0a3c58b6f02BD0985fC7F9420EA24C1f0 \
  -toblock 7000000
echo ""

# 3. Check bridge module account balance
echo "Step 3: Checking bridge module account..."
BRIDGE_ADDR=$(./build/dydxprotocold query auth module-account bridge --node http://localhost:26657 -o json 2>/dev/null | jq -r '.account.base_account.address' || echo "")

if [ -n "$BRIDGE_ADDR" ]; then
    echo "Bridge module address: $BRIDGE_ADDR"
    ./build/dydxprotocold query bank balances "$BRIDGE_ADDR" --node http://localhost:26657
else
    echo "⚠️  Bridge module account not found (this is normal for fresh localnet)"
fi
echo ""

echo "==================================="
echo "✅ Bridge Flow Test Complete"
echo "==================================="
