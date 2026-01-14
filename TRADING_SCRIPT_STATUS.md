# Trading Script Status

## Issues Fixed

1. ✅ **Postgres Package**: Fixed TypeScript dependency issue
2. ✅ **Database Connections**: Fixed IPv6 localhost connection issues
3. ✅ **Compliance Package**: Built successfully
4. ✅ **Ender SQL Files**: Fixed build script to copy SQL files

## Remaining Issues

### Indexer Services
- **Comlink**: Missing compliance package (fixed, but services need restart)
- **Ender**: SQL files fixed, but Kafka connection issue remains
- **Kafka**: `host.docker.internal` not resolving in Docker containers

### Trading Script Issue
- **Problem**: Validation error "goodTilBlockTime must be set if orderFlags is not 0"
- **Observation**: orderFlags is 0 (SHORT_TERM), but validation still fails
- **Possible Cause**: Bug in v4-client-js validation logic or version mismatch

## Working Trading Script Location

Scripts created at `/tmp/dydx-grpc-test/`:
- `trade_simple.js` - Basic trading script
- `trade_fixed.js` - With explicit undefined
- `trade_exact.js` - Matching e2e-testing structure

All scripts fail with the same validation error.

## Next Steps

1. Check v4-client-js version compatibility
2. Try using `CompositeClient.placeShortTermOrder()` instead of `ValidatorClient.post.placeOrder()`
3. Fix Kafka connection for indexer services
4. Restart indexer services once Kafka is fixed

## Reference

- dYdX Trading Docs: https://docs.dydx.xyz/interaction/trading
- e2e-testing script: `e2e-testing/scripts/short_term_matching_bot.ts`
