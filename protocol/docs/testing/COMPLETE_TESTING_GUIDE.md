# dYdX v4 gRPC Trading - Complete Setup & Testing Guide

## Quick Reference: All Scripts & Locations

### Main Testing Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| **trade_short_long_ready.js** | `/data/data/v4-chain/grpc-test/` | gRPC short-term + long-term orders |
| **test_orders.sh** | `/data/data/v4-chain/protocol/scripts/` | CLI short-term + long-term orders |
| **verify_short_term_orders.sh** | `/data/data/v4-chain/protocol/scripts/` | Verify order execution |

---

## Part 1: Complete Setup on New PC

### Step 1: Clone the Repository

```bash
cd /data/data
git clone https://github.com/dydxprotocol/v4-chain.git
cd v4-chain
```

### Step 2: Start the Protocol Chain

```bash
cd /data/data/v4-chain/protocol

# Start the local devnet
docker-compose -f docker-compose.local.yml up -d

# Wait for chain to start (30 seconds)
sleep 30

# Verify chain is running
curl -s http://localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

**Expected Output:** A block height number (e.g., `150`)

### Step 3: Start Indexer Services (Optional)

```bash
cd /data/data/v4-chain/indexer

# Start essential services
docker-compose -f docker-compose-local-deployment.yml up -d \
  postgres redis postgres-package comlink

# Verify services
docker-compose -f docker-compose-local-deployment.yml ps
```

### Step 4: Setup gRPC Test Environment

```bash
cd /data/data/v4-chain/grpc-test

# Install dependencies
npm install

# Verify installation
ls node_modules/@dydxprotocol/v4-client-js
```

---

## Part 2: Testing Scripts

### Script 1: gRPC Short-Term + Long-Term Orders (RECOMMENDED)

**Location:** `/data/data/v4-chain/grpc-test/trade_short_long_ready.js`

**What it does:**
- Places short-term orders via gRPC (MemClob path)
- Places long-term orders via gRPC (stateful path)
- Returns transaction hashes for verification

**How to run:**

```bash
cd /data/data/v4-chain/grpc-test
node trade_short_long_ready.js
```

**Expected Output:**

```
=========================================
  dYdX gRPC Trading (Short + Long term)
=========================================

Wallets / Subaccounts:
  Alice addr: dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4 sub=0
  Bob   addr: dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs sub=0

Connecting via Network.local()...
✅ CompositeClient connected.

=== SHORT-TERM ORDERS (gRPC) ===
Height: 721 Requested GTB: 729 Validated GTB: 729
Placing Alice SHORT-TERM BUY 0.01 TEST-USD @ 1 (clientId=53554)...
  Alice short-term tx hash (hex): 1C28157346FEBC871FAD6AF73F3E2C10E336890C247266935B68E45402BBCB81
Placing Bob SHORT-TERM SELL 0.01 TEST-USD @ 1 (clientId=53555)...
  Bob short-term tx hash (hex): D0C54E05FADD329F413F16666C3856A97650869ED6087C529A3A86FBD1C02FAF

=== LONG-TERM ORDERS (gRPC) ===
Placing Alice LONG-TERM BUY 0.01 TEST-USD @ 1 (clientId=53556)...
  Alice long-term tx hash: 0A502421201AC03F7D8F6EA4A1B5DA429ABACAAC1A038F7BF669610589ED8F63
Placing Bob LONG-TERM SELL 0.01 TEST-USD @ 1 (clientId=53557)...
  Bob long-term tx hash: 610424BB749DB9FBD45411433433F54FC0F85E33BC63AF749A097E635E150907

✨ All orders placed successfully!
```

---

### Script 2: CLI Short-Term + Long-Term Orders

**Location:** `/data/data/v4-chain/protocol/scripts/test_orders.sh`

**What it does:**
- Places short-term orders via CLI (Docker exec)
- Places long-term orders via CLI
- Verifies inclusion in blocks

**How to run:**

```bash
cd /data/data/v4-chain/protocol/scripts
bash test_orders.sh
```

**Expected Output:**

```
=========================================
  dYdX Order Testing Suite
=========================================

