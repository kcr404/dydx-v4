# Indexer Service Fixes Summary

## Issues Identified

### 1. Postgres Package ✅ FIXED
- **Issue**: Missing TypeScript module for migrations
- **Fix**: Removed `--production` flag from `pnpm i` in Dockerfile
- **Status**: ✅ Migrations running successfully

### 2. Database Connection ✅ FIXED
- **Issue**: Services trying to connect to IPv6 localhost (`::1:5435`)
- **Fix**: Added `DB_HOSTNAME=postgres` environment variable to all services
- **Status**: ✅ Database connection fixed

### 3. Comlink Service ❌ NEEDS FIX
- **Issue**: Missing `@dydxprotocol-indexer/compliance` package build
- **Error**: `Cannot find module '/home/dydx/app/services/comlink/node_modules/@dydxprotocol-indexer/compliance/build/src/index.js'`
- **Fix Needed**: Build compliance package before building comlink service

### 4. Ender Service ❌ NEEDS FIX
- **Issue 1**: Missing SQL files in build directory
- **Error**: `ENOENT: no such file or directory, open '/home/dydx/app/services/ender/build/src/scripts/handlers/dydx_asset_create_handler.sql'`
- **Fix Needed**: Copy SQL files to build directory in Dockerfile or build script
- **Issue 2**: Kafka connection failing
- **Error**: `getaddrinfo ENOTFOUND host.docker.internal`
- **Fix Needed**: Use proper network configuration or IP address instead of `host.docker.internal`

### 5. Test Script 501 Error ❌ NEEDS FIX
- **Issue**: Client trying to connect to REST endpoint but needs Tendermint RPC
- **Error**: `Bad status on response: 501`
- **Fix**: Updated test script to include `tendermintRpcEndpoint` in validatorConfig
- **Status**: ✅ Fixed script created at `/tmp/dydx-grpc-test/test_final_working_fixed.js`

## Next Steps

1. **Build compliance package**:
   ```bash
   cd /data/data/v4-chain/indexer
   pnpm --filter @dydxprotocol-indexer/compliance run build
   ```

2. **Fix ender SQL files**:
   - Update `indexer/services/ender/package.json` build script to copy SQL files
   - Or update Dockerfile to include SQL files in build

3. **Fix Kafka connection**:
   - Option A: Use Docker network name instead of `host.docker.internal`
   - Option B: Use host IP address
   - Option C: Run Kafka in same Docker network as indexer services

4. **Test fixed script**:
   ```bash
   cd /tmp/dydx-grpc-test
   node test_final_working_fixed.js
   ```

## Current Status

- ✅ Postgres migrations: Working
- ✅ Database connections: Fixed
- ❌ Comlink: Missing compliance package build
- ❌ Ender: Missing SQL files + Kafka connection
- ❌ Other services: Depend on comlink/ender
- ✅ Test script: Fixed version created
