# dYdX v4 Local Testing Documentation Index

This directory contains comprehensive documentation for running and testing the dYdX v4 protocol locally.

---

## 📚 Documentation Files

### Order Trading Guides

#### [SHORT_TERM_ORDERS_GRPC_GUIDE.md](./SHORT_TERM_ORDERS_GRPC_GUIDE.md)
**Complete guide for short-term orders via gRPC**
- Why gRPC (not CLI) for short-term orders
- Architecture and execution flow
- Setup requirements and configuration
- Code examples with Node.js SDK
- Verification methods (5 different approaches)
- Common issues and solutions
- Testing workflow

#### [SHORT_TERM_ORDER_FIX.md](./SHORT_TERM_ORDER_FIX.md)
**Technical analysis of short-term order mechanics**
- Deep dive into PrepareProposal filtering
- MemClob vs stateful order paths
- Why CLI fails for short-term orders
- MsgProposedOperations architecture

---

### System Analysis

#### [relayer_and_ibc_analysis.md](./relayer_and_ibc_analysis.md)
**IBC and bridge functionality analysis**
- IBC transfer mechanisms
- Bridge module implementation
- Cross-chain communication

#### [short_term_order_final_analysis.md](./short_term_order_final_analysis.md)
**Final analysis of short-term order implementation**
- Order lifecycle
- Validation and execution
- State management

---

## 🚀 Quick Start

### 1. Start Protocol Chain

```bash
cd /data/data/v4-chain/protocol
docker-compose -f docker-compose.local.yml up -d

# Verify
curl -s http://localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

### 2. Start Indexer Services

```bash
cd /data/data/v4-chain/indexer
docker-compose -f docker-compose-local-deployment.yml up -d \
  postgres redis postgres-package comlink ender pgadmin
```

### 3. Test Short-Term Orders

```bash
cd /data/data/v4-chain/grpc-test
node trade_short_long_ready.js
```

### 4. Test Long-Term Orders

```bash
cd /data/data/v4-chain/protocol/scripts
bash test_orders.sh
```

---

## 🔧 Useful Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| `verify_short_term_orders.sh` | `protocol/scripts/` | Verify short-term order execution |
| `test_orders.sh` | `protocol/scripts/` | Test both short-term and long-term orders via CLI |
| `run_trade_tests.sh` | `protocol/scripts/` | Run comprehensive trade tests |
| `trade_short_long_ready.js` | `grpc-test/` | gRPC order placement script |

---

## 📊 Service Endpoints

### Protocol Chain
- **RPC**: http://localhost:26657
- **REST**: http://localhost:1317
- **gRPC**: localhost:9090

### Indexer
- **Comlink (REST)**: http://localhost:3002
- **Socks (WebSocket)**: ws://localhost:3003
- **Postgres**: localhost:5435
- **Redis**: localhost:6382
- **PgAdmin**: http://localhost:5050

---

## 🔑 Test Wallets

### Alice
- Address: `dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4`
- Mnemonic: `merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small`

### Bob
- Address: `dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs`
- Mnemonic: `color habit donor nurse dinosaur stable wonder process post perfect raven gold census inside worth inquiry mammal panic olive toss shadow strong name drum`

---

## 📖 Key Concepts

### Short-Term Orders
- **Validity**: GoodTilBlock (GTB)
- **Storage**: In-memory (MemClob)
- **Method**: gRPC via `placeShortTermOrder()`
- **Verification**: Check for `MsgProposedOperations` in blocks
- **NOT** queryable via `/tx` endpoint (by design)

### Long-Term Orders
- **Validity**: GoodTilBlockTime (GTBT)
- **Storage**: Persisted to state
- **Method**: gRPC via `placeOrder()` or CLI
- **Verification**: Standard `/tx` endpoint
- **Duration**: Up to 95 days

---

## 🐛 Troubleshooting

### Short-term orders not appearing in `/tx`
✅ **This is normal!** See [SHORT_TERM_ORDERS_GRPC_GUIDE.md](./SHORT_TERM_ORDERS_GRPC_GUIDE.md#verification-methods)

### Indexer database is empty
Check if Ender service is running:
```bash
docker logs indexer_ender_1
```

### Comlink Redis connection errors
Verify Redis URL is `redis://redis:6379` not `localhost:6382`

---

## 📚 External Resources

- [dYdX Official Docs](https://docs.dydx.xyz/)
- [v4-client-js SDK](https://www.npmjs.com/package/@dydxprotocol/v4-client-js)
- [Trading Documentation](https://docs.dydx.xyz/interaction/trading)

---

## 📝 Additional Documentation

See also:
- [GRPC_TRADING_STATUS.md](../../GRPC_TRADING_STATUS.md) - Current status and workflow
- [pgadmin_setup.md](../../.gemini/antigravity/brain/.../pgadmin_setup.md) - PgAdmin configuration
- [short_term_order_verification.md](../../.gemini/antigravity/brain/.../short_term_order_verification.md) - Verification guide
