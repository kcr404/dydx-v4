#!/bin/bash
# Hummingbot Paper Trading Setup Script for dYdX Local Chain

set -e

echo "========================================="
echo "  Hummingbot Paper Trading Setup"
echo "  for dYdX v4 Local Chain"
echo "========================================="
echo ""

# Create directories
mkdir -p conf/strategies
mkdir -p logs
mkdir -p data
mkdir -p scripts

echo "✓ Created directory structure"

# Create paper trading strategy config
cat > conf/strategies/pure_mm_paper.yml << 'EOF'
# Pure Market Making Strategy - Paper Trading
strategy: pure_market_making

# Exchange and Market
exchange: paper_trade
market: BTC-USDT

# Order Configuration
bid_spread: 0.5
ask_spread: 0.5
order_amount: 0.01
order_refresh_time: 30

# Inventory Management
inventory_skew_enabled: True
inventory_target_base_pct: 50

# Multiple Order Levels
order_levels: 3
order_level_spread: 0.2
order_level_amount: 0.01

# Risk Management
filled_order_delay: 60
hanging_orders_enabled: False
hanging_orders_cancel_pct: 10

# Ping Pong
ping_pong_enabled: True
EOF

echo "✓ Created paper trading strategy config"

# Create startup script
cat > scripts/start_paper_trading.sh << 'EOF'
#!/bin/bash
echo "Starting Hummingbot Paper Trading..."
echo ""
echo "Commands to use:"
echo "  config paper_trade_enabled true"
echo "  config paper_trade_account_balance 100000"
echo "  import pure_mm_paper"
echo "  start"
echo ""
EOF

chmod +x scripts/start_paper_trading.sh

echo "✓ Created startup script"

# Create README
cat > README.md << 'EOF'
# Hummingbot Paper Trading for dYdX Local Chain

## Quick Start

1. Start Hummingbot:
   ```bash
   docker-compose up -d
   docker attach hummingbot-dydx
   ```

2. In Hummingbot terminal:
   ```bash
   # Enable paper trading
   config paper_trade_enabled true
   config paper_trade_account_balance 100000
   
   # Import strategy
   import pure_mm_paper
   
   # Start trading
   start
   ```

3. Monitor:
   ```bash
   status
   history
   pnl
   ```

## Strategy Configuration

Edit `conf/strategies/pure_mm_paper.yml` to customize:
- Spreads
- Order sizes
- Refresh times
- Inventory targets

## Logs

View logs in `logs/` directory or use `history` command in Hummingbot.

## dYdX Chain Status

Check local chain:
```bash
curl -s http://localhost:26657/status | jq '.result.sync_info'
```
EOF

echo "✓ Created README"

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. cd /data/data/v4-chain/hummingbot-setup"
echo "  2. docker-compose up -d"
echo "  3. docker attach hummingbot-dydx"
echo ""
echo "In Hummingbot:"
echo "  config paper_trade_enabled true"
echo "  config paper_trade_account_balance 100000"
echo "  import pure_mm_paper"
echo "  start"
echo ""
