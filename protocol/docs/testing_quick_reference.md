# Quick Testing Guide - Bridge & IBC Flows

## ✅ Issue Fixed!

The bridge query command was incorrect. Here's the fix:

### ❌ Wrong Command
```bash
./build/dydxprotocold query bridge event-params
```

### ✅ Correct Command
```bash
./build/dydxprotocold query bridge get-event-params
```

---

## 🚀 Quick Start (3 Test Scripts)

### 1. **Quick Test** (Recommended - No External Dependencies)

```bash
./scripts/test_quick.sh
```

**What it tests:**
- ✅ Bridge module configuration
- ✅ IBC module status  
- ✅ Rate limiting
- ✅ IBC denom calculation

**Time**: ~10 seconds

---

### 2. **Bridge Flow Test** (Requires Ethereum RPC)

```bash
./scripts/test_bridge_flow.sh
```

**What it tests:**
- ✅ Bridge event parameters
- ✅ Ethereum Sepolia event querying
- ✅ Bridge module account

**Time**: ~30 seconds (depends on Ethereum RPC)

---

### 3. **IBC Flow Test** (Runs Go Tests)

```bash
./scripts/test_ibc_flow.sh
```

**What it tests:**
- ✅ IBC denom parsing (Go tests)
- ✅ IBC channels/clients
- ✅ Rate limiting (Go tests)

**Time**: ~20 seconds

---

## 📋 Correct Bridge Commands

### All Available Bridge Queries

```bash
# Event parameters (Ethereum config)
./build/dydxprotocold query bridge get-event-params --node http://localhost:26657

# Acknowledged events
./build/dydxprotocold query bridge get-acknowledged-event-info --node http://localhost:26657

# Recognized events
./build/dydxprotocold query bridge get-recognized-event-info --node http://localhost:26657

# Safety parameters
./build/dydxprotocold query bridge get-safety-params --node http://localhost:26657

# Propose parameters
./build/dydxprotocold query bridge get-propose-params --node http://localhost:26657

# Delayed messages
./build/dydxprotocold query bridge get-delayed-complete-bridge-messages --node http://localhost:26657
```

---

## 📊 Expected Test Output

### Quick Test Output

```
===================================
  Quick Bridge & IBC Test
===================================

✅ Chain is running

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRIDGE MODULE TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Bridge Event Parameters:
params:
  denom: adv4tnt
  eth_address: 0xf75012c350e4ad55be2048bd67ce6e03b20de82d
  eth_chain_id: "11155111"  # Sepolia testnet

2. Bridge Acknowledged Event Info:
info:
  eth_block_height: "4322136"
  next_id: 5

3. Bridge Recognized Event Info:
info:
  eth_block_height: "4322136"
  next_id: 5

4. Bridge Safety Parameters:
params:
  delay_blocks: 30
  is_disabled: false

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IBC MODULE TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. IBC Channels:
channels: []  # No channels (isolated localnet)

2. IBC Clients:
client_states:
- client_id: 09-localhost
  client_state:
    '@type': /ibc.lightclients.localhost.v2.ClientState

3. Calculate IBC USDC Denom:
   Noble USDC trace: transfer/channel-0/uusdc
   IBC denom: ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Bridge module is configured
✅ IBC module is available
✅ Rate limiting is active

===================================
✅ Quick Test Complete
===================================
```

---

## 🎯 What Each Test Shows

### Bridge Module
- **Ethereum Address**: `0xf75012c350e4ad55be2048bd67ce6e03b20de82d`
- **Chain ID**: `11155111` (Sepolia testnet)
- **Denom**: `adv4tnt` (native token)
- **Safety**: 30 block delay, not disabled
- **Events**: 5 events acknowledged at block 4,322,136

### IBC Module
- **Channels**: None (expected for isolated localnet)
- **Clients**: localhost client only
- **USDC Denom**: `ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5`

### Rate Limiting
- Module is active and functional
- Tests pass for denom parsing
- Multi-hop transfers supported

---

## 🔧 All Test Scripts

| Script | Purpose | Dependencies | Time |
|--------|---------|--------------|------|
| `test_quick.sh` | Quick validation | None | ~10s |
| `test_bridge_flow.sh` | Bridge + Ethereum | Ethereum RPC | ~30s |
| `test_ibc_flow.sh` | IBC + Go tests | Go toolchain | ~20s |

---

## 🐛 Troubleshooting

### "unknown command" Error

**Problem**: Using old command syntax

```bash
# ❌ Wrong
./build/dydxprotocold query bridge event-params

# ✅ Correct
./build/dydxprotocold query bridge get-event-params
```

### Chain Not Running

```bash
# Check status
curl http://localhost:26657/status

# Start chain
make localnet-start
```

### Ethereum RPC Timeout

```bash
# Use public RPC (slower but free)
# Already configured in test_bridge_flow.sh:
# -rpc https://eth-sepolia.g.alchemy.com/v2/demo

# Or get your own Alchemy key:
# https://www.alchemy.com/
```

---

## 📚 Complete Command Reference

### Bridge Queries
```bash
# List all bridge commands
./build/dydxprotocold query bridge --help

# Get specific info
./build/dydxprotocold query bridge get-event-params --node http://localhost:26657
./build/dydxprotocold query bridge get-acknowledged-event-info --node http://localhost:26657
./build/dydxprotocold query bridge get-recognized-event-info --node http://localhost:26657
./build/dydxprotocold query bridge get-safety-params --node http://localhost:26657
./build/dydxprotocold query bridge get-propose-params --node http://localhost:26657
```

### IBC Queries
```bash
# List all IBC commands
./build/dydxprotocold query ibc --help

# Get channels
./build/dydxprotocold query ibc channel channels --node http://localhost:26657

# Get clients
./build/dydxprotocold query ibc client states --node http://localhost:26657

# Get connections
./build/dydxprotocold query ibc connection connections --node http://localhost:26657
```

### Rate Limit Queries
```bash
# Check if rate limit module exists
./build/dydxprotocold query ratelimit --help

# Run rate limit tests
go test ./x/ratelimit/... -v
```

---

## ✅ Success Criteria

After running `./scripts/test_quick.sh`, you should see:

- ✅ **Bridge configured**: Ethereum address and chain ID shown
- ✅ **Events tracked**: next_id and eth_block_height populated
- ✅ **Safety enabled**: delay_blocks set, not disabled
- ✅ **IBC available**: localhost client present
- ✅ **USDC denom**: Correct hash calculated

---

## 🎓 Next Steps

### For Basic Testing
```bash
# 1. Start chain
make localnet-start

# 2. Run quick test
./scripts/test_quick.sh

# 3. Stop chain
make localnet-stop
```

### For Advanced Testing
```bash
# Test with Ethereum
./scripts/test_bridge_flow.sh

# Test IBC parsing
./scripts/test_ibc_flow.sh

# Run full unit tests
make test-unit
```

### For Real IBC
See [`docs/testing_ibc_and_bridge.md`](file:///data/data/v4-chain/protocol/docs/testing_ibc_and_bridge.md) for:
- Hermes relayer setup
- Noble testnet connection
- Real cross-chain transfers

---

**All tests are now working with the corrected commands!** 🎉
