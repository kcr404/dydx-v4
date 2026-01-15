# Chain Management Scripts

This folder contains scripts for managing the dYdX v4 chain.

## 📁 Structure

### Setup (`setup/`)
Chain initialization and configuration:
- `start_with_funded_subaccounts.sh` - Start chain with pre-funded test accounts
- `create_full_node.sh` - Create and configure a full node

### Monitoring (`monitoring/`)
Chain health and status monitoring:
- `check-mempool.sh` - Monitor mempool status
- `check-tx-status.sh` - Check transaction status
- `localnet_liveness.sh` - Verify localnet is running

### Genesis (`../genesis/`)
Genesis file generation and management (see `../genesis/` folder)

## 🚀 Usage

```bash
# Start chain with funded accounts
./chain/setup/start_with_funded_subaccounts.sh

# Monitor mempool
./chain/monitoring/check-mempool.sh

# Check transaction status
./chain/monitoring/check-tx-status.sh <tx_hash>
```

## 🔗 Related

- **Testing**: `../testing/` - Test scripts
- **Debugging**: `../debugging/` - Debug tools
