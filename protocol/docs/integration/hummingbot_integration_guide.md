# Hummingbot Integration with Local dYdX v4 Chain

## Overview

This guide explains how to connect Hummingbot to your **local dYdX v4 chain** for algorithmic trading testing.

**Challenge**: Hummingbot's dYdX connector is designed for the public testnet/mainnet, not local chains.

**Solution**: We'll configure Hummingbot to point to your local chain's API endpoints.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Hummingbot Trading Bot                                  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ dYdX Connector (Modified)                        │  │
│  │                                                   │  │
│  │  - REST API Client                               │  │
│  │  - WebSocket Streaming                           │  │
│  │  - Order Management                              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓ ↑
                   HTTP/WebSocket
                        ↓ ↑
┌─────────────────────────────────────────────────────────┐
│ Local dYdX v4 Chain                                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ REST API     │  │ gRPC         │  │ WebSocket    │ │
│  │ :1317        │  │ :9090        │  │ :26657       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 4 Validator Nodes                                │  │
│  │ (alice, bob, carl, dave)                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

✅ **Local dYdX Chain Running**:
```bash
# Verify chain is running
curl -s http://localhost:26657/status | jq '.result.sync_info'

# Check REST API
curl -s http://localhost:1317/cosmos/base/tendermint/v1beta1/node_info
```

✅ **Test Accounts with Funds**:
```bash
# Check alice's balance
ALICE=$(./build/dydxprotocold keys show alice -a --keyring-backend test)
./build/dydxprotocold query bank balances $ALICE
```

---

## Step 1: Install Hummingbot

### Option A: Docker (Recommended)

```bash
# Create directory
mkdir ~/hummingbot
cd ~/hummingbot

# Create docker-compose.yml
cat > docker-compose.yml <<EOF
version: "3.9"
services:
  hummingbot:
    image: hummingbot/hummingbot:latest
    container_name: hummingbot
    volumes:
      - ./conf:/conf
      - ./logs:/logs
      - ./data:/data
      - ./scripts:/scripts
    network_mode: "host"  # Important for local chain access
    stdin_open: true
    tty: true
    environment:
      - CONFIG_PASSWORD=your_password_here
EOF

# Start Hummingbot
docker-compose up -d

# Attach to Hummingbot
docker attach hummingbot
```

### Option B: From Source

```bash
# Clone repository
git clone https://github.com/hummingbot/hummingbot.git
cd hummingbot

# Install dependencies
./install

# Activate environment
conda activate hummingbot

# Compile
./compile

# Run
./start
```

---

## Step 2: Create REST API Proxy (Recommended Approach)

Instead of modifying Hummingbot, create a **proxy server** that translates Hummingbot's requests to your local chain.

### Create Proxy Server

**File**: `dydx_local_proxy.py`

```python
from flask import Flask, request, jsonify
import requests
import subprocess
import json
import time

app = Flask(__name__)

# Local chain config
LOCAL_CHAIN_REST = "http://localhost:1317"
LOCAL_CHAIN_RPC = "http://localhost:26657"
DYDX_CLI = "./build/dydxprotocold"

@app.route('/v4/orderbook/<market>', methods=['GET'])
def get_orderbook(market):
    """Proxy orderbook requests to local chain"""
    result = subprocess.run(
        [DYDX_CLI, "query", "clob", "orderbook", "0", "--output", "json"],
        capture_output=True,
        text=True
    )
    
    orderbook = json.loads(result.stdout)
    
    return jsonify({
        "bids": transform_orders(orderbook.get("bids", [])),
        "asks": transform_orders(orderbook.get("asks", [])),
    })

@app.route('/v4/orders', methods=['POST'])
def place_order():
    """Place order on local chain"""
    order_data = request.json
    
    cmd = [
        DYDX_CLI, "tx", "clob", "place-order",
        "--subaccount-number", str(order_data["subaccount_number"]),
        "--clob-pair-id", str(order_data["clob_pair_id"]),
        "--side", order_data["side"],
        "--quantums", str(order_data["quantums"]),
        "--subticks", str(order_data["subticks"]),
        "--good-til-block-time", str(int(time.time()) + 3600),
        "--from", "alice",
        "--keyring-backend", "test",
        "--chain-id", "localdydxprotocol",
        "-y",
        "--output", "json"
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    response = json.loads(result.stdout)
    
    return jsonify({
        "order_id": response.get("txhash"),
        "status": "placed"
    })

@app.route('/v4/positions', methods=['GET'])
def get_positions():
    """Get positions from local chain"""
    result = subprocess.run(
        [DYDX_CLI, "query", "subaccounts", "get-subaccount", "alice", "0", "--output", "json"],
        capture_output=True,
        text=True
    )
    
    subaccount_data = json.loads(result.stdout)
    
    return jsonify({
        "positions": transform_positions(subaccount_data.get("perpetual_positions", []))
    })

def transform_orders(orders):
    return [
        {
            "price": float(order["subticks"]) / 1e6,
            "size": float(order["quantums"]) / 1e6,
        }
        for order in orders
    ]

def transform_positions(positions):
    return [
        {
            "market": "BTC-USD-PERP",
            "side": "LONG" if pos["quantums"] > 0 else "SHORT",
            "size": abs(float(pos["quantums"]) / 1e6),
            "entry_price": float(pos.get("entry_price", 0)) / 1e6,
        }
        for pos in positions
    ]

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

**Install dependencies and run**:
```bash
pip install flask
python dydx_local_proxy.py
```

---

## Step 3: Configure Hummingbot

### Paper Trading Mode (Simplest)

```bash
# In Hummingbot terminal
config paper_trade_enabled true
config paper_trade_account_balance 100000

# Start a strategy
create pure_market_making
```

This simulates trading without touching the real chain.

---

## Step 4: Test Basic Trading

### Manual Order Testing

```bash
# In Hummingbot
buy BTC-USD-PERP 0.001 45000
sell BTC-USD-PERP 0.001 46000

# Check status
status
balance
```

### Automated Strategy

```yaml
# conf/strategies/pmm_local.yml
strategy: pure_market_making
exchange: dydx_v4
market: BTC-USD-PERP
bid_spread: 0.1
ask_spread: 0.1
order_amount: 0.001
order_refresh_time: 30
```

```bash
# Start strategy
import pmm_local
start
```

---

## Troubleshooting

### Connection Issues
```bash
# Verify endpoints
curl http://localhost:1317/cosmos/base/tendermint/v1beta1/node_info
curl http://localhost:8080/v4/orderbook/BTC-USD-PERP
```

### Order Issues
```bash
# Check chain logs
docker logs dydxprotocold0 2>&1 | grep "MsgPlaceOrder"

# Verify account balance
./build/dydxprotocold query bank balances <address>
```

---

## Next Steps

1. Test basic orders manually
2. Run simple market making strategy
3. Monitor performance and fills
4. Optimize strategy parameters
5. Scale to multiple markets

---

## Resources

- [Hummingbot Docs](https://docs.hummingbot.org/)
- [Testing Checklist](file:///data/data/v4-chain/protocol/docs/testing_checklist.md)
- [Module Architecture](file:///data/data/v4-chain/protocol/docs/module_architecture_guide.md)
