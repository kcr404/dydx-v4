## Short-Term Orders via gRPC - Complete Guide

### Overview

This document explains how to place and verify **short-term orders** on dYdX v4 using gRPC. Short-term orders follow a special execution path through MemClob and are **not** regular transactions.

---

### Why gRPC (Not CLI) for Short-Term Orders

**Short-term orders MUST use gRPC**, not CLI transactions:

- **OrderFlags = 0** marks orders as short-term
- Short-term orders are **filtered** from normal txs in `PrepareProposal`
- They go through **MemClob + MsgProposedOperations** path
- CLI txs for short-term orders fail with decoding/ABCI+ errors
- **Correct path**: gRPC/WebSockets → MemClob → in-memory order book

---

### Architecture: How Short-Term Orders Work

```
┌─────────────┐
│   Client    │
│  (gRPC SDK) │
└──────┬──────┘
       │ placeShortTermOrder()
       ▼
┌─────────────────────┐
│   Validator Node    │
│                     │
│  ┌───────────────┐  │
│  │    MemClob    │  │ ← In-memory order book
│  │  (Short-term) │  │
│  └───────┬───────┘  │
│          │          │
│          ▼          │
│  ┌───────────────┐  │
│  │ Proposed Ops  │  │ ← Bundled into MsgProposedOperations
│  └───────┬───────┘  │
│          │          │
└──────────┼──────────┘
           │
           ▼
    ┌─────────────┐
    │    Block    │ ← Included in block, matching happens
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │   Indexer   │ ← Ender processes events → Database
    └─────────────┘
```

**Key Points:**
1. Orders submitted via gRPC go to **MemClob** (in-memory)
2. Validators bundle them into **MsgProposedOperations**
3. Orders are **NOT** individual transactions in `/tx` index
4. Matching happens in-block via MemClob
5. Indexer (Ender) processes events for historical queries

---

### Setup Requirements

#### 1. Protocol Chain (Localnet)

```bash
cd /data/data/v4-chain/protocol
docker-compose -f docker-compose.local.yml up -d

# Verify chain is running
curl -s http://localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

**Endpoints:**
- RPC: `http://localhost:26657`
- REST: `http://localhost:1317`
- gRPC: `localhost:9090`

#### 2. Indexer Services (Optional, for API queries)

```bash
cd /data/data/v4-chain/indexer
docker-compose -f docker-compose-local-deployment.yml up -d \
  postgres redis postgres-package comlink ender

# Verify services
docker-compose -f docker-compose-local-deployment.yml ps
```

**Endpoints:**
- Comlink (REST): `http://localhost:3002`
- Socks (WebSocket): `ws://localhost:3003`
- Postgres: `localhost:5435`
- Redis: `localhost:6382`

#### 3. gRPC Test Environment

```bash
cd /data/data/v4-chain/grpc-test
npm install @dydxprotocol/v4-client-js
```

---

### Placing Short-Term Orders

#### Using Node.js SDK

**Script Location:** `/data/data/v4-chain/grpc-test/trade_short_long_ready.js`

```javascript
const { 
    CompositeClient, 
    LocalWallet, 
    BECH32_PREFIX, 
    Order_Side, 
    Order_TimeInForce, 
    Network,
    SubaccountInfo 
} = require('@dydxprotocol/v4-client-js');

async function placeShortTermOrder() {
    // 1. Create wallet from mnemonic
    const ALICE_MNEMONIC = "merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small";
    const wallet = await LocalWallet.fromMnemonic(ALICE_MNEMONIC, BECH32_PREFIX);
    
    // 2. Connect to local network
    const network = Network.local();
    const client = await CompositeClient.connect(network);
    
    // 3. Create subaccount
    const subaccount = new SubaccountInfo(wallet, 0);
    
    // 4. Get current height and calculate GoodTilBlock
    const height = await client.validatorClient.get.latestBlockHeight();
    const requestedGtb = height + 8;  // 8 blocks in the future
    const goodTilBlock = await client.calculateGoodTilBlock(0, null, requestedGtb);
    
    // 5. Place short-term order
    const clientId = Math.floor(Math.random() * 1000000000);
    const txHash = await client.placeShortTermOrder(
        subaccount,
        'BTC-USD',              // market
        Order_Side.SIDE_BUY,    // side
        40000,                  // price
        0.01,                   // size
        clientId,               // unique client ID
        goodTilBlock,           // good til block
        Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
        false                   // reduceOnly
    );
    
    console.log('Short-term order tx hash:', txHash);
    return txHash;
}
```

