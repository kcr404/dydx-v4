# Genesis File Modifications Documentation

This document explains all the changes made to the genesis file by the `testing/genesis.sh` script and the reasoning behind each modification.

## Overview

The `testing/genesis.sh` script configures the genesis state for local development and testnet environments. It sets up various modules with appropriate parameters, creates initial markets, perpetuals, and clob pairs, and initializes account balances.

## Key Configuration Variables

The script defines several constants at the beginning that control the initial state:

- `NATIVE_TOKEN`: Set to "atvx" for testnet
- `USDC_DENOM`: IBC denomination for USDC
- `TESTNET_VALIDATOR_NATIVE_TOKEN_BALANCE`: Each validator gets 1 million native tokens
- `FAUCET_NATIVE_TOKEN_BALANCE`: Faucet account gets 50 million native tokens
- Various default balances for subaccounts and vaults

## Module Configurations

### Consensus Parameters

- Sets max block size to 4MB (`max_bytes: 4194304`)
- Sets max gas to unlimited (`max_gas: -1`)
- Enables vote extensions at height 1

### Crisis Module

- Sets the constant fee denomination to the native token

### Governance Module

- Changes governance token to native token
- Reduces deposit period to 120 seconds
- Reduces voting period to 120 seconds
- Sets expedited voting period to 60 seconds
- Requires 20% initial deposit ratio to prevent spam
- Sets proposal cancel ratio to 1 (disables cancelling proposals)
- Requires 75% votes for expedited proposals to pass

### Staking Module

- Sets unbonding time to 21 days (1814400 seconds)
- Sets bond denomination to native token

### Assets Module

- Creates a single asset (USDC) with ID 0
- Sets symbol to "USDC"
- Sets denomination to the IBC USDC denom
- Sets denomination exponent to -6
- Sets atomic resolution to -6

### Bridge Module

- Sets event parameters with native token denomination
- Sets Ethereum chain ID to Sepolia (11155111)
- Sets bridge contract address
- Initializes acknowledged event info

### IBC Module

- Disables localhost client creation
- Restricts allowed clients to only "07-tendermint"

### Perpetuals Module

#### Liquidity Tiers

Creates several liquidity tiers with different risk parameters:

1. **Large-Cap**: 2% initial margin, 60% maintenance fraction
2. **Small-Cap**: 10% initial margin, 50% maintenance fraction
3. **Long-Tail**: 20% initial margin, 50% maintenance fraction
4. **Safety**: 100% initial margin, 20% maintenance fraction
5. **Isolated**: 5% initial margin, 60% maintenance fraction
6. **Mid-Cap**: 5% initial margin, 60% maintenance fraction
7. **FX**: 1% initial margin, 50% maintenance fraction

#### Parameters

- Funding rate clamp factor: 600% (6000000 ppm)
- Premium vote clamp factor: 6000% (60000000 ppm)
- Minimum votes per sample: 15

#### Perpetuals

Creates perpetual contracts for major cryptocurrencies:

- BTC-USD, ETH-USD, LINK-USD, POL-USD, CRV-USD, SOL-USD, ADA-USD, AVAX-USD, FIL-USD, LTC-USD, DOGE-USD, ATOM-USD, DOT-USD, UNI-USD, BCH-USD, TRX-USD, NEAR-USD, MKR-USD, XLM-USD, ETC-USD, COMP-USD, WLD-USD, APE-USD, APT-USD, ARB-USD, BLUR-USD, LDO-USD, OP-USD, PEPE-USD, SEI-USD, SHIB-USD, SUI-USD, XRP-USD, EIGEN-USD (isolated), BOME-USD (isolated)

### MarketMap Module

Configures market data sources for each market with multiple exchange providers to ensure robust price feeds.

### Prices Module

Sets up price parameters and initial prices for all markets with appropriate minimum price change percentages and exponents.

### Bank Module

Initializes account balances:

- Subaccounts module account with USDC balance
- Rewards vester account with native token balance
- Bridge module account with remaining native token supply

### Rewards Module

Sets ATOM-USD market ID (11) as the test oracle price for the reward token.

### CLOB Module

Creates CLOB pairs for all perpetuals with appropriate quantum conversion exponents and tick sizes.

#### Liquidations Configuration

- Maximum liquidation fee: 1.5%
- Minimum position notional liquidated: 1,000 USDC
- Maximum position portion liquidated: 10%
- Subaccount block limits for notional liquidated and insurance lost

#### Block Rate Limits

- Maximum 400 short-term orders/cancels per block
- Maximum 2 stateful orders per block
- Maximum 20 stateful orders per 100 blocks

#### Equity Tier Limits

Defines limits on open orders based on account equity tier:

- $0 TNC: 0 open orders
- $20 TNC: 1 open order
- $100 TNC: 5 open orders
- $1,000 TNC: 10 open orders
- $10,000 TNC: 100 open orders
- $100,000 TNC: 1,000 open orders

### Delayed Messages Module

Schedules a message to update perpetual fee parameters after approximately 7 days (378,000 blocks).

### ICA Modules

Configures ICA host and controller parameters for interchain accounts functionality.

### Listing Module

- Sets hard cap for markets to 500
- Configures listing vault deposit parameters

### Vaults Module

- Sets default quoting parameters
- Configures operator parameters
- Initializes total shares and owner shares
- Sets up vaults for trading

### AccountPlus Module

Activates smart account functionality.

## Special Functions

### Test Exchange Configuration

The script includes functions to modify the genesis for testing:

- `update_genesis_use_test_exchange`: Configures markets to use only test exchanges
- `update_genesis_use_test_volatile_market`: Adds a volatile test market
- `update_all_markets_with_fixed_price_exchange`: Configures all markets with fixed price exchanges
- `update_genesis_complete_bridge_delay`: Reduces bridge delay for testing

## Reasoning Behind Configurations

1. **Governance Parameters**: Shortened periods enable faster iteration in test environments while maintaining security through deposit requirements.

2. **Perpetuals and Markets**: Comprehensive coverage of major cryptocurrencies with appropriate risk parameters for different market capitalizations.

3. **Liquidity Tiers**: Different tiers allow for appropriate risk management based on asset volatility and market cap.

4. **Rate Limits**: Conservative limits prevent spam while allowing reasonable trading activity.

5. **Equity Tiers**: Progressive access model that allows users to increase trading capacity as they build account value.

6. **Bridge Configuration**: Proper setup for cross-chain token transfers with appropriate safety delays.

These configurations provide a realistic but controlled environment for testing the protocol's functionality while ensuring adequate risk management.
