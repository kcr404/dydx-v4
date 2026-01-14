# Quick Start Guide for Tomorrow

**Date**: January 14, 2026  
**Estimated Time**: 1 hour to complete short-term orders

---

## 🚀 STEP 1: Start the Chain (5 minutes)

```bash
cd /data/data/v4-chain/protocol
sudo make localnet-start
```

**Wait for**: "indexed block" messages in logs

**Verify**:
```bash
curl http://localhost:1317/cosmos/base/tendermint/v1beta1/blocks/latest
curl http://localhost:26657/status
```

---

## 🚀 STEP 2: Start the Indexer (5 minutes)

```bash
cd /data/data/v4-chain/indexer
docker-compose -f docker-compose-local-deployment.yml up
```

**Watch for**:
- "Listening on port 3002" (comlink)
- "Listening on port 3003" (socks)

**If services fail**, check logs:
```bash
docker-compose -f docker-compose-local-deployment.yml logs postgres-package
docker-compose -f docker-compose-local-deployment.yml logs vulcan
docker-compose -f docker-compose-local-deployment.yml logs comlink
```

**Verify**:
```bash
curl http://localhost:3002/v4/height
curl http://localhost:3002/v4/markets/perpetualMarkets
```

---

## 🚀 STEP 3: Test Short-Term Orders (30 minutes)

### Option A: Fix Parameter Order
```bash
cd /tmp/dydx-grpc-test

# Check method signature
grep -A30 "placeShortTermOrder" \
  node_modules/@dydxprotocol/v4-client-js/build/cjs/src/clients/composite-client.d.ts

# Test with correct order
node test_correct_params.js
```

### Option B: Use Lower-Level API
```bash
# Build order manually with correct structure
node test_manual_order.js
```

### Option C: Check for Updated Client
```bash
npm outdated @dydxprotocol/v4-client-js
npm update @dydxprotocol/v4-client-js
```

---

## 🚀 STEP 4: Verify Success

**Successful Order Placement Shows**:
- No validation errors
- Transaction hash returned
- Order visible in indexer (if available)

**Query Order**:
```bash
curl "http://localhost:3002/v4/orders?address=dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4&subaccountNumber=0"
```

---

## 📋 CHECKLIST

- [ ] Chain running (ports 1317, 26657)
- [ ] Indexer running (ports 3002, 3003)
- [ ] gRPC client connects successfully
- [ ] Short-term order placed (Alice)
- [ ] Short-term order placed (Bob)
- [ ] Orders visible in system

---

## 🔧 TROUBLESHOOTING

### Indexer Won't Start

**Check**:
```bash
docker-compose -f docker-compose-local-deployment.yml ps
docker-compose -f docker-compose-local-deployment.yml logs
```

**Common Issues**:
1. Kafka not healthy → Restart: `docker-compose down && docker-compose up`
2. Postgres migration failed → Check postgres-package logs
3. Port conflicts → Check: `netstat -tulpn | grep -E "3002|3003|5435"`

### gRPC Client Errors

**"Invalid GoodTilBlock"** → Parameter order wrong
- Try swapping `clientId` and `goodTilBlock` positions

**"Connection Refused :3002"** → Indexer not running
- Verify: `curl http://localhost:3002/v4/height`

**"Bad status 501"** → Validator endpoint issue
- Check chain is running: `curl http://localhost:1317/status`

---

## 📁 KEY FILES

**Documentation**:
- `/data/data/v4-chain/protocol/docs/SESSION_SUMMARY_JAN13.md`
- `/data/data/v4-chain/protocol/docs/INDEXER_BUILD_NOTES.md`
- `/data/data/v4-chain/protocol/docs/SUBTICKS_GUIDE.md`

**Test Scripts**:
- `/tmp/dydx-grpc-test/test_final_working.js`
- `/tmp/dydx-grpc-test/test_correct_params.js`

**Working Example**:
- `/data/data/v4-chain/protocol/scripts/test_orders.sh` (stateful orders)

---

## 🎯 SUCCESS = Short-Term Order Placed via gRPC!

Good luck! 🚀
