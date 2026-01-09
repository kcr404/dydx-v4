# Testing IBC & Bridge Flows on Local dYdX v4

## 🎯 Overview

This guide shows you how to test:
1. **Bridge Daemon** (Ethereum → dYdX)
2. **IBC Transfers** (Simulated locally)
3. **Rate Limiting** (IBC security)

---

## 📋 Prerequisites

```bash
# Required tools
- Docker & Docker Compose
- Go 1.21+
- Make
- jq (for JSON parsing)

# Optional (for real IBC testing)
- Hermes relayer
- Access to testnet chains (Noble, Osmosis)
```

---

## 🚀 Part 1: Start Local Chain

### Step 1: Build and Start Localnet

```bash
cd /data/data/v4-chain/protocol

# Clean start (resets all chain data)
make localnet-start

# Or continue with existing data
make localnet-continue
```

**What this does:**
- Builds Docker image with dYdX protocol
- Starts 4 validator nodes (alice, bob, carl, dave)
- Starts Slinky oracle sidecar
- Exposes ports:
  - `26657`: RPC (alice)
  - `9090`: gRPC
  - `1317`: REST API

### Step 2: Verify Chain is Running

```bash
# Check chain status
curl -s http://localhost:26657/status | jq '.result.sync_info'

# Expected output:
{
  "latest_block_height": "123",
  "latest_block_time": "2026-01-07T...",
  "catching_up": false
}
```

### Step 3: Check Available Accounts

```bash
# List test accounts
./build/dydxprotocold keys list --home ./tmp_keyring --keyring-backend test

# You should see:
# - alice
# - bob
# - carl
# - dave
```

---

## 🌉 Part 2: Test Bridge Daemon (Ethereum → dYdX)

### Overview

The bridge daemon monitors Ethereum for bridge events and submits them to the dYdX chain.

### Step 1: Check Bridge Configuration

```bash
# View bridge module state
./build/dydxprotocold query bridge event-params --node http://localhost:26657

# Expected output:
event_params:
  denom: adv4tnt
  eth_address: "0x..."
  eth_chain_id: 11155111  # Sepolia testnet
```

### Step 2: Query Bridge Events from Ethereum

Use the provided script to fetch bridge events:

```bash
cd /data/data/v4-chain/protocol

# Query Sepolia testnet for bridge events
go run scripts/bridge_events/bridge_events.go \
  -denom adv4tnt \
  -totalsupply 1000000000000000000000000000 \
  -rpc https://eth-sepolia.g.alchemy.com/v2/demo \
  -address 0xcca9D5f0a3c58b6f02BD0985fC7F9420EA24C1f0 \
  -toblock 7000000
```

**What this does:**
- Connects to Ethereum Sepolia RPC
- Queries bridge contract for deposit events
- Calculates expected dYdX chain state
- Outputs balances that should be credited

**Example Output:**
```
Using the following configuration:
denom: adv4tnt
totalsupply: 1000000000000000000000000000
rpc: https://eth-sepolia.g.alchemy.com/v2/demo
address: 0xcca9D5f0a3c58b6f02BD0985fC7F9420EA24C1f0
toblock: 7000000

Total amount bridged: 50000000000000000000
Remaining bridge module account balance: 999999950000000000000000000
"bridge.event_params": {
  "denom": "adv4tnt",
  "eth_chain_id": 11155111,
  "eth_address": "0xcca9D5f0a3c58b6f02BD0985fC7F9420EA24C1f0"
}
"bridge.acknowledged_event_info": {
  "next_id": 5,
  "eth_block_height": 6500000
}
"bank.balances": [
  {
    "address": "dydx1abc...",
    "coins": [
      {
        "denom": "adv4tnt",
        "amount": "50000000000000000000"
      }
    ]
  }
]
```

### Step 3: Verify Bridge Daemon is Running

```bash
# Check validator logs for bridge daemon activity
docker logs dydxprotocold0 2>&1 | grep -i bridge

# You should see:
# - Bridge daemon initialization
# - Ethereum RPC connection
# - Event polling logs
```

### Step 4: Simulate Bridge Event (Advanced)

To actually test bridging, you would need to:
1. Deploy bridge contract on Sepolia
2. Send tokens to the contract
3. Wait for bridge daemon to detect event
4. Verify tokens credited on dYdX chain

**Note**: This requires real ETH on Sepolia testnet.

---

## 🔗 Part 3: Test IBC Transfers (Simulated)

Since we don't have other chains running locally, we'll simulate IBC behavior using direct transactions.

### Scenario: Simulate USDC from Noble

### Step 1: Understand IBC Denom Format

```bash
# Noble USDC on dYdX would have this denom:
# Format: ibc/[hash of transfer/channel-0/uusdc]

# Calculate the hash
echo -n "transfer/channel-0/uusdc" | sha256sum
# Result: 8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5

# Full denom:
IBC_USDC="ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5"
```

### Step 2: Check if IBC Denom Exists