#### Key Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `subaccount` | SubaccountInfo object | `new SubaccountInfo(wallet, 0)` |
| `market` | Market ticker | `'BTC-USD'`, `'ETH-USD'` |
| `side` | BUY or SELL | `Order_Side.SIDE_BUY` |
| `price` | Limit price | `40000` |
| `size` | Order size | `0.01` |
| `clientId` | Unique order ID | Random number |
| `goodTilBlock` | Expiry block height | `currentHeight + 8` |
| `timeInForce` | Order duration | `TIME_IN_FORCE_UNSPECIFIED` |
| `reduceOnly` | Reduce-only flag | `false` |

#### Market Configuration

For **TEST-USD** market (used in local testing):

```javascript
const TEST_USD_MARKET = {
    market_id: 33,
    clobPairId: 35,
    ticker: 'TEST-USD',
    atomicResolution: -8,
    stepBaseQuantums: 1000000,
    quantumConversionExponent: -8,
    subticksPerTick: 100
};
```

---

### Verification Methods

#### ❌ What DOESN'T Work

```bash
# This will return "tx not found" - by design!
curl "http://localhost:26657/tx?hash=0x565C6A87C1785B6930A28E7401DB22220D01D363260EE6225D9FF5E62C396A5A"
```

**Why:** Short-term orders are MemClob operations, not standalone transactions.

#### ✅ Method 1: Check MsgProposedOperations (BEST)

```bash
# Get latest block height
LATEST=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')

# Check for MsgProposedOperations in recent blocks
for height in $(seq $((LATEST - 5)) $LATEST); do
    curl -s "http://localhost:26657/block_results?height=$height" | \
        jq -r '.result.txs_results[]?.events[]? | 
               select(.type == "message") | 
               .attributes[] | 
               select(.value | contains("MsgProposedOperations"))' \
        && echo "✅ Block $height has MsgProposedOperations"
done
```

**Expected Output:**
```
✅ Block 1963: Found MsgProposedOperations
✅ Block 1964: Found MsgProposedOperations
✅ Block 1965: Found MsgProposedOperations
```

#### ✅ Method 2: Query Subaccount Positions

```bash
ALICE="dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4"

# Check if positions changed (indicates fills)
docker exec protocol-dydxprotocold0-1 dydxprotocold query subaccounts get \
    "$ALICE" 0 --node tcp://localhost:26657 --output json | \
    jq '{
        perpetual_positions: .subaccount.perpetual_positions,
        asset_positions: .subaccount.asset_positions
    }'
```

**What to look for:**
- `perpetual_positions`: Shows open positions (if order filled)
- `asset_positions`: Shows USDC balance changes

#### ✅ Method 3: Indexer Database (When Ender is Running)

```bash
# Query orders table
docker exec indexer_postgres_1 psql -U dydx_dev -d dydx_dev -c \
    "SELECT id, \"subaccountId\", side, size, price, status, \"createdAtHeight\" 
     FROM orders 
     ORDER BY \"createdAtHeight\" DESC 
     LIMIT 10;"
```

**Note:** Requires Ender service to be running and processing events.

#### ✅ Method 4: Indexer REST API (When Comlink is Healthy)

```bash
ALICE="dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4"

# Query orders via HTTP
curl "http://localhost:3002/v4/orders?address=$ALICE&subaccountNumber=0&limit=10" | jq '.'
```

**Note:** Requires Comlink with working Redis connection.

#### 🔧 Automated Verification Script

```bash
cd /data/data/v4-chain/protocol
bash scripts/verify_short_term_orders.sh
```

This script checks all verification methods and provides a comprehensive report.

---

### Common Issues and Solutions

#### Issue 1: "tx not found" in `/tx` endpoint

**Status:** ✅ **This is normal!**

**Explanation:** Short-term orders are not indexed as individual transactions. They appear in blocks as `MsgProposedOperations`.

