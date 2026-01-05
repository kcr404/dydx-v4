# Cosmos SDK Modules Overview

This document provides an overview of all modules in the `x/` directory, their purposes, and how they interconnect within the protocol.

## Module Directory Structure

The `x/` directory contains the following modules:

- [Cosmos SDK Modules Overview](#cosmos-sdk-modules-overview)
  - [Module Directory Structure](#module-directory-structure)
  - [Module Details](#module-details)
    - [accountplus](#accountplus)
    - [affiliates](#affiliates)
    - [assets](#assets)
    - [blocktime](#blocktime)
    - [bridge](#bridge)
    - [clob](#clob)
    - [delaymsg](#delaymsg)
    - [epochs](#epochs)
    - [feetiers](#feetiers)
    - [govplus](#govplus)
    - [leverage](#leverage)
    - [listing](#listing)
    - [perpetuals](#perpetuals)
    - [prices](#prices)
    - [ratelimit](#ratelimit)
    - [revshare](#revshare)
    - [rewards](#rewards)
    - [sending](#sending)
    - [stats](#stats)
    - [subaccounts](#subaccounts)
    - [vault](#vault)
    - [vest](#vest)
  - [Module Interconnection Diagram](#module-interconnection-diagram)
  - [Key Integration Patterns](#key-integration-patterns)

## Module Details

### accountplus

**Purpose**: Enhanced account functionality with advanced authentication mechanisms.

**Key Features**:

- Advanced authenticator system (signature verification, circuit breaker, timestamp nonce)
- Composite authenticators (all_of, any_of)
- Message and subaccount filtering
- AccountPlus protobuf definitions

**Connections**:

- Integrates with transaction processing pipeline
- Used by other modules requiring enhanced authentication

---

### affiliates

**Purpose**: Affiliate program management for reward distribution.

**Key Features**:

- Registration of affiliate relationships
- Tracking of affiliate activities
- Reward calculations for affiliates

**Connections**:

- Integrates with [rewards](#rewards) for affiliate reward distribution
- Connects with [stats](#stats) for tracking affiliate performance metrics

**Documentation**: [Affiliates Module Details](./affiliates_module.md)

---

### assets

**Purpose**: Asset management and registry for the protocol.

**Key Features**:

- Asset registration and configuration
- Asset metadata management
- Asset lifecycle management
- Quantum to coin conversion

**Connections**:

- Core dependency for [subaccounts](#subaccounts) (asset positions)
- Used by [clob](#clob) for trading pair definitions
- Integrated with [sending](#sending) for asset transfers
- Connected to [vault](#vault) for vault asset management

**Documentation**: [Assets Module Details](./assets_module.md)

---

### blocktime

**Purpose**: Block time tracking and management.

**Key Features**:

- Block delay tracking
- Time-based operations scheduling

**Connections**:

- Used by [epochs](#epochs) for time-based epoch calculations
- Integrated with modules requiring time-sensitive operations

**Documentation**: [Blocktime Module Details](./blocktime_module.md)

---

### bridge

**Purpose**: Cross-chain bridge functionality for asset transfers.

**Key Features**:

- Bridge event acknowledgment
- Complete bridge operations
- Bridge safety and proposal parameters

**Connections**:

- Integrates with [assets](#assets) for bridged asset management
- Connects with [subaccounts](#subaccounts) for recipient accounts
- Works with [sending](#sending) for post-bridge asset transfers

**Documentation**: [Bridge Module Details](./bridge_module.md)

---

### clob

**Purpose**: Central Limit Order Book implementation for trading.

**Key Features**:

- Order book management
- Order matching engine
- Liquidation handling
- MEV (Maximal Extractable Value) telemetry
- Rate limiting for orders

**Connections**:

- Core dependency on [assets](#assets) for trading pairs
- Integrates with [perpetuals](#perpetuals) for perpetual contracts
- Uses [prices](#prices) for market pricing data
- Connects with [subaccounts](#subaccounts) for trader accounts
- Works with [stats](#stats) for trading volume metrics

---

### delaymsg

**Purpose**: Delayed message execution functionality.

**Key Features**:

- Scheduled message execution
- Block-based message queuing
- Delayed operation processing

**Connections**:

- Can delay messages for any module
- Integrates with governance for delayed proposals

---

### epochs

**Purpose**: Epoch-based timing system for periodic operations.

**Key Features**:

- Epoch duration management
- Epoch boundary detection
- Periodic task scheduling

**Connections**:

- Used by [rewards](#rewards) for reward distribution periods
- Integrated with [vault](#vault) for vault operations timing
- Connected to [vest](#vest) for vesting schedule management

**Documentation**: [Epochs Module Details](./epochs_module.md)

---

### feetiers

**Purpose**: Fee tier management based on user activity/staking.

**Key Features**:

- Tiered fee structures
- Staking-based fee discounts
- Per-market fee configurations

**Connections**:

- Integrates with [clob](#clob) for trading fee calculations
- Connects with staking modules for tier determination

---

### govplus

**Purpose**: Extended governance functionality.

**Key Features**:

- Additional governance operations beyond standard Cosmos SDK

**Connections**:

- Extends standard Cosmos governance module
- Integrates with [delaymsg](#delaymsg) for delayed governance actions

---

### leverage

**Purpose**: Leverage trading functionality.

**Note**: Appears to be a minimal implementation with only protobuf definitions.

**Connections**:

- Would integrate with [clob](#clob) for leveraged orders
- Would connect with [subaccounts](#subaccounts) for margin management

---

### listing

**Purpose**: Market listing and permissionless market creation.

**Key Features**:

- Permissionless market creation
- Listing parameters management
- Vault deposit parameters for new listings

**Connections**:

- Integrates with [clob](#clob) for new trading pairs
- Connects with [perpetuals](#perpetuals) for new perpetual markets
- Works with [prices](#prices) for oracle price feeds
- Integrated with [vault](#vault) for listing vault parameters

---

### perpetuals

**Purpose**: Perpetual contract management.

**Key Features**:

- Perpetual contract creation and management
- Funding rate calculations
- Liquidity tier configurations
- Premium vote processing

**Connections**:

- Core dependency for [clob](#clob) perpetual trading
- Integrates with [prices](#prices) for index pricing
- Connects with [subaccounts](#subaccounts) for position management
- Works with [vault](#vault) for vault perpetual strategies

**Documentation**: [Perpetuals Module Details](./perpetuals_module.md)

---

### prices

**Purpose**: Price oracle and market data management.

**Key Features**:

- Oracle price updates
- Market parameter management
- Price validation and smoothing
-Slinky adapter integration

**Connections**:

- Critical dependency for [clob](#clob) order pricing
- Used by [perpetuals](#perpetuals) for funding calculations
- Integrated with [assets](#assets) for asset valuations
- Connects with [subaccounts](#subaccounts) for margin calculations

**Documentation**: [Prices Module Details](./prices_module.md)

---

### ratelimit

**Purpose**: IBC (Inter-Blockchain Communication) rate limiting.

**Key Features**:

- Denom-based rate limiting
- Capacity tracking
- IBC middleware integration

**Connections**:

- IBC middleware layer
- Integrates with bank module for token transfers

---

### revshare

**Purpose**: Revenue sharing mechanism.

**Key Features**:

- Unconditional revenue shares
- Market mapper revenue shares
- Order router revenue shares

**Connections**:

- Integrates with [clob](#clob) for trading fee shares
- Connects with [rewards](#rewards) for revenue distribution

---

### rewards

**Purpose**: Reward distribution system.

**Key Features**:

- Treasury reward distribution
- Staking-based reward calculations
- Periodic reward processing

**Connections**:

- Uses [epochs](#epochs) for distribution timing
- Integrates with [stats](#stats) for reward calculations
- Connects with [affiliates](#affiliates) for affiliate rewards

---

### sending

**Purpose**: Asset transfer functionality.

**Key Features**:

- Basic transfers
- Subaccount deposits/withdrawals
- Module-to-account transfers

**Connections**:

- Core dependency on [assets](#assets) for transferable assets
- Integrates with [subaccounts](#subaccounts) for subaccount operations
- Connects with [bridge](#bridge) for post-bridge transfers

---

### stats

**Purpose**: Protocol statistics and metrics tracking.

**Key Features**:

- User statistics tracking
- Global statistics aggregation
- Trading volume metrics

**Connections**:

- Integrates with [clob](#clob) for trade volume tracking
- Connects with [rewards](#rewards) for reward calculations
- Works with [affiliates](#affiliates) for affiliate performance

**Documentation**: [Stats Module Details](./stats_module.md)

---

### subaccounts

**Purpose**: Subaccount management for isolated trading positions.

**Key Features**:

- Subaccount creation and management
- Asset and perpetual position tracking
- Margin and leverage calculations
- Isolated subaccount support

**Connections**:

- Core dependency for [clob](#clob) trading accounts
- Integrates with [assets](#assets) for asset positions
- Connects with [perpetuals](#perpetuals) for perpetual positions
- Uses [prices](#prices) for valuation calculations

---

**Documentation**: [Subaccounts Module Details](./subaccounts_module.md)

### vault

**Purpose**: Vault management for automated trading strategies.

**Key Features**:

- Vault creation and management
- Deposit and withdrawal operations
- Share-based ownership model
- Automated quoting strategies

**Connections**:

- Integrates with [clob](#clob) for vault trading operations
- Connects with [perpetuals](#perpetuals) for vault perpetual strategies
- Uses [epochs](#epochs) for vault operation timing
- Works with [listing](#listing) for new market vault parameters

---

### vest

**Purpose**: Token vesting schedule management.

**Key Features**:

- Vesting entry creation and management
- Schedule-based token unlocking
- Vesting period tracking

**Connections**:

- Uses [epochs](#epochs) for vesting period calculations
- Integrates with token modules for vesting asset management

## Module Interconnection Diagram

```m
┌─────────────┐    ┌──────────┐    ┌──────────┐
│   assets    │◄──►│  clob    │◄──►│perpetuals│
└─────────────┘    └──────────┘    └──────────┘
       ▲                 ▲               ▲
       │                 │               │
       ▼                 ▼               ▼
┌─────────────┐    ┌──────────┐    ┌──────────┐
│   prices    │◄──►│subaccounts│◄──►│  vault   │
└─────────────┘    └──────────┘    └──────────┘
       ▲                 ▲               ▲
       │                 │               │
       ▼                 ▼               ▼
┌─────────────┐    ┌──────────┐    ┌──────────┐
│   sending   │◄──►│  bridge  │    │ listing  │
└─────────────┘    └──────────┘    └──────────┘

┌─────────────┐    ┌──────────┐    ┌──────────┐
│   rewards   │◄──►│  stats   │◄──►│affiliates│
└─────────────┘    └──────────┘    └──────────┘
       ▲                 ▲               ▲
       │                 │               │
       ▼                 ▼               ▼
┌─────────────┐    ┌──────────┐    ┌──────────┐
│   epochs    │◄──►│  vest    │    │feetiers  │
└─────────────┘    └──────────┘    └──────────┘
```

## Key Integration Patterns

1. **Core Trading Pipeline**:
   - [assets](#assets) → [prices](#prices) → [clob](#clob) → [perpetuals](#perpetuals) → [subaccounts](#subaccounts)

2. **Account Management**:
   - [accountplus](#accountplus) provides authentication for all modules
   - [subaccounts](#subaccounts) manages positions for [clob](#clob) and [perpetuals](#perpetuals)

3. **Time-based Operations**:
   - [epochs](#epochs) drives periodic operations in [rewards](#rewards), [vault](#vault), and [vest](#vest)

4. **Asset Flow**:
   - [bridge](#bridge) → [sending](#sending) → [subaccounts](#subaccounts) → [clob](#clob)

5. **Governance Extensions**:
   - [govplus](#govplus) → [delaymsg](#delaymsg) for delayed governance actions

This modular architecture allows for independent development and testing of each component while maintaining clear interfaces between modules.
