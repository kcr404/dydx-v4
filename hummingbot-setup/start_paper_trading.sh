#!/bin/bash
# Automated Hummingbot Paper Trading Setup

set -e

echo "Starting Hummingbot in paper trading mode..."

# Start container in detached mode
docker run -d \
  --name hummingbot-paper \
  --network host \
  -v $(pwd)/conf:/conf \
  -v $(pwd)/logs:/logs \
  -v $(pwd)/data:/data \
  -e CONFIG_PASSWORD=abc \
  hummingbot/hummingbot:latest

echo "Waiting for Hummingbot to initialize..."
sleep 10

# Configure paper trading via environment
docker exec hummingbot-paper bash -c "
mkdir -p /conf
cat > /conf/conf_global.yml << 'EOF'
paper_trade_enabled: true
paper_trade_account_balance: 100000
EOF
"

echo "✅ Paper trading configured!"
echo ""
echo "To interact with Hummingbot:"
echo "  docker exec -it hummingbot-paper hummingbot"
echo ""
echo "Or attach to the container:"
echo "  docker attach hummingbot-paper"
