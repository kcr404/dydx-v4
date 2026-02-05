#!/bin/bash
# Comprehensive dYdX v4 Chain Feature Testing Script

set -e

CLI="./build/dydxprotocold"
CHAIN_ID="localtradeview"
KEYRING="--keyring-backend test"

echo "========================================="
echo "  dYdX v4 Advanced Features Testing"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

test_section() {
    echo ""
    echo "========================================="
    echo "  $1"
    echo "========================================="
    echo ""
}

test_command() {
    local description=$1
    local command=$2
    
    echo -n "Testing: $description... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# ==========================================
# 1. CHAIN HEALTH
# ==========================================
test_section "1. Chain Health"

BLOCK_HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
echo "Current block height: $BLOCK_HEIGHT"

test_command "Chain is producing blocks" \
    "[ $BLOCK_HEIGHT -gt 0 ]"

test_command "Chain is not catching up" \
    "[ \$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.catching_up') = 'false' ]"

# ==========================================
# 2. ORACLE & PRICES
# ==========================================
test_section "2. Oracle & Price Feeds"

echo "Querying market prices..."
$CLI query prices list-market-price --output json > /tmp/prices.json

PRICE_COUNT=$(jq '.market_prices | length' /tmp/prices.json)
echo "Number of markets with prices: $PRICE_COUNT"

test_command "Oracle prices available" \
    "[ $PRICE_COUNT -gt 0 ]"

echo ""
echo "Sample prices:"
jq '.market_prices[:3] | .[] | {id, price, exponent}' /tmp/prices.json

# ==========================================
# 3. SUBACCOUNTS
# ==========================================
test_section "3. Subaccounts & Balances"

echo "Querying alice's subaccount..."
$CLI query subaccounts show-subaccount alice 0 --output json > /tmp/alice_subaccount.json

test_command "Alice's subaccount exists" \
    "jq -e '.subaccount' /tmp/alice_subaccount.json"

echo ""
echo "Alice's balances:"
jq '.subaccount.asset_positions' /tmp/alice_subaccount.json

echo ""
echo "Alice's positions:"
jq '.subaccount.perpetual_positions' /tmp/alice_subaccount.json

# ==========================================
# 4. CLOB PAIRS
# ==========================================
test_section "4. CLOB Pairs & Markets"

echo "Querying CLOB pairs..."
$CLI query clob list-clob-pair --output json > /tmp/clob_pairs.json

CLOB_COUNT=$(jq '.clob_pair | length' /tmp/clob_pairs.json)
echo "Number of CLOB pairs: $CLOB_COUNT"

test_command "CLOB pairs configured" \
    "[ $CLOB_COUNT -gt 0 ]"

echo ""
echo "CLOB pair 0 details:"
jq '.clob_pair[0]' /tmp/clob_pairs.json

# ==========================================
# 5. LIQUIDATIONS CONFIG
# ==========================================
test_section "5. Liquidations Configuration"

echo "Querying liquidations config..."
$CLI query clob get-liquidations-config --output json > /tmp/liquidations_config.json

test_command "Liquidations config exists" \
    "jq -e '.liquidations_config' /tmp/liquidations_config.json"

echo ""
echo "Liquidations config:"
jq '.liquidations_config' /tmp/liquidations_config.json

# ==========================================
# 6. EQUITY TIER LIMITS
# ==========================================
test_section "6. Equity Tier Limits"

echo "Querying equity tier limits..."
$CLI query clob get-equity-tier-limit-config --output json > /tmp/equity_tiers.json

test_command "Equity tiers configured" \
    "jq -e '.equity_tier_limit_config' /tmp/equity_tiers.json"

echo ""
echo "Equity tiers:"
jq '.equity_tier_limit_config.short_term_order_equity_tiers[:2]' /tmp/equity_tiers.json

# ==========================================
# 7. RATE LIMITS
# ==========================================
test_section "7. Block Rate Limits"

echo "Querying block rate limits..."
$CLI query clob get-block-rate-limit-config --output json > /tmp/rate_limits.json

test_command "Rate limits configured" \
    "jq -e '.block_rate_limit_config' /tmp/rate_limits.json"

echo ""
echo "Rate limits:"
jq '.block_rate_limit_config' /tmp/rate_limits.json

# ==========================================
# 8. IBC STATUS
# ==========================================
test_section "8. IBC Status"

echo "Querying IBC channels..."
IBC_CHANNELS=$($CLI query ibc channel channels --output json | jq '.channels | length')
echo "Number of IBC channels: $IBC_CHANNELS"

if [ $IBC_CHANNELS -eq 0 ]; then
    echo -e "${YELLOW}Note: No IBC channels (expected for isolated local chain)${NC}"
fi

# ==========================================
# 9. BRIDGE STATUS
# ==========================================
test_section "9. Bridge Configuration"

echo "Querying bridge params..."
$CLI query bridge params --output json > /tmp/bridge_params.json 2>&1 || echo "Bridge module not available"

if [ -f /tmp/bridge_params.json ]; then
    test_command "Bridge params exist" \
        "jq -e '.params' /tmp/bridge_params.json"
    
    echo ""
    echo "Bridge params:"
    jq '.params' /tmp/bridge_params.json
fi

# ==========================================
# 10. GOVERNANCE
# ==========================================
test_section "10. Governance"

echo "Querying governance proposals..."
PROPOSALS=$($CLI query gov proposals --output json | jq '.proposals | length')
echo "Number of proposals: $PROPOSALS"

# ==========================================
# SUMMARY
# ==========================================
test_section "Test Summary"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo "Total tests run: $TOTAL_TESTS"
echo -e "${GREEN}Tests passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================="
    echo "  ALL TESTS PASSED! ✓"
    echo "=========================================${NC}"
    exit 0
else
    echo ""
    echo -e "${YELLOW}========================================="
    echo "  SOME TESTS FAILED"
    echo "=========================================${NC}"
    exit 1
fi