**Solution:** Use verification methods above (check for MsgProposedOperations).

---

#### Issue 2: Indexer Database is Empty

**Symptoms:**
```sql
SELECT * FROM orders;
-- (0 rows)
```

**Cause:** Ender service is not running or not processing events.

**Solution:**
```bash
cd /data/data/v4-chain/indexer

# Start Ender
docker-compose -f docker-compose-local-deployment.yml up -d ender

# Check logs
docker logs -f indexer_ender_1
```

---

#### Issue 3: Comlink Redis Connection Error

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:6382
```

**Cause:** Comlink is trying to connect to `localhost:6382` instead of `redis:6379`.

**Solution:** Fix environment variable in docker-compose:
```yaml
comlink:
  environment:
    - REDIS_URL=redis://redis:6379  # Not localhost!
```

---

### Testing Workflow

#### 1. Start Services

```bash
# Start protocol chain
cd /data/data/v4-chain/protocol
docker-compose -f docker-compose.local.yml up -d

# Start indexer (optional)
cd /data/data/v4-chain/indexer
docker-compose -f docker-compose-local-deployment.yml up -d \
  postgres redis postgres-package comlink ender
```

#### 2. Run Short-Term Order Test

```bash
cd /data/data/v4-chain/grpc-test
node trade_short_long_ready.js
```

**Expected Output:**
```
🚀 Testing Short-Term Orders via gRPC

✅ Alice: dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4
✅ Bob: dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs

📊 Current block height: 721
📊 Good Til Block: 729

Alice short-term tx hash (hex): 565C6A87C1785B6930A28E7401DB22220D01D363260EE6225D9FF5E62C396A5A
Bob short-term tx hash (hex): D0C54E05FADD329F413F16666C3856A97650869ED6087C529A3A86FBD1C02FAF
```

#### 3. Verify Execution

```bash
# Run verification script
cd /data/data/v4-chain/protocol
bash scripts/verify_short_term_orders.sh
```

---

### Key Differences: Short-Term vs Long-Term Orders

| Feature | Short-Term | Long-Term |
|---------|-----------|-----------|
| **Validity** | GoodTilBlock (GTB) | GoodTilBlockTime (GTBT) |
| **Storage** | In-memory (MemClob) | Persisted to state |
| **Duration** | Single block window | Up to 95 days |
| **Tx Index** | Not in `/tx` | Available in `/tx` |
| **Method** | `placeShortTermOrder()` | `placeOrder()` with GTT |
| **Use Case** | High-frequency trading | Limit orders, stop-loss |

---

### Reference Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| **trade_short_long_ready.js** | `/data/data/v4-chain/grpc-test/` | Place short-term + long-term orders |
| **verify_short_term_orders.sh** | `/data/data/v4-chain/protocol/scripts/` | Verify order execution |
| **test_orders.sh** | `/data/data/v4-chain/protocol/scripts/` | CLI-based order testing |

---

### Wallets and Addresses

**Alice (Trader A):**
- Mnemonic: `merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small`
- Address: `dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4`

**Bob (Trader B):**
- Mnemonic: `color habit donor nurse dinosaur stable wonder process post perfect raven gold census inside worth inquiry mammal panic olive toss shadow strong name drum`
- Address: `dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs`

---

### Additional Resources

- **Official Docs**: [dYdX Trading Documentation](https://docs.dydx.xyz/interaction/trading)
- **SDK Reference**: `@dydxprotocol/v4-client-js`
- **Local Setup**: [GRPC_TRADING_STATUS.md](file:///data/data/v4-chain/GRPC_TRADING_STATUS.md)
- **Architecture Analysis**: [SHORT_TERM_ORDER_FIX.md](file:///data/data/v4-chain/protocol/docs/SHORT_TERM_ORDER_FIX.md)

---

### Summary

✅ **Short-term orders work via gRPC**, not CLI  
✅ **They appear as MsgProposedOperations**, not individual txs  
✅ **Verification requires checking blocks**, not `/tx` endpoint  
✅ **Indexer provides historical queries** (when Ender is running)  
✅ **MemClob handles matching** in-memory for performance  

This is **by design** for high-performance trading on dYdX v4.
