#!/bin/bash
set -e

echo "==================================="
echo "  IBC Flow Test"
echo "==================================="
echo ""

# 1. Run IBC denom parsing tests
echo "Step 1: Running IBC denom parsing tests..."
go test ./x/ratelimit/util/... -v -run TestParseDenom
echo ""

# 2. Check IBC channels
echo "Step 2: Checking IBC channels..."
./build/dydxprotocold query ibc channel channels --node http://localhost:26657 || echo "ℹ️  No IBC channels configured (expected for isolated localnet)"
echo ""

# 3. Check IBC clients
echo "Step 3: Checking IBC clients..."
./build/dydxprotocold query ibc client states --node http://localhost:26657 || echo "ℹ️  No IBC clients configured (expected for isolated localnet)"
echo ""

# 4. Test rate limiting
echo "Step 4: Testing rate limiting module..."
go test ./x/ratelimit/... -v -run TestRateLimit
echo ""

# 5. Calculate IBC USDC denom
echo "Step 5: Calculating IBC USDC denom hash..."
echo "Noble USDC denom trace: transfer/channel-0/uusdc"
HASH=$(echo -n "transfer/channel-0/uusdc" | sha256sum | awk '{print toupper($1)}')
echo "IBC denom: ibc/$HASH"
echo ""

echo "==================================="
echo "✅ IBC Flow Test Complete"
echo "==================================="
echo ""
echo "Next steps:"
echo "  • To test real IBC: Set up Hermes relayer"
echo "  • To test with Noble: Connect to Noble testnet"
echo "  • See: docs/testing_ibc_and_bridge.md"
