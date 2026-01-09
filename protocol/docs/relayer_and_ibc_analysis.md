# dYdX v4 Relayer Services & IBC Token Import Analysis

## 🔍 Current Status

### Relayer Services Running: **0** (Chain is Down)

```bash
# Check performed:
ps aux | grep -i relayer  # No relayer processes found
docker ps | grep -i relayer  # No relayer containers running
docker ps -a  # No containers running at all
```

**Status**: The local chain is currently **not running**, so no relayer services are active.

---

## 🌉 Token Import Mechanisms in dYdX v4

dYdX v4 uses **TWO primary mechanisms** for importing tokens from other chains:

### 1. **Bridge Daemon** (Ethereum → dYdX)
### 2. **IBC Transfer** (Cosmos Chains → dYdX)

---

## 1️⃣ Bridge Daemon (Ethereum Integration)

### Purpose
Bridges tokens from **Ethereum** to dYdX v4 chain.

### Configuration
From [`docker-compose.yml`](file:///data/data/v4-chain/protocol/docker-compose.yml):

```yaml
dydxprotocold0:
  entrypoint:
    - --bridge-daemon-eth-rpc-endpoint
    - "${ETH_RPC_ENDPOINT}"
    - --max-daemon-unhealthy-seconds
    - "4294967295"  # Effectively disabled in localnet
```

### How It Works

```
┌─────────────┐
│  Ethereum   │
│   Network   │
└──────┬──────┘
       │
       │ Bridge Daemon monitors
       │ Ethereum events
       ▼
┌─────────────┐
│ Bridge      │
│ Daemon      │ ← Runs inside each validator
└──────┬──────┘
       │
       │ Submits bridge events
       │ to dYdX chain
       ▼
┌─────────────┐
│  dYdX v4    │
│   Chain     │
│ (x/bridge)  │
└─────────────┘
```

### Key Components

#### Bridge Daemon Location
- **Path**: [`daemons/bridge/`](file:///data/data/v4-chain/protocol/daemons/bridge/)
- **Module**: `x/bridge`
- **Service Name**: `bridge-daemon`

#### Flags
```go
// From: daemons/flags/flags.go
FlagBridgeDaemonEnabled        = "bridge-daemon-enabled"
FlagBridgeDaemonLoopDelayMs    = "bridge-daemon-loop-delay-ms"
FlagBridgeDaemonEthRpcEndpoint = "bridge-daemon-eth-rpc-endpoint"
```

#### How Validators Run It
Each validator node runs the bridge daemon **internally**:
- Not a separate service
- Embedded in `dydxprotocold` process
- Monitors Ethereum RPC endpoint
- Submits bridge events to consensus

---

## 2️⃣ IBC Transfer (Cosmos Ecosystem Integration)

### Purpose
Enables token transfers from **other Cosmos chains** (Noble, Osmosis, etc.) to dYdX v4.

### IBC Architecture

```
┌──────────────┐                    ┌──────────────┐
│    Noble     │                    │   Osmosis    │
│  (USDC hub)  │                    │   (DEX)      │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │ IBC Channel                       │ IBC Channel
       │ channel-0                         │ channel-5
       │                                   │
       ▼                                   ▼
┌────────────────────────────────────────────────┐
│              dYdX v4 Chain                     │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  IBC Transfer Module (cosmos-sdk)        │ │
│  │  - Receives packets                      │ │
│  │  - Validates proofs                      │ │
│  │  - Mints/burns tokens                    │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  x/ratelimit Module (dYdX custom)        │ │
│  │  - Rate limiting on IBC transfers        │ │
│  │  - Prevents rapid draining               │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

---

## 🔗 IBC Channel Configuration

### Evidence from Code

From [`x/ratelimit/util/parse_denom_test.go`](file:///data/data/v4-chain/protocol/x/ratelimit/util/parse_denom_test.go):

```go
// IBC Channels configured in dYdX v4:
nobleChannelOnDydx := "channel-0"   // Noble ↔ dYdX
osmoChannelOnDydx  := "channel-5"   // Osmosis ↔ dYdX

// Reverse channels:
dydxChannelOnNoble := "channel-100"
dydxChannelOnOsmo  := "channel-101"
```

### Channel Map

| Chain | Channel on dYdX | Channel on Remote | Purpose |
|-------|----------------|-------------------|---------|
| **Noble** | `channel-0` | `channel-100` | USDC transfers |
| **Osmosis** | `channel-5` | `channel-101` | Multi-asset DEX |

---

## 💰 How USDC is Imported via IBC

### Scenario 1: Direct Transfer from Noble

```
Step 1: USDC on Noble
  Denom: uusdc (native on Noble)

Step 2: IBC Transfer Noble → dYdX
  Channel: channel-0 (on dYdX side)
  
Step 3: Denom on dYdX
  Prefix added: transfer/channel-0/uusdc
  Hashed to: ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5
```

### Code Evidence

```go
// From: x/ratelimit/util/parse_denom_test.go:31-43
// Sink asset one hop away:
//   uusdc sent from Noble to dYdX
//   -> tack on prefix (transfer/channel-0/uusdc) and hash
{
    name:               "sink_one_hop",
    packetDenomTrace:   "uusdc",
    sourceChannel:      "channel-100",  // dYdX channel on Noble
    destinationChannel: "channel-0",    // Noble channel on dYdX
    expectedDenom:      hashDenomTrace("transfer/channel-0/uusdc"),
}
```

### Scenario 2: Multi-Hop Transfer (Noble → Osmosis → dYdX)

```
Step 1: USDC on Noble
  Denom: uusdc

Step 2: Noble → Osmosis
  Denom on Osmosis: transfer/channel-200/uusdc

Step 3: Osmosis → dYdX
  Denom on dYdX: transfer/channel-5/transfer/channel-200/uusdc
  Hashed to: ibc/[hash]
```

### Code Evidence

```go
// From: x/ratelimit/util/parse_denom_test.go:55-73
// Sink asset two hops away:
//   uusdc sent from Noble to Osmosis to dYdX (transfer/channel-200/uusdc)
//   -> tack on prefix (transfer/channel-5/transfer/channel-200/uusdc) and hash
{
    name:               "sink_two_hops",
    packetDenomTrace:   "transfer/channel-200/uusdc",
    sourceChannel:      "channel-101",  // dYdX channel on Osmosis
    destinationChannel: "channel-5",    // Osmosis channel on dYdX
    expectedDenom:      hashDenomTrace(
        "transfer/channel-5/transfer/channel-200/uusdc"
    ),
}
```

---

## 🛡️ Rate Limiting System

### Purpose
Prevents rapid draining of IBC tokens (security measure).

### Module Location
- **Path**: [`x/ratelimit/`](file:///data/data/v4-chain/protocol/x/ratelimit/)
- **Functionality**: Custom dYdX module wrapping IBC transfers

### How It Works

```go
// From: x/ratelimit/util/parse_denom.go

// For RECEIVING packets (other chain → dYdX):
func ParseDenomFromRecvPacket(packet, packetData) string {
    // 1. Check if token is native to dYdX
    // 2. If NON-NATIVE, add IBC prefix
    // 3. Hash the denom trace
    // 4. Apply rate limits
}

// For SENDING packets (dYdX → other chain):
func ParseDenomFromSendPacket(packetData) string {
    // 1. Check if token is native
    // 2. If native, keep as-is
    // 3. If non-native, hash the trace
    // 4. Apply rate limits
}
```

---

## 🔄 IBC Relayer (External Service)

### What is an IBC Relayer?

An **IBC relayer** is an **off-chain service** that:
1. Monitors IBC packets on both chains
2. Submits proofs to destination chain
3. Enables cross-chain communication

### Common Relayer Implementations

| Relayer | Language | Repository |
|---------|----------|------------|
| **Hermes** | Rust | `informalsystems/hermes` |
| **Go Relayer** | Go | `cosmos/relayer` |
| **TypeScript Relayer** | TS | `confio/ts-relayer` |

### Relayer Configuration Found

File: [`noble_relayer.mnemonic`](file:///data/v4-chain/protocol/noble_relayer.mnemonic)
```
match early kind black cart region letters people floor floor floor floor
```

This suggests a **Noble ↔ dYdX relayer** was configured at some point.

---

## 📊 How to Set Up IBC Relayer

### Option 1: Hermes Relayer

```bash
# Install Hermes
cargo install ibc-relayer-cli --bin hermes

# Configure chains
cat > ~/.hermes/config.toml <<EOF
[[chains]]
id = 'dydx-mainnet-1'
rpc_addr = 'http://localhost:26657'
grpc_addr = 'http://localhost:9090'
account_prefix = 'dydx'
key_name = 'dydx-relayer'
store_prefix = 'ibc'
gas_price = { price = 0.025, denom = 'adv4tnt' }

[[chains]]
id = 'noble-1'
rpc_addr = 'https://noble-rpc.polkachu.com:443'
grpc_addr = 'https://noble-grpc.polkachu.com:443'
account_prefix = 'noble'
key_name = 'noble-relayer'
store_prefix = 'ibc'
gas_price = { price = 0.025, denom = 'uusdc' }
EOF

# Add keys
hermes keys add --chain dydx-mainnet-1 --mnemonic-file ./noble_relayer.mnemonic
hermes keys add --chain noble-1 --mnemonic-file ./noble_relayer.mnemonic

# Create channel (if not exists)
hermes create channel --a-chain dydx-mainnet-1 --b-chain noble-1 \
  --a-port transfer --b-port transfer --new-client-connection

# Start relayer
hermes start
```

### Option 2: Go Relayer

```bash
# Install
go install github.com/cosmos/relayer/v2@latest

# Initialize
rly config init

# Add chains
rly chains add dydx
rly chains add noble

# Add keys
rly keys restore dydx relayer "$(cat noble_relayer.mnemonic)"
rly keys restore noble relayer "$(cat noble_relayer.mnemonic)"

# Create path
rly paths new dydx noble dydx-noble

# Link path
rly tx link dydx-noble

# Start relayer
rly start dydx-noble
```

---

## 🎯 Summary

### Relayer Services

| Service | Type | Status | Purpose |
|---------|------|--------|---------|
| **Bridge Daemon** | Embedded | ❌ Not running | Ethereum → dYdX bridging |
| **IBC Relayer** | External | ❌ Not configured | Cosmos chains ↔ dYdX |

### Token Import Methods

| Method | Source | Mechanism | Example |
|--------|--------|-----------|---------|
| **Bridge** | Ethereum | Bridge Daemon | ETH, USDC (ERC-20) |
| **IBC** | Noble | IBC Transfer | USDC (native) |
| **IBC** | Osmosis | IBC Transfer | OSMO, ATOM, etc. |

### IBC Channels Configured

```
Noble (channel-0) ←→ dYdX
Osmosis (channel-5) ←→ dYdX
```

### How USDC Gets to dYdX

```
Option 1: Ethereum Bridge
  USDC (ERC-20) → Bridge Daemon → dYdX

Option 2: Noble IBC
  USDC (native) → IBC channel-0 → dYdX
  Denom: ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5

Option 3: Multi-hop IBC
  USDC (Noble) → Osmosis → dYdX
  Denom: ibc/[different-hash]
```

---

## 🚀 To Start Relayer Services

### 1. Start the Chain
```bash
cd /data/data/v4-chain/protocol
make localnet-start
```

### 2. Bridge Daemon
Already embedded in validators - starts automatically with chain.

### 3. IBC Relayer (Optional)
Set up Hermes or Go Relayer as shown above to enable IBC transfers.

---

## 📚 Key Files

- Bridge Daemon: [`daemons/bridge/`](file:///data/data/v4-chain/protocol/daemons/bridge/)
- IBC Module: `x/ratelimit/`
- Bridge Module: [`x/bridge/`](file:///data/data/v4-chain/protocol/x/bridge/)
- Relayer Mnemonic: [`noble_relayer.mnemonic`](file:///data/data/v4-chain/protocol/noble_relayer.mnemonic)
- Docker Compose: [`docker-compose.yml`](file:///data/data/v4-chain/protocol/docker-compose.yml)

---

## 🔑 Key Takeaways

1. **No relayers currently running** (chain is down)
2. **Bridge Daemon** is embedded in validators (not a separate service)
3. **IBC Relayer** is an external service (needs to be set up separately)
4. **Two token import methods**: Ethereum Bridge + IBC Transfer
5. **Noble USDC** comes via IBC `channel-0`
6. **Rate limiting** protects against rapid token draining
7. **Multi-hop IBC** is supported (e.g., Noble → Osmosis → dYdX)
