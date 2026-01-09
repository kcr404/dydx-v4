#!/bin/bash
set -e

# ============================================
# MARGIN TRADING DEMONSTRATION
# ============================================

CHAIN_ID="localdydxprotocol"
FEE="5000000000000000adv4tnt"
NODE="http://localhost:26657"

BOB=$(./build/dydxprotocold keys show bob --home ./tmp_keyring --keyring-backend test -a)

echo "============================================"
echo "   MARGIN TRADING DEMO - dYdX v4"
echo "============================================"
echo "Trader: $BOB"
echo ""

# STEP 1: Initial State
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Current Subaccount State"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
INITIAL_STATE=$(./build/dydxprotocold query subaccounts show-subaccount "$BOB" 0 --node "$NODE" -o json)
echo "$INITIAL_STATE" | jq '.'

CURRENT_USDC=$(echo "$INITIAL_STATE" | jq -r '.subaccount.asset_positions[0].quantums // "0"')
CURRENT_POSITION=$(echo "$INITIAL_STATE" | jq -r '.subaccount.perpetual_positions[0].quantums // "0"')

echo ""
echo "📊 Current Status:"
echo "  Collateral: $CURRENT_USDC quantums (~$(echo "scale=2; $CURRENT_USDC / 1000000" | bc) USDC)"
echo "  Existing Position: $CURRENT_POSITION quantums"

# STEP 2: Market Info
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Market Information (TEST-USD)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
MARKET_INFO=$(./build/dydxprotocold query perpetuals show-perpetual 35 --node "$NODE" -o json)
echo "$MARKET_INFO" | jq '.perpetual.params'

MARKET_TYPE=$(echo "$MARKET_INFO" | jq -r '.perpetual.params.market_type')
LIQUIDITY_TIER=$(echo "$MARKET_INFO" | jq -r '.perpetual.params.liquidity_tier')

echo ""
echo "🏪 Market Type: $MARKET_TYPE"
echo "   └─ This enables MARGIN TRADING!"

# Get liquidity tier
echo ""
echo "Getting Liquidity Tier $LIQUIDITY_TIER..."
TIER_INFO=$(./build/dydxprotocold query perpetuals get-all-liquidity-tiers --node "$NODE" -o json | jq ".liquidity_tiers[] | select(.id == $LIQUIDITY_TIER)")
echo "$TIER_INFO" | jq '.'

INITIAL_MARGIN_PPM=$(echo "$TIER_INFO" | jq -r '.initial_margin_ppm')
MAINT_MARGIN_PPM=$(echo "$TIER_INFO" | jq -r '.maintenance_fraction_ppm')
TIER_NAME=$(echo "$TIER_INFO" | jq -r '.name')

# Calculate leverage
INITIAL_MARGIN_PCT=$(echo "scale=4; $INITIAL_MARGIN_PPM / 10000" | bc)
MAX_LEVERAGE=$(echo "scale=2; 1000000 / $INITIAL_MARGIN_PPM" | bc)

echo ""
echo "💰 Margin Requirements:"
echo "  Tier Name: $TIER_NAME"
echo "  Initial Margin: $INITIAL_MARGIN_PPM ppm ($INITIAL_MARGIN_PCT%)"
echo "  Maintenance Margin: $MAINT_MARGIN_PPM ppm"
echo "  Maximum Leverage: ~${MAX_LEVERAGE}x"

# Calculate what we can trade
COLLATERAL_USDC=$(echo "scale=2; $CURRENT_USDC / 1000000" | bc)
MAX_POSITION_VALUE=$(echo "scale=2; $COLLATERAL_USDC * $MAX_LEVERAGE" | bc)

echo ""
echo "📈 With $COLLATERAL_USDC USDC collateral:"
echo "  → You can open positions worth up to ~$MAX_POSITION_VALUE USDC"
echo "  → This is ${MAX_LEVERAGE}x your collateral!"
echo "  → This IS margin trading (using borrowed funds)"

# STEP 3: Place Leveraged Order
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Placing Leveraged Order"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CID_BOB=$(date +%s)
CID_BOB=$((CID_BOB % 1000000))
GTBT=$(($(date +%s) + 3600))