```bash
# Query total supply of IBC USDC
./build/dydxprotocold query bank total --node http://localhost:26657 | grep ibc

# Check specific denom
./build/dydxprotocold query bank denom-metadata "$IBC_USDC" --node http://localhost:26657
```

### Step 3: Simulate IBC Transfer (Using Bank Module)

```bash
# Get alice's address
ALICE=$(./build/dydxprotocold keys show alice --home ./tmp_keyring --keyring-backend test -a)

# Simulate receiving 100 USDC from Noble via IBC
# (In reality, this would come through IBC transfer module)
./build/dydxprotocold tx bank send \
  "$ALICE" \
  "$ALICE" \
  "100000000${IBC_USDC}" \
  --from alice \
  --home ./tmp_keyring \
  --keyring-backend test \
  --chain-id localdydxprotocol \
  --fees 5000000000000000adv4tnt \
  --gas 200000 \
  -y \
  --node http://localhost:26657

# Note: This will fail if the denom doesn't exist in genesis
# It's just to demonstrate the concept
```

### Step 4: Test Rate Limiting (Go Tests)

```bash
# Run rate limit tests
cd /data/data/v4-chain/protocol

# Test rate limit module
go test ./x/ratelimit/... -v

# Test IBC denom parsing
go test ./x/ratelimit/util/... -v -run TestParseDenomFromRecvPacket

# Expected output shows:
# - sink_one_hop: USDC from Noble
# - sink_two_hops: USDC via Osmosis
# - Native denom handling
```

---

## 🧪 Part 4: Advanced IBC Testing (With Real Chains)

### Option A: Test with Noble Testnet

#### Prerequisites
```bash
# Install Hermes relayer
cargo install ibc-relayer-cli --bin hermes

# Or use Go relayer
go install github.com/cosmos/relayer/v2@latest
```

#### Setup Hermes

```bash
# Create Hermes config
mkdir -p ~/.hermes
cat > ~/.hermes/config.toml <<EOF
[global]
log_level = 'info'

[[chains]]
id = 'localdydxprotocol'
rpc_addr = 'http://localhost:26657'
grpc_addr = 'http://localhost:9090'
websocket_addr = 'ws://localhost:26657/websocket'
rpc_timeout = '10s'
account_prefix = 'dydx'
key_name = 'relayer'
store_prefix = 'ibc'
gas_price = { price = 0.025, denom = 'adv4tnt' }
max_gas = 3000000

[[chains]]
id = 'grand-1'  # Noble testnet
rpc_addr = 'https://rpc.testnet.noble.strange.love:443'
grpc_addr = 'https://grpc.testnet.noble.strange.love:443'
websocket_addr = 'wss://rpc.testnet.noble.strange.love:443/websocket'
rpc_timeout = '10s'
account_prefix = 'noble'
key_name = 'noble-relayer'
store_prefix = 'ibc'
gas_price = { price = 0.025, denom = 'uusdc' }
max_gas = 3000000
EOF

# Add relayer keys
hermes keys add --chain localdydxprotocol --mnemonic-file ./noble_relayer.mnemonic
hermes keys add --chain grand-1 --mnemonic-file ./noble_relayer.mnemonic

# Create IBC connection and channel
hermes create channel \
  --a-chain localdydxprotocol \
  --b-chain grand-1 \
  --a-port transfer \
  --b-port transfer \
  --new-client-connection

# Start relayer
hermes start
```

#### Test Transfer

```bash
# Transfer USDC from Noble to dYdX
ALICE=$(./build/dydxprotocold keys show alice --home ./tmp_keyring --keyring-backend test -a)

# On Noble chain (using noble CLI)
nobled tx ibc-transfer transfer \
  transfer \
  channel-X \
  "$ALICE" \
  100000000uusdc \
  --from noble-relayer \
  --chain-id grand-1 \
  --fees 1000uusdc

# Wait for relayer to relay the packet
# Check balance on dYdX
./build/dydxprotocold query bank balances "$ALICE" --node http://localhost:26657
```

---

## 📝 Part 5: Testing Scripts

### Create Test Script for Bridge

```bash
#!/bin/bash
# File: scripts/test_bridge_flow.sh

set -e

echo "=== Testing Bridge Flow ==="

# 1. Check bridge module state
echo "1. Checking bridge module state..."
./build/dydxprotocold query bridge event-params --node http://localhost:26657

# 2. Query Ethereum for events
echo "2. Querying Ethereum for bridge events..."
go run scripts/bridge_events/bridge_events.go \
  -rpc https://eth-sepolia.g.alchemy.com/v2/demo \
  -address 0xcca9D5f0a3c58b6f02BD0985fC7F9420EA24C1f0 \
  -toblock 7000000

# 3. Check bridge module account balance
echo "3. Checking bridge module account..."
BRIDGE_ADDR=$(./build/dydxprotocold query auth module-account bridge --node http://localhost:26657 -o json | jq -r '.account.base_account.address')
./build/dydxprotocold query bank balances "$BRIDGE_ADDR" --node http://localhost:26657

echo "=== Bridge Flow Test Complete ==="
```

