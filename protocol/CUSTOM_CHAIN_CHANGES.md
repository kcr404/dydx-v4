# Custom Chain Changes Documentation

This document outlines all the changes required to convert the dYdX Chain protocol into your custom chain. The process involves renaming identifiers, updating configurations, and customizing chain-specific parameters.

## 1. Core Chain Identity Changes

### Application Name and Constants

- **File**: `app/constants/constants.go`
- **Changes**:

  ```go
  const (
    AppName       = "yourchain"        // Change from "dydxprotocol"
    AppDaemonName = AppName + "d"      // Will become "yourchaind"
    ServiceName   = "validator"        // Optional: change to your preferred service name
  )
  ```

### Command Line Interface

- **File**: `cmd/dydxprotocold/cmd/root.go`
- **Changes**:

  ```go
  // Line 121: Update command name
  rootCmd := &cobra.Command{
    Use:   "yourchaind",               // Change from constants.AppDaemonName
    Short: "Start your custom chain app",
    // ... rest unchanged
  }
  ```

### Address Prefix Configuration

- **File**: `app/config/config.go`
- **Changes**:

  ```go
  const (
    AccountAddressPrefix = "yourprefix"  // Change from "dydx"
    // ... update all derived constants accordingly
    Bech32MainPrefix = AccountAddressPrefix
    Bech32PrefixAccAddr = Bech32MainPrefix
    // ... etc
  )
  ```

## 2. Token and Denomination Changes

### Native Token Configuration

- **Files**:
  - `cmd/dydxprotocold/cmd/config.go`
  - `testing/genesis.sh`
- **Changes**:

  ```bash
  # In genesis.sh, update:
  NATIVE_TOKEN="uyourtoken"              # Change from "adv4tnt"
  NATIVE_TOKEN_WHOLE_COIN="yourtoken"    # Change from "dv4tnt"
  COIN_NAME="Your Custom Token"          # Change from "dYdX V4 Testnet Token"
  ```

### Minimum Gas Prices

- **File**: `cmd/dydxprotocold/cmd/config.go`
- **Changes**:

  ```go
  const (
    // Update these to use your token denomination
    minGasPriceStakeToken = "25000000000uyourtoken"  // Change from "adv4tnt"
    // ... update references throughout the file
  )
  ```

## 3. Genesis Configuration Updates

### Genesis Parameters

- **File**: `testing/genesis.sh`
- **Changes**:

  ```bash
  # Update all token references:
  USDC_DENOM="ibc/YOUR_CUSTOM_USDC_HASH"  # Update IBC hash for your USDC variant
  
  # Update chain-specific parameters:
  ETH_CHAIN_ID=1                          # Change to your Ethereum chain ID
  ETH_BRIDGE_ADDRESS="0x..."              # Update to your bridge contract address
  
  # Update supply and balances:
  TOTAL_NATIVE_TOKEN_SUPPLY=1000000000$EIGHTEEN_ZEROS  # Adjust total supply
  ```

### Module Accounts

- **File**: `testing/genesis.sh`
- **Changes**:

  ```bash
  # Update module account addresses to reflect your prefix:
  SUBACCOUNTS_MODACC_ADDR="yourprefix1..."    # Regenerate with your prefix
  BRIDGE_MODACC_ADDR="yourprefix1..."         # Regenerate with your prefix
  ```

## 4. Module-Specific Customizations

### Assets Module

- **File**: `testing/genesis.sh`
- **Changes**:

  ```bash
  # Update asset definitions to match your ecosystem:
  dasel put -t string -f "$GENESIS" '.app_state.assets.assets.[0].symbol' -v 'YOURTOKEN'
  dasel put -t string -f "$GENESIS" '.app_state.assets.assets.[0].denom' -v 'uyourtoken'
  ```

### Perpetuals Module

- **File**: `testing/genesis.sh`
- **Changes**:

  ```bash
  # Update perpetual markets to match your desired trading pairs:
  # Remove or modify existing BTC-USD, ETH-USD perpetuals
  # Add your own perpetual contracts
  ```

### Bridge Module

- **File**: `testing/genesis.sh`
- **Changes**:

  ```bash
  # Update bridge parameters for your cross-chain infrastructure:
  ETH_CHAIN_ID=your_ethereum_chain_id
  ETH_BRIDGE_ADDRESS="your_bridge_contract_address"
  ```

