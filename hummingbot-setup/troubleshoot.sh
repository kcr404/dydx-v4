#!/bin/bash
# Helper script to check Hummingbot status and provide troubleshooting

echo "========================================="
echo "  Hummingbot Troubleshooting"
echo "========================================="
echo ""

# Check if container is running
if ! docker ps | grep -q hbot; then
    echo "❌ Container 'hbot' is not running"
    echo ""
    echo "Start it with:"
    echo "  docker run -it --rm --name hbot --network host \\"
    echo "    -v \$(pwd)/conf:/conf \\"
    echo "    -v \$(pwd)/logs:/logs \\"
    echo "    -v \$(pwd)/data:/data \\"
    echo "    hummingbot/hummingbot:latest"
    exit 1
fi

echo "✅ Container 'hbot' is running"
echo ""

# Check Hummingbot process
if docker exec hbot ps aux | grep -q hummingbot_quickstart; then
    echo "✅ Hummingbot process is active"
else
    echo "❌ Hummingbot process not found"
fi

echo ""
echo "========================================="
echo "  Configuration Status"
echo "========================================="
echo ""

# Check password configuration
if [ -f "conf/conf_global.yml" ]; then
    echo "✅ Global config exists"
    echo ""
    echo "Paper trading settings:"
    grep -E "paper_trade" conf/conf_global.yml || echo "  (not configured)"
else
    echo "❌ No global config found"
fi

echo ""
echo "========================================="
echo "  Common Issues & Solutions"
echo "========================================="
echo ""

echo "Issue: Password prompt keeps appearing"
echo "Solution: The password is for encrypting your API keys."
echo "          For paper trading, you can use any password."
echo "          Suggested: 12341234"
echo ""

echo "Issue: Can't see Hummingbot interface"
echo "Solution: Make sure you attached to the container:"
echo "          docker attach hbot"
echo "          (Press Ctrl+P then Ctrl+Q to detach without stopping)"
echo ""

echo "Issue: Commands not working"
echo "Solution: Make sure you're inside the Hummingbot interface,"
echo "          not the bash shell. You should see the Hummingbot"
echo "          prompt with >>> or similar."
echo ""

echo "========================================="
echo "  Quick Commands"
echo "========================================="
echo ""
echo "View logs:"
echo "  docker logs hbot"
echo ""
echo "Attach to container:"
echo "  docker attach hbot"
echo ""
echo "Execute command in container:"
echo "  docker exec -it hbot /bin/bash"
echo ""
echo "Check Hummingbot files:"
echo "  ls -la conf/"
echo "  ls -la logs/"
echo ""