# Order details
PERPETUAL_ID=35
SIDE=1  # 1=BUY/LONG
QUANTUMS=3000000  # Larger position to demonstrate leverage
SUBTICKS=150000

echo "📝 Order Details:"
echo "  Market: TEST-USD (perpetual $PERPETUAL_ID)"
echo "  Side: LONG (BUY)"
echo "  Size: $QUANTUMS quantums"
echo "  Price: $SUBTICKS subticks"
echo "  Client ID: $CID_BOB"
echo ""

read -p "Press Enter to place the order..."

echo "Broadcasting order..."
ORDER_TX=$(./build/dydxprotocold tx clob place-order \
  "$BOB" 0 "$CID_BOB" "$PERPETUAL_ID" "$SIDE" "$QUANTUMS" "$SUBTICKS" 0 \
  --good-til-block-time "$GTBT" \
  --from "$BOB" \
  --home ./tmp_keyring \
  --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" \
  --gas 200000 \
  -y \
  --broadcast-mode sync \
  --node "$NODE" 2>&1)

echo "$ORDER_TX"
TXHASH=$(echo "$ORDER_TX" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
echo ""
echo "✅ Transaction Hash: $TXHASH"

# STEP 4: Wait and check result
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Waiting for Order Processing..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Waiting 8 seconds..."
sleep 8

# STEP 5: Final State
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Final Subaccount State"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FINAL_STATE=$(./build/dydxprotocold query subaccounts show-subaccount "$BOB" 0 --node "$NODE" -o json)
echo "$FINAL_STATE" | jq '.'

FINAL_USDC=$(echo "$FINAL_STATE" | jq -r '.subaccount.asset_positions[0].quantums // "0"')
FINAL_POSITION=$(echo "$FINAL_STATE" | jq -r '.subaccount.perpetual_positions[0].quantums // "0"')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 MARGIN TRADING ANALYSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "BEFORE:"
echo "  Collateral: $CURRENT_USDC quantums (~$(echo "scale=2; $CURRENT_USDC / 1000000" | bc) USDC)"
echo "  Position: $CURRENT_POSITION quantums"
echo ""
echo "AFTER:"
echo "  Collateral: $FINAL_USDC quantums (~$(echo "scale=2; $FINAL_USDC / 1000000" | bc) USDC)"
echo "  Position: $FINAL_POSITION quantums"
echo ""

# Analyze the position
if [ "$FINAL_POSITION" != "0" ] && [ "$FINAL_POSITION" != "$CURRENT_POSITION" ]; then
    if [[ "$FINAL_POSITION" == -* ]]; then
        echo "📉 Position Direction: SHORT (negative)"
        POSITION_ABS=${FINAL_POSITION#-}
    else
        echo "📈 Position Direction: LONG (positive)"
        POSITION_ABS=$FINAL_POSITION
    fi
    
    echo ""
    echo "✅ MARGIN TRADING IS ACTIVE!"
    echo ""
    echo "🔑 Key Points:"
    echo "  1. Market Type: $MARKET_TYPE"
    echo "  2. Maximum Leverage: ~${MAX_LEVERAGE}x"
    echo "  3. Your position can be larger than your collateral"
    echo "  4. This is possible because of CROSS-MARGIN market"
    echo "  5. You're effectively using borrowed funds (leverage)"
    echo ""
    echo "⚠️  Risk Warning:"
    echo "  • If market moves against you, you could be liquidated"
    echo "  • Liquidation occurs when collateral < maintenance margin"
    echo "  • Maintenance margin: $MAINT_MARGIN_PPM ppm"
else
    echo "ℹ️  Order Status:"
    echo "  Order may be pending or didn't match immediately"
    echo "  This is normal for limit orders"
    echo "  Check order book for matching opportunities"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ DEMO COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next Steps:"
echo "  • Monitor position: ./build/dydxprotocold query subaccounts show-subaccount $BOB 0 --node $NODE"
echo "  • Check orders: ./build/dydxprotocold query clob list-order --node $NODE"
echo "  • Close position: Place opposite order (SELL to close LONG)"
echo ""