Step 1: Verifying chain status...
   ✅ Chain is running at height: 839

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: SHORT-TERM ORDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 3: Placing SHORT-TERM matching orders...
   Current Height: 839
   Good Til Block: 844
   Alice Client ID: 387787
   Bob Client ID: 387788

   [Alice] Placing BUY order...
   ✅ Alice TxHash: 4AC8C19571AD0252C8FC612F5AC1664F263F98E27B4CCE48F37794A3338D3805
   [Bob] Placing SELL order...
   ✅ Bob TxHash: E9D72C5352512EE7883ED0C1143CBB05CE2243D6966747C8D04DA1B01BBA3122

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: STATEFUL ORDERS (Long-Term)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 5: Placing STATEFUL matching orders...
   [Alice] Placing STATEFUL BUY order...
   ✅ Alice TxHash: 22D427297547895361FAD9E07D5ACD02A5D12DF4977B9BA35A8CBB4D59C58F54
   [Bob] Placing STATEFUL SELL order...
   ✅ Bob TxHash: 58D4A667E5B59D83F9A1325BFA193B9631D4615CDEAA7F5615FC9F1E2FBA0FE3

Step 6: Waiting for stateful order inclusion...
   ✅ Alice (Stateful): INCLUDED at height 842 (SUCCESS)
   ✅ Bob (Stateful): INCLUDED at height 842 (SUCCESS)
```

---

### Script 3: Verify Short-Term Orders

**Location:** `/data/data/v4-chain/protocol/scripts/verify_short_term_orders.sh`

**What it does:**
- Checks for MsgProposedOperations in blocks
- Queries subaccount state
- Checks CLOB pair configuration
- Attempts to query indexer database

**How to run:**

```bash
cd /data/data/v4-chain/protocol/scripts
bash verify_short_term_orders.sh
```

**Expected Output:**

```
=========================================
  Short-Term Order Verification
=========================================

📊 Current block height: 1968

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Method 1: Checking MsgProposedOperations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   ✅ Block 1958: Found MsgProposedOperations (5 txs in block)
   ✅ Block 1959: Found MsgProposedOperations (5 txs in block)
   ✅ Block 1960: Found MsgProposedOperations (5 txs in block)
   ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Method 3: CLOB Pair State
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLOB Pair 35 (TEST-USD) configuration:
{
  "id": 35,
  "perpetual_clob_metadata": {"perpetual_id": 35},
  "step_base_quantums": "1000000",
  "subticks_per_tick": 100,
  "quantum_conversion_exponent": -8,
  "status": "STATUS_ACTIVE"
}
```

---

## Part 3: Manual Verification Commands

### Check Chain Status

```bash
# Get current block height
curl -s http://localhost:26657/status | jq '.result.sync_info.latest_block_height'

# Check if chain is producing blocks
watch -n 1 'curl -s http://localhost:26657/status | jq -r ".result.sync_info.latest_block_height"'
```

### Check for MsgProposedOperations

```bash
# Get latest height
LATEST=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')

# Check recent blocks for proposed operations
for height in $(seq $((LATEST - 10)) $LATEST); do
    HAS_OPS=$(curl -s "http://localhost:26657/block_results?height=$height" 2>/dev/null | \
        jq -r '.result.txs_results[]?.events[]? | 
               select(.type == "message") | 
               .attributes[] | 
               select(.value | contains("MsgProposedOperations")) | 
               .value' 2>/dev/null)
    
    if [ ! -z "$HAS_OPS" ]; then
        echo "✅ Block $height: Contains MsgProposedOperations"
    fi
done
```

### Check Transaction Count in Blocks

```bash
# See how many transactions are in recent blocks
LATEST=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')

for height in $(seq $((LATEST - 10)) $LATEST); do
    TX_COUNT=$(curl -s "http://localhost:26657/block?height=$height" 2>/dev/null | \
        jq '.result.block.data.txs | length')
    echo "Block $height: $TX_COUNT transactions"
done
```

### Verify Long-Term Order via /tx

```bash
# Long-term orders CAN be verified via /tx endpoint
TX_HASH="22D427297547895361FAD9E07D5ACD02A5D12DF4977B9BA35A8CBB4D59C58F54"

curl -s "http://localhost:26657/tx?hash=0x$TX_HASH" | jq '{
    height: .result.height,
    code: .result.tx_result.code,
    log: .result.tx_result.log
}'
```

---

## Part 4: Complete Testing Workflow

### Full Test Sequence

```bash
#!/bin/bash
# Complete testing workflow

echo "=== dYdX v4 Complete Testing Workflow ==="
echo ""

# 1. Start services
echo "Step 1: Starting protocol chain..."
cd /data/data/v4-chain/protocol
docker-compose -f docker-compose.local.yml up -d
sleep 30

# 2. Verify chain
echo "Step 2: Verifying chain status..."
HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
echo "   Current height: $HEIGHT"

# 3. Start indexer (optional)
echo "Step 3: Starting indexer services..."
cd /data/data/v4-chain/indexer
docker-compose -f docker-compose-local-deployment.yml up -d postgres redis postgres-package comlink
sleep 10

