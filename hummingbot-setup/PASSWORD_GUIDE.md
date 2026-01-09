# Understanding the Password Prompt in Hummingbot

## What's Happening

When you start Hummingbot, it asks for a password. **This is normal!**

### Why Does It Ask for a Password?

The password is used to **encrypt your API keys** and sensitive configuration data. Even though you're using paper trading (no real API keys), Hummingbot still asks for it as part of its security model.

---

## What to Do

### Use This Password: `12341234`

For paper trading, you can use any password. I recommend: **12341234**

**Important**: Remember this password! You'll need it every time you start Hummingbot.

---

## Step-by-Step Guide

### 1. You're Already Attached to Hummingbot

If you see the password prompt, you're in the right place!

### 2. Enter the Password

```
Enter your password >>> 12341234
```

**Note**: You won't see the characters as you type (for security). Just type and press Enter.

### 3. After Entering Password

You should see the Hummingbot welcome screen:

```
                                       *,.
                                     *,,,*
                                   ,,,,,,,               *
                                  ,,,,,,,,            ,,,,
                                  *,,,,,,,,(        .,,,,,,
                                   ,,,,,,,,,,,,,,,,,,,,,,,*
                                    ,,,,,,,,,,,,,,,,,,,,*
                                      *,,,,,,,,,,,,,,,,
                                         *,,,,,,,,,,,
                                             (,,,*

Welcome to Hummingbot!
```

### 4. Enable Paper Trading (Already Done!)

Paper trading is already enabled in your configuration. You can verify:

```
config paper_trade_enabled
```

Should show: `true`

### 5. Create a Strategy

```
create pure_market_making
```

Follow the prompts:
- Exchange: `binance`
- Market: `BTC-USDT`
- Bid spread: `0.5`
- Ask spread: `0.5`
- Order amount: `0.01`

### 6. Start Trading

```
start
```

### 7. Monitor Your Bot

```
status      # Current status
history     # Trade history
pnl         # Profit/Loss
```

---

## Common Issues

### Issue: "Password incorrect"

**Solution**: Make sure you're typing `12341234` correctly. Remember, you won't see the characters as you type.

### Issue: "Can't see anything after entering password"

**Solution**: Wait a few seconds. Hummingbot is loading.

### Issue: "Lost connection to terminal"

**Solution**: Reattach to the container:
```bash
docker attach hbot
```

To detach without stopping: Press `Ctrl+P` then `Ctrl+Q`

---

## What's Pre-Configured

✅ Paper trading: **ENABLED**  
✅ Starting balance: **$100,000 USDT**  
✅ Exchange: **Binance** (simulated)  
✅ Log level: **INFO**

---

## Quick Reference

### Hummingbot Commands

```bash
# Configuration
config                          # View all configs
config paper_trade_enabled      # Check paper trading status

# Strategy Management
create                          # Create new strategy
import <strategy_name>          # Import existing strategy
start                           # Start bot
stop                            # Stop bot

# Monitoring
status                          # Current status
history                         # Trade history
pnl                             # Profit/Loss
balance                         # Account balances

# Help
help                            # Show all commands
help <command>                  # Help for specific command

# Exit
exit                            # Exit Hummingbot
```

### Docker Commands

```bash
# View logs
docker logs hbot

# Attach to container
docker attach hbot

# Detach without stopping
# Press: Ctrl+P then Ctrl+Q

# Stop container
docker stop hbot

# Restart
docker start hbot
docker attach hbot
```

---

## Troubleshooting Script

Run this anytime you need help:

```bash
cd /data/data/v4-chain/hummingbot-setup
./troubleshoot.sh
```

---

## Next Steps

1. ✅ Enter password: `12341234`
2. ✅ Wait for Hummingbot to load
3. ✅ Create a strategy: `create pure_market_making`
4. ✅ Start trading: `start`
5. ✅ Monitor: `status`, `history`, `pnl`

---

## Files Location

```
/data/data/v4-chain/hummingbot-setup/
├── conf/
│   ├── conf_global.yml          # Your password encrypts this
│   └── strategies/              # Strategy configs
├── logs/                        # Hummingbot logs
├── data/                        # Encrypted data
├── QUICKSTART.md                # Quick start guide
├── troubleshoot.sh              # Troubleshooting helper
└── PASSWORD_GUIDE.md            # This file
```

---

## Summary

**The password prompt is normal!** Use `12341234` and you're good to go. Paper trading is already configured with $100,000 USDT. Just create a strategy and start!

Happy trading! 🚀
