# Hummingbot Paper Trading - Final Setup Guide

## ✅ Setup Complete

**Location**: `/data/data/v4-chain/hummingbot-setup`

**Status**:
- ✅ dYdX chain running
- ✅ Configuration files created
- ✅ Paper trading pre-configured ($100,000 balance)

---

## Quick Start (Simplified)

### Option 1: Interactive Mode (Recommended)

```bash
cd /data/data/v4-chain/hummingbot-setup

# Start Hummingbot interactively
docker run -it --rm \
  --name hummingbot-interactive \
  --network host \
  -v $(pwd)/conf:/conf \
  -v $(pwd)/logs:/logs \
  -v $(pwd)/data:/data \
  hummingbot/hummingbot:latest
```

Once inside Hummingbot, paper trading is already enabled! Just run:
```
create pure_market_making
start
```

### Option 2: Pre-configured Container

```bash
# Container is already running with paper trading enabled
docker exec -it hummingbot-paper /bin/bash

# Inside container, start Hummingbot
cd /home/hummingbot
./start
```

---

## What's Pre-Configured

The `conf/conf_global.yml` file already has:
- ✅ Paper trading: **ENABLED**
- ✅ Starting balance: **$100,000 USDT**
- ✅ Log level: INFO
- ✅ Error reporting: DISABLED

---

## Simple Demo

```bash
# 1. Start interactive Hummingbot
cd /data/data/v4-chain/hummingbot-setup
docker run -it --rm --name hbot --network host \
  -v $(pwd)/conf:/conf \
  -v $(pwd)/logs:/logs \
  -v $(pwd)/data:/data \
  hummingbot/hummingbot:latest

# 2. In Hummingbot (paper trading is auto-enabled):
create pure_market_making
# Follow prompts:
#   Exchange: binance
#   Market: BTC-USDT
#   Bid spread: 0.5
#   Ask spread: 0.5
#   Order amount: 0.01

# 3. Start
start

# 4. Monitor
status
history
pnl
```

---

## Troubleshooting

### Can't start container
```bash
# Clean up
docker rm -f hummingbot-paper hummingbot-interactive hbot

# Try again with fresh start
docker run -it --rm --name hbot --network host \
  -v $(pwd)/conf:/conf \
  hummingbot/hummingbot:latest
```

### Paper trading not working
Check `conf/conf_global.yml` contains:
```yaml
paper_trade_enabled: true
paper_trade_account_balance: 100000
```

---

## Next Steps

1. ✅ Run the simple demo above
2. Test different strategies (cross_exchange_market_making, avellaneda_market_making)
3. Adjust parameters in strategy configs
4. Monitor PnL and performance

---

## Files

```
/data/data/v4-chain/hummingbot-setup/
├── conf/
│   ├── conf_global.yml          # Paper trading enabled here!
│   └── strategies/
│       └── pure_mm_paper.yml    # Strategy template
├── logs/                        # Hummingbot logs
├── data/                        # Hummingbot data
└── README.md                    # This file
```

---

## Documentation

- [Hummingbot Docs](https://docs.hummingbot.org/)
- [Paper Trading Guide](https://docs.hummingbot.org/operation/paper-trade/)
- [Pure Market Making Strategy](https://docs.hummingbot.org/strategies/pure-market-making/)