# 4. Run gRPC tests
echo "Step 4: Running gRPC order tests..."
cd /data/data/v4-chain/grpc-test
node trade_short_long_ready.js

# 5. Verify orders
echo "Step 5: Verifying order execution..."
cd /data/data/v4-chain/protocol/scripts
bash verify_short_term_orders.sh

echo ""
echo "=== Testing Complete! ==="
```

Save this as `complete_test.sh` and run:

```bash
chmod +x complete_test.sh
./complete_test.sh
```

---

## Part 5: File Locations Summary

### Scripts to Copy to New PC

```
/data/data/v4-chain/
├── grpc-test/
│   ├── trade_short_long_ready.js ⭐ Main gRPC test
│   ├── package.json
│   └── node_modules/ (install via npm install)
│
└── protocol/
    └── scripts/
        ├── test_orders.sh ⭐ CLI test
        └── verify_short_term_orders.sh ⭐ Verification
```

### Configuration Files

```
/data/data/v4-chain/
├── protocol/
│   └── docker-compose.local.yml (Chain config)
│
└── indexer/
    └── docker-compose-local-deployment.yml (Indexer config)
```

---

## Part 6: Quick Start Commands

### Minimal Setup (Just Testing)

```bash
# 1. Clone repo
git clone https://github.com/dydxprotocol/v4-chain.git
cd v4-chain

# 2. Start chain
cd protocol
docker-compose -f docker-compose.local.yml up -d
sleep 30

# 3. Test with gRPC
cd ../grpc-test
npm install
node trade_short_long_ready.js
```

### Full Setup (With Verification)

```bash
# 1. Clone repo
git clone https://github.com/dydxprotocol/v4-chain.git
cd v4-chain

# 2. Start chain
cd protocol
docker-compose -f docker-compose.local.yml up -d

# 3. Start indexer
cd ../indexer
docker-compose -f docker-compose-local-deployment.yml up -d \
  postgres redis postgres-package comlink

# 4. Setup gRPC tests
cd ../grpc-test
npm install

# 5. Run tests
node trade_short_long_ready.js

# 6. Verify
cd ../protocol/scripts
bash verify_short_term_orders.sh
```

---

## Part 7: Troubleshooting

### Chain Not Starting

```bash
# Check Docker logs
docker logs protocol-dydxprotocold0-1 --tail 50

# Restart chain
cd /data/data/v4-chain/protocol
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d
```

### gRPC Test Failing

```bash
# Check if chain is running
curl -s http://localhost:26657/status | jq '.result.sync_info.latest_block_height'

# Reinstall dependencies
cd /data/data/v4-chain/grpc-test
rm -rf node_modules package-lock.json
npm install
```

### Orders Not Appearing

```bash
# This is NORMAL for short-term orders!
# They don't appear in /tx endpoint
# Use verification script instead:
cd /data/data/v4-chain/protocol/scripts
bash verify_short_term_orders.sh
```

---

## Part 8: Expected Results

### Short-Term Orders

✅ **Success Indicators:**
- gRPC returns tx hash (Uint8Array or hex string)
- No errors in console
- MsgProposedOperations in blocks
- Blocks continue being produced

❌ **NOT Expected:**
- Orders in `/tx` endpoint (they won't be there!)
- Orders in indexer database (unless Ender is running)

### Long-Term Orders

✅ **Success Indicators:**
- gRPC returns tx hash
- Order appears in `/tx` endpoint
- Order included in block
- Can query via RPC

---

## Summary: Scripts You Need

### Primary Script (Recommended)

```bash
/data/data/v4-chain/grpc-test/trade_short_long_ready.js
```

**Run with:**
```bash
cd /data/data/v4-chain/grpc-test
node trade_short_long_ready.js
```

### Verification Script

```bash
/data/data/v4-chain/protocol/scripts/verify_short_term_orders.sh
```

**Run with:**
```bash
cd /data/data/v4-chain/protocol/scripts
bash verify_short_term_orders.sh
```

### Alternative CLI Script

```bash
/data/data/v4-chain/protocol/scripts/test_orders.sh
```

**Run with:**
```bash
cd /data/data/v4-chain/protocol/scripts
bash test_orders.sh
```

---

## Quick Copy-Paste Setup

```bash
# Complete setup in one go
cd /data/data
git clone https://github.com/dydxprotocol/v4-chain.git
cd v4-chain/protocol
docker-compose -f docker-compose.local.yml up -d
sleep 30
cd ../grpc-test
npm install
node trade_short_long_ready.js
```

That's it! 🚀
