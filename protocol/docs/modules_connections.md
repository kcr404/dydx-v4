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

**Connections**:

- Integrates with transaction processing pipeline
- Used by other modules requiring enhanced authentication

---

### affiliates

**Connections**:

- Integrates with [rewards](#rewards) for affiliate reward distribution
- Connects with [stats](#stats) for tracking affiliate performance metrics

---

### assets

**Connections**:

- Core dependency for [subaccounts](#subaccounts) (asset positions)
- Used by [clob](#clob) for trading pair definitions
- Integrated with [sending](#sending) for asset transfers
- Connected to [vault](#vault) for vault asset management

---

### blocktime

**Connections**:

- Used by [epochs](#epochs) for time-based epoch calculations
- Integrated with modules requiring time-sensitive operations

---

### bridge

**Connections**:

- Integrates with [assets](#assets) for bridged asset management
- Connects with [subaccounts](#subaccounts) for recipient accounts
- Works with [sending](#sending) for post-bridge asset transfers

---

### clob

**Connections**:

- Core dependency on [assets](#assets) for trading pairs
- Integrates with [perpetuals](#perpetuals) for perpetual contracts
- Uses [prices](#prices) for market pricing data
- Connects with [subaccounts](#subaccounts) for trader accounts
- Works with [stats](#stats) for trading volume metrics

---

### delaymsg

**Connections**:

- Can delay messages for any module
- Integrates with governance for delayed proposals

---

### epochs

**Connections**:

- Used by [rewards](#rewards) for reward distribution periods
- Integrated with [vault](#vault) for vault operations timing
- Connected to [vest](#vest) for vesting schedule management

---

### feetiers

**Connections**:

- Integrates with [clob](#clob) for trading fee calculations
- Connects with staking modules for tier determination

---

### govplus

**Connections**:

- Extends standard Cosmos governance module
- Integrates with [delaymsg](#delaymsg) for delayed governance actions

---

### leverage

**Connections**:

- Would integrate with [clob](#clob) for leveraged orders
- Would connect with [subaccounts](#subaccounts) for margin management

---

### listing

**Connections**:

- Integrates with [clob](#clob) for new trading pairs
- Connects with [perpetuals](#perpetuals) for new perpetual markets
- Works with [prices](#prices) for oracle price feeds
- Integrated with [vault](#vault) for listing vault parameters

---

### perpetuals

**Connections**:

- Core dependency for [clob](#clob) perpetual trading
- Integrates with [prices](#prices) for index pricing
- Connects with [subaccounts](#subaccounts) for position management
- Works with [vault](#vault) for vault perpetual strategies

---

### prices

**Connections**:

- Critical dependency for [clob](#clob) order pricing
- Used by [perpetuals](#perpetuals) for funding calculations
- Integrated with [assets](#assets) for asset valuations
- Connects with [subaccounts](#subaccounts) for margin calculations

---

### ratelimit

**Connections**:

- IBC middleware layer
- Integrates with bank module for token transfers

---

### revshare

**Connections**:

- Integrates with [clob](#clob) for trading fee shares
- Connects with [rewards](#rewards) for revenue distribution

---

### rewards

**Connections**:

- Uses [epochs](#epochs) for distribution timing
- Integrates with [stats](#stats) for reward calculations
- Connects with [affiliates](#affiliates) for affiliate rewards

---

### sending

**Connections**:

- Core dependency on [assets](#assets) for transferable assets
- Integrates with [subaccounts](#subaccounts) for subaccount operations
- Connects with [bridge](#bridge) for post-bridge transfers

---

### stats

**Connections**:

- Integrates with [clob](#clob) for trade volume tracking
- Connects with [rewards](#rewards) for reward calculations
- Works with [affiliates](#affiliates) for affiliate performance

---

### subaccounts

**Connections**:

- Core dependency for [clob](#clob) trading accounts
- Integrates with [assets](#assets) for asset positions
- Connects with [perpetuals](#perpetuals) for perpetual positions
- Uses [prices](#prices) for valuation calculations

---

### vault

**Connections**:

- Integrates with [clob](#clob) for vault trading operations
- Connects with [perpetuals](#perpetuals) for vault perpetual strategies
- Uses [epochs](#epochs) for vault operation timing
- Works with [listing](#listing) for new market vault parameters

---

### vest

**Connections**:

- Uses [epochs](#epochs) for vesting period calculations
- Integrates with token modules for vesting asset management

## Module Interconnection Diagram

```
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
