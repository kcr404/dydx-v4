# Scripts Directory - Cleanup Summary

**Date**: January 13, 2026  
**Action**: Consolidated and cleaned up scripts directory from 35 to 16 scripts

---

## ✅ KEPT SCRIPTS (16 total)

### Core Testing Scripts (4)
1. **test_orders.sh** ⭐ NEW - Unified order testing
   - Tests both short-term AND stateful orders
   - Comprehensive verification
   - Replaces 14 redundant scripts

2. **test_quick.sh** - Quick health check
   - Bridge module tests
   - IBC module tests
   - Rate limiting tests

3. **check-mempool.sh** - Mempool monitoring
   - Shows mempool status
   - Can check specific tx hash
   - Useful for debugging

4. **check-tx-status.sh** - Transaction verification
   - Checks tx inclusion
   - Shows events and gas usage
   - Requires tx hash argument

### Development & Debug (3)
5. **debug-clob-inclusion.sh** - CLOB debugging
6. **localnet_liveness.sh** - Liveness testing
7. **start_with_funded_subaccounts.sh** - Chain startup with funded accounts

### Advanced Testing (4)
8. **test_advanced_features.sh** - Advanced features
9. **test_bridge_flow.sh** - Ethereum bridge testing
10. **test_ibc_flow.sh** - IBC testing
11. **run_trade_tests.sh** - Trade testing suite

### Build & Infrastructure (5)
12. **build-push-ecr.sh** - AWS ECR deployment
13. **create_full_node.sh** - Mainnet full node setup
14. **protocgen.sh** - Protobuf generation
15. **protoc-swagger-gen.sh** - Swagger generation
16. **run_cli_tests.sh** - CLI testing

---

## 🗑️ DELETED SCRIPTS (19 total)

### Redundant Order Testing (10 scripts)
- ❌ test_short_term_matching.sh
- ❌ test_short_term_matching_fixed.sh
- ❌ test_short_term_complete.sh
- ❌ test_short_term_bob.sh
- ❌ test_stateful_inclusion.sh
- ❌ test_stateful_nonmatching.sh
- ❌ test_stateful_order_simple.sh
- ❌ test_matching_orders.sh
- ❌ place-order-pair35.sh
- ❌ place-stateful-order.sh

**Reason**: All functionality consolidated into `test_orders.sh`

### Demo & Debug Scripts (5 scripts)
- ❌ demo_bob_subaccount.sh
- ❌ demo_margin_trading.sh
- ❌ demonstrate_ephemeral_matching.sh
- ❌ debug_short_term_orders.sh
- ❌ diagnose_asset_issue.sh

**Reason**: Outdated or superseded by better tools

### Genesis/Funding Scripts (4 scripts)
- ❌ fund_and_test_bob.sh
- ❌ fund_genesis_subaccounts.sh
- ❌ fund_subaccounts_fix.sh
- ❌ create_funded_genesis.sh

**Reason**: Functionality in `start_with_funded_subaccounts.sh`

### Experimental (1 script)
- ❌ test_twap_orders.sh

**Reason**: Incomplete/not working properly

---

## 📊 Statistics

- **Before**: 35 scripts
- **After**: 16 scripts
- **Removed**: 19 scripts (54% reduction)
- **New**: 1 unified script (`test_orders.sh`)

---

## 🎯 Usage Guide

### Quick Start
```bash
# 1. Start chain with funded accounts
./scripts/start_with_funded_subaccounts.sh

# 2. Run quick health check
./scripts/test_quick.sh

# 3. Test orders (short-term + stateful)
./scripts/test_orders.sh

# 4. Check mempool
./scripts/check-mempool.sh

# 5. Check specific transaction
./scripts/check-tx-status.sh <TXHASH>
```

### Advanced Testing
```bash
# Bridge testing
./scripts/test_bridge_flow.sh

# IBC testing
./scripts/test_ibc_flow.sh

# Advanced features
./scripts/test_advanced_features.sh

# CLOB debugging
./scripts/debug-clob-inclusion.sh
```

---

## 🔑 Key Improvements

1. **Unified Testing**: One script (`test_orders.sh`) replaces 14 separate scripts
2. **Clear Organization**: Scripts grouped by purpose
3. **Better Maintenance**: Fewer files to maintain
4. **Comprehensive Coverage**: New unified script tests both order types
5. **Educational**: Scripts include explanatory output

---

## 📝 test_orders.sh Features

The new unified script includes:

✅ **Short-Term Orders**
- Places matching BUY/SELL orders
- Uses GoodTilBlock (GTB)
- Verifies inclusion

✅ **Stateful Orders**
- Places long-term matching orders
- Uses GoodTilBlockTime (GTBT)
- Verifies persistence

✅ **Verification**
- Checks transaction inclusion
- Shows subaccount positions
- Provides detailed summary

✅ **Educational Output**
- Explains differences between order types
- Shows key parameters
- Suggests next steps

---

## 🚀 Next Steps

1. ✅ Scripts directory cleaned up
2. ✅ Unified testing script created
3. ✅ Documentation updated
4. 📝 Consider adding to CI/CD pipeline
5. 📝 Add more comprehensive TWAP testing when ready

---

**Maintained by**: dYdX Development Team  
**Last Updated**: January 13, 2026
