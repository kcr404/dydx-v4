# Indexer Build Notes - Local Setup

**Date**: January 13, 2026  
**Status**: In Progress - Manual Setup

---

## Issues Fixed

### 1. Platform Mismatch (ARM64 vs AMD64)
**Problem**: Base image `dydxprotocol/indexer-node:16-alpine-m1` only exists for ARM64 (Apple M1)  
**Solution**: Modified `Dockerfile.postgres-package.local` to use `node:16-alpine` (multi-arch)

```dockerfile
# Changed from:
FROM dydxprotocol/indexer-node:16-alpine-m1

# To:
FROM node:16-alpine
```

### 2. Missing pnpm
**Problem**: `node:16-alpine` doesn't include pnpm  
**Solution**: Added pnpm installation step

```dockerfile
# Install pnpm globally
RUN npm install -g pnpm@10
```

### 3. pnpm Version Mismatch
**Problem**: Lockfile created with pnpm v10, but Dockerfile initially installed v6  
**Solution**: Updated to pnpm@10 to match lockfile

---

## Modified Files

1. **`/data/data/v4-chain/indexer/Dockerfile.postgres-package.local`**
   - Line 2: Changed base image to `node:16-alpine`
   - Line 9-10: Added `RUN npm install -g pnpm@10`

---

## Build Commands

### Prerequisites
```bash
cd /data/data/v4-chain/indexer
pnpm install
```

### Build Packages
```bash
# Build required packages first
cd packages/base && pnpm build && cd ..
cd packages/postgres && pnpm build && cd ..
cd packages/v4-protos && pnpm build && cd ..
cd packages/v4-proto-parser && pnpm build && cd ..
```

### Start Indexer
```bash
cd /data/data/v4-chain/indexer
docker-compose -f docker-compose-local-deployment.yml up
```

---

## Expected Services

Once running, the following services should be available:

| Service | Port | Purpose |
|---------|------|---------|
| comlink | 3002 | REST API |
| socks | 3003 | WebSocket |
| postgres | 5435 | Database |
| kafka | 9092 | Message queue |
| redis | 6382 | Cache |
| ender | 3001 | On-chain events |
| vulcan | 3005 | Off-chain events |
| roundtable | 3004 | Periodic jobs |

---

## Testing Endpoints

### REST API (comlink)
```bash
curl http://localhost:3002/v4/height
curl http://localhost:3002/v4/markets/perpetualMarkets
```

### WebSocket (socks)
```bash
wscli connect http://localhost:3003
# Then send: { "type": "subscribe", "channel": "v4_trades", "id": "BTC-USD" }
```

---

## Troubleshooting

### If build fails:
```bash
# Clean up
docker-compose -f docker-compose-local-deployment.yml down
docker rmi $(docker images 'indexer_*' -a -q) -f

# Rebuild
docker-compose -f docker-compose-local-deployment.yml build --no-cache
docker-compose -f docker-compose-local-deployment.yml up
```

### If Kafka fails to start:
```bash
# Stop and restart
docker-compose -f docker-compose-local-deployment.yml down
docker-compose -f docker-compose-local-deployment.yml up
```

---

## Next Steps for Short-Term Orders

Once indexer is running:

1. **Update gRPC client configuration**:
```javascript
const NETWORK = {
    restEndpoint: 'http://localhost:1317',
    chainId: 'localdydxprotocol',
    validatorConfig: {
        restEndpoint: 'http://localhost:1317',
        chainId: 'localdydxprotocol',
    },
    indexerConfig: {
        restEndpoint: 'http://localhost:3002',  // ← Now available!
        websocketEndpoint: 'ws://localhost:3003',
    },
};
```

2. **Test short-term orders**:
```bash
cd /tmp/dydx-grpc-test
node test_with_remote_indexer.js
```

3. **Verify order placement**:
- Check logs for order acceptance
- Query indexer API for order status
- Verify MemClob inclusion

---

## Reference

- **Indexer README**: `/data/data/v4-chain/indexer/README.md`
- **Docker Compose**: `/data/data/v4-chain/indexer/docker-compose-local-deployment.yml`
- **Modified Dockerfile**: `/data/data/v4-chain/indexer/Dockerfile.postgres-package.local`
