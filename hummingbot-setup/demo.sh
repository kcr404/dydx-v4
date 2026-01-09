#!/bin/bash
# Final Demo Script - Hummingbot Paper Trading

echo "========================================="
echo "  Hummingbot Paper Trading Demo"
echo "========================================="
echo ""

# Check dYdX chain
BLOCK=$(curl -s http://localhost:26657/status 2>/dev/null | jq -r '.result.sync_info.latest_block_height')
if [ -n "$BLOCK" ]; then
    echo "✅ dYdX chain running (block: $BLOCK)"
else
    echo "❌ dYdX chain not accessible"
    exit 1
fi

# Check Hummingbot container
if docker ps | grep -q hummingbot-paper; then
    echo "✅ Hummingbot container running"
else
    echo "❌ Hummingbot container not running"
    echo "   Starting it now..."
    docker run -d --name hummingbot-paper --network host \
      -v $(pwd)/conf:/conf \
      -v $(pwd)/logs:/logs \
      -v $(pwd)/data:/data \
      hummingbot/hummingbot:latest tail -f /dev/null
    sleep 3
fi

echo ""
echo "========================================="
echo "  Paper Trading is PRE-CONFIGURED!"
echo "========================================="
echo ""
echo "Settings in conf/conf_global.yml:"
echo "  - Paper trading: ENABLED"
echo "  - Starting balance: \$100,000 USDT"
echo ""
echo "========================================="
echo "  EASIEST WAY TO START:"
echo "========================================="
echo ""
echo "Run this command:"
echo ""
echo "  docker run -it --rm --name hbot --network host \\"
echo "    -v \$(pwd)/conf:/conf \\"
echo "    -v \$(pwd)/logs:/logs \\"
echo "    -v \$(pwd)/data:/data \\"
echo "    hummingbot/hummingbot:latest"
echo ""
echo "Then in Hummingbot:"
echo "  create pure_market_making"
echo "  start"
echo ""
echo "========================================="
echo ""
echo "See QUICKSTART.md for full instructions!"
echo ""