### Create Test Script for IBC

```bash
#!/bin/bash
# File: scripts/test_ibc_flow.sh

set -e

echo "=== Testing IBC Flow ==="

# 1. Run IBC denom parsing tests
echo "1. Running IBC denom parsing tests..."
go test ./x/ratelimit/util/... -v -run TestParseDenom

# 2. Check IBC channels
echo "2. Checking IBC channels..."
./build/dydxprotocold query ibc channel channels --node http://localhost:26657

# 3. Check IBC clients
echo "3. Checking IBC clients..."
./build/dydxprotocold query ibc client states --node http://localhost:26657

# 4. Test rate limiting
echo "4. Testing rate limiting..."
go test ./x/ratelimit/... -v

echo "=== IBC Flow Test Complete ==="
```

---

## 🎯 Part 6: Practical Testing Checklist

### ✅ Bridge Daemon Tests

- [ ] Chain is running (`curl http://localhost:26657/status`)
- [ ] Bridge daemon logs show activity (`docker logs dydxprotocold0 | grep bridge`)
- [ ] Bridge params are set (`query bridge event-params`)
- [ ] Can query Ethereum events (`go run scripts/bridge_events/bridge_events.go`)
- [ ] Bridge module account exists (`query auth module-account bridge`)

### ✅ IBC Tests

- [ ] IBC module is enabled (`query ibc channel channels`)
- [ ] Rate limit tests pass (`go test ./x/ratelimit/...`)
- [ ] Denom parsing works (`go test ./x/ratelimit/util/...`)
- [ ] Can calculate IBC denom hashes
- [ ] Rate limiting prevents rapid draining

### ✅ Integration Tests

- [ ] Unit tests pass (`make test-unit`)
- [ ] Integration tests pass (`make test-unit-and-integration`)
- [ ] Container tests pass (`make test-container`)

---

## 🐛 Troubleshooting

### Chain Won't Start

```bash
# Reset everything
make localnet-stop
make localnet-start

# Check Docker
docker ps
docker logs dydxprotocold0
```

### Bridge Daemon Not Working

```bash
# Check ETH_RPC_ENDPOINT is set
echo $ETH_RPC_ENDPOINT

# Set it if missing
export ETH_RPC_ENDPOINT="https://eth-sepolia.g.alchemy.com/v2/demo"

# Restart chain
make localnet-stop
make localnet-start
```

### IBC Tests Failing

```bash
# Update dependencies
go mod tidy
go mod download

# Run specific test
go test ./x/ratelimit/util/... -v -run TestParseDenomFromRecvPacket
```

---

## 📚 Additional Resources

### Useful Commands

```bash
# Query all modules
./build/dydxprotocold query --help

# Check all IBC commands
./build/dydxprotocold query ibc --help

# View bridge module
./build/dydxprotocold query bridge --help

# Check rate limits
./build/dydxprotocold query ratelimit --help
```

### Log Locations

```bash
# Validator logs
docker logs dydxprotocold0  # alice
docker logs dydxprotocold1  # bob
docker logs dydxprotocold2  # carl
docker logs dydxprotocold3  # dave

# Follow logs
docker logs -f dydxprotocold0
```

### Chain Data

```bash
# Chain data stored in:
./localnet/dydxprotocol0/  # alice's data
./localnet/dydxprotocol1/  # bob's data
./localnet/dydxprotocol2/  # carl's data
./localnet/dydxprotocol3/  # dave's data
```

---

## 🎓 Summary

### What We Tested

1. **Bridge Daemon**
   - ✅ Monitors Ethereum for bridge events
   - ✅ Embedded in each validator
   - ✅ Can query historical events
   - ✅ Calculates expected chain state

2. **IBC Transfers**
   - ✅ Denom parsing (Noble, Osmosis)
   - ✅ Multi-hop transfers
   - ✅ Rate limiting security
   - ✅ Hash calculation

3. **Local Testing**
   - ✅ Localnet setup
   - ✅ Unit tests
   - ✅ Integration tests
   - ✅ Module queries

### Next Steps

1. **For Real Testing**:
   - Get Sepolia ETH
   - Deploy bridge contract
   - Set up Hermes relayer
   - Connect to Noble testnet

2. **For Development**:
   - Write more unit tests
   - Test edge cases
   - Simulate failures
   - Benchmark performance

---

## 🔗 Quick Reference

```bash
# Start chain
make localnet-start

# Stop chain
make localnet-stop

# Run tests
make test-unit
make test-unit-and-integration

# Query bridge
./build/dydxprotocold query bridge event-params --node http://localhost:26657

# Query IBC
./build/dydxprotocold query ibc channel channels --node http://localhost:26657

# Test bridge events
go run scripts/bridge_events/bridge_events.go -rpc https://eth-sepolia.g.alchemy.com/v2/demo

# Test rate limiting
go test ./x/ratelimit/... -v
```

---

**You're now ready to test IBC and bridge flows on your local dYdX v4 chain!** 🚀
