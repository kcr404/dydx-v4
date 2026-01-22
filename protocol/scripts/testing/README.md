# Testing Scripts

This folder contains all testing scripts for dYdX v4 protocol.

## 📁 Structure

### Orders Testing (`orders/`)
Scripts for testing order placement, matching, and verification:
- `test_orders.sh` - Comprehensive order testing
- `test_orders_optimized.sh` - Optimized order tests
- `test_short_term_grpc.js` - Node.js gRPC order tests
- `test_short_term_grpc.py` - Python gRPC order tests
- `test_short_term_grpc_final.py` - Final gRPC test implementation
- `test_short_term_working.sh` - Working short-term order tests
- `verify_short_term_orders.sh` - Order verification script

### Integration Testing (`integration/`)
End-to-end integration tests:
- `test_bridge_flow.sh` - Bridge functionality testing
- `test_ibc_flow.sh` - IBC transfer testing
- `test_markets.sh` - Market operations testing
- `test_advanced_features.sh` - Advanced feature testing
- `run_trade_tests.sh` - Trading flow tests

### Quick Testing (`quick/`)
Fast test suites for rapid validation:
- `test_quick.sh` - Quick smoke tests
- `run_cli_tests.sh` - CLI functionality tests
- `fund_and_test.sh` - Fund accounts and run tests

## 🚀 Usage

```bash
# Run order tests
./testing/orders/test_orders.sh

# Run integration tests
./testing/integration/test_bridge_flow.sh

# Run quick tests
./testing/quick/test_quick.sh
```

## 🔗 Related

- **Chain Setup**: `../chain/setup/` - Initialize test environment
- **Debugging**: `../debugging/` - Debug test failures