## 5. Daemon and External Service Configuration

### Oracle Services

- **File**: `cmd/dydxprotocold/cmd/config.go`
- **Changes**:

  ```go
  appConfig := DydxAppConfig{
    Config: *srvCfg,
    Oracle: oracleconfig.AppConfig{
      Enabled:        true,
      OracleAddress:  "your-oracle-service:8080",  // Update to your oracle
      ClientTimeout:  time.Second * 2,
      MetricsEnabled: false,
    },
  }
  ```

### Price Feed Configuration

- **Files**:
  - `testing/genesis.sh` (market map configurations)
  - Exchange configuration files
- **Changes**:

  ```bash
  # Update market map entries for your trading pairs:
  # Replace BTC/USD, ETH/USD with your desired trading pairs
  # Update provider configurations to your preferred price sources
  ```

## 6. Network and Consensus Parameters

### Tendermint Configuration

- **File**: `cmd/dydxprotocold/cmd/config.go`
- **Changes**:

  ```go
  func initTendermintConfig() *tmcfg.Config {
    cfg := tmcfg.DefaultConfig()
    
    // Update P2P settings for your network:
    cfg.P2P.Seeds = "your-seed-nodes"  // Add your seed nodes
    
    // Adjust consensus parameters as needed:
    cfg.Consensus.TimeoutCommit = 500 * time.Millisecond  // Adjust block time
    
    return cfg
  }
  ```

### Governance Parameters

- **File**: `testing/genesis.sh`
- **Changes**:

  ```bash
  # Update governance parameters for your chain:
  dasel put -t string -f "$GENESIS" '.app_state.gov.params.min_deposit.[0].denom' -v "uyourtoken"
  # Adjust voting periods, thresholds, etc. for your governance model
  ```

## 7. Testing and Local Development

### Local Network Configuration

- **File**: `testing/genesis.sh`
- **Changes**:

  ```bash
  # Update genesis time for your chain:
  GENESIS_TIME="2026-01-01T00:00:00Z"  # Set to your preferred genesis time
  
  # Update validator configurations:
  TESTNET_VALIDATOR_NATIVE_TOKEN_BALANCE=1000000$EIGHTEEN_ZEROS  # Adjust as needed
  TESTNET_VALIDATOR_SELF_DELEGATE_AMOUNT=500000$EIGHTEEN_ZEROS   # Adjust as needed
  ```

## 8. Documentation Updates

### README.md

- **File**: `README.md`
- **Changes**:
  - Update project title and description
  - Replace all instances of "dYdX" with your chain name
  - Update installation and running instructions
  - Modify genesis examples to use your tokens and markets

### Module Documentation

- **Files**: Various files in `docs/` directory
- **Changes**:
  - Update module documentation to reflect your chain's specifics
  - Replace dYdX-specific examples with your chain examples

## 9. Build and Deployment Configuration

### Docker Configuration

- **Files**:
  - `Dockerfile`
  - `docker-compose.yml`
  - `docker-compose.local.yml`
- **Changes**:
  - Update image names to reflect your chain
  - Modify entrypoints to use your daemon name
  - Adjust ports and network configurations

### Makefile

- **File**: `Makefile`
- **Changes**:
  - Update binary names in build targets
  - Modify docker image names
  - Adjust deployment commands

## 10. Chain ID and Network Identification

### Chain ID Configuration

- **Files**: Genesis files and configuration
- **Changes**:
  - Set a unique chain ID for your network (e.g., "yourchain-1")
  - Update all references to use your chain ID

## Implementation Steps Summary

1. **First Phase - Core Identity**
   - Rename application constants
   - Update address prefixes
   - Change token denominations

2. **Second Phase - Genesis Configuration**
   - Update genesis parameters
   - Configure initial assets and markets
   - Set up validator configurations

3. **Third Phase - Network Infrastructure**
   - Configure P2P networking
   - Set up oracle services
   - Configure bridge parameters

4. **Fourth Phase - Testing and Deployment**
   - Update local development environment
   - Modify documentation
   - Adjust build and deployment scripts

5. **Fifth Phase - Custom Features**
   - Add/remove modules as needed
   - Customize business logic
   - Implement chain-specific features

After implementing these changes, your chain will be fully customized and ready for deployment with your own identity, tokens, and configurations.
