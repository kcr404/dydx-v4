# Vault Module

## Overview

The vault module manages vaults, which are automated trading entities that place orders on the CLOB (Central Limit Order Book). Vaults operate with specific strategies to provide liquidity to markets while managing risk. The module supports both individual vaults and a special "megavault" that aggregates deposits from multiple users.

## Key Components

### Vault Types

- **CLOB Vault**: Vaults that trade on the central limit order book
- **Megavault**: A special vault that aggregates deposits from multiple users and distributes profits/losses proportionally

### Vault Statuses

- **DEACTIVATED**: Vault is not placing orders
- **STAND_BY**: Vault is ready to place orders but is not actively quoting
- **QUOTING**: Vault is actively placing and managing orders
- **CLOSE_ONLY**: Vault is only closing existing positions, not opening new ones

## Core Concepts

### Shares System

The vault module uses a share-based system for deposits and withdrawals:

- Users deposit funds to receive shares in the megavault
- Shares represent proportional ownership of the vault's assets
- Withdrawals are processed by redeeming shares for underlying assets
- Share value fluctuates based on vault performance

### Order Management

Vaults automatically place and manage orders on the CLOB:

- Orders are placed according to configurable quoting parameters
- Orders are refreshed periodically to maintain market presence
- Multiple layers of orders can be placed with configurable spreads
- Orders are skewed based on inventory position to manage risk

### Megavault Architecture

The megavault consists of:

- **Main Vault**: Central pool of funds managed by the protocol
- **Sub Vaults**: Individual vaults that can be allocated funds from the main vault
- **Operator**: Authorized entity that can allocate/retrieve funds from sub vaults

## State Management

### Primary State Objects

#### Vault Parameters (`VaultParams`)

Configuration parameters for individual vaults:

- `Status`: Current operational status of the vault
- `QuotingParams`: Parameters controlling order placement behavior

#### Quoting Parameters (`QuotingParams`)

Controls how a vault places orders:

- `ActivationThresholdQuoteQuantums`: Minimum equity required to activate quoting
- `OrderSizePctPpm`: Percentage of vault equity to use for each order
- `OrderExpirationSeconds`: Duration before orders expire
- `SpreadMinPpm`: Minimum spread between bid and ask prices
- `Layers`: Number of price levels to place orders at
- `SkewFactorPpm`: Factor to adjust order placement based on inventory
- `JitterBps`: Randomization factor for order prices

#### Operator Parameters (`OperatorParams`)

Configuration for the megavault operator:

- `Operator`: Address authorized to manage sub vault allocations

#### Shares

- `TotalShares`: Total shares outstanding in the megavault
- `OwnerShares`: Individual owner share balances
- `OwnerShareUnlocks`: Scheduled share unlocks for owners

### State Storage Keys

- `TotalSharesKey`: Stores total shares in megavault
- `OwnerSharesKeyPrefix`: Maps owner addresses to their share balances
- `OwnerShareUnlocksKeyPrefix`: Maps owner addresses to their scheduled unlocks
- `DefaultQuotingParamsKey`: Default quoting parameters for all vaults
- `VaultParamsKeyPrefix`: Maps vault IDs to their parameters
- `MostRecentClientIdsKeyPrefix`: Tracks most recent order client IDs for each vault
- `OperatorParamsKey`: Stores operator parameters

## Messages

### User Messages

#### `MsgDepositToMegavault`

Allows users to deposit funds into the megavault in exchange for shares.

Fields:

- `SubaccountId`: Source subaccount for deposit
- `QuoteQuantums`: Amount to deposit in quote quantums

Events:

- `deposit_to_megavault`: Emitted on successful deposit

#### `MsgWithdrawFromMegavault`

Allows users to redeem shares for underlying assets from the megavault.

Fields:

- `SubaccountId`: Destination subaccount for withdrawal
- `Shares`: Number of shares to redeem
- `MinQuoteQuantums`: Minimum acceptable quote quantums to receive

Events:

- `withdraw_from_megavault`: Emitted on successful withdrawal

### Authority Messages

#### `MsgSetVaultParams`

Sets parameters for a specific vault (requires authority or operator).

Fields:

- `Authority`: Message sender (must be authority or operator)
- `VaultId`: Identifier for the vault to configure
- `VaultParams`: New parameters for the vault

#### `MsgAllocateToVault`

Allocates funds from the megavault to a sub vault (requires authority or operator).

Fields:

- `Authority`: Message sender (must be authority or operator)
- `VaultId`: Identifier for the destination vault
- `QuoteQuantums`: Amount to allocate in quote quantums

#### `MsgRetrieveFromVault`

Retrieves funds from a sub vault back to the megavault (requires authority or operator).

Fields:

- `Authority`: Message sender (must be authority or operator)
- `VaultId`: Identifier for the source vault
- `QuoteQuantums`: Amount to retrieve in quote quantums

#### `MsgUpdateDefaultQuotingParams`

Updates the default quoting parameters for all vaults (requires authority or operator).

Fields:

- `Authority`: Message sender (must be authority or operator)
- `DefaultQuotingParams`: New default quoting parameters

#### `MsgUpdateOperatorParams`

Updates the operator parameters (requires authority).

Fields:

- `Authority`: Message sender (must be authority)
- `OperatorParams`: New operator parameters

## Queries

### Vault Information

#### `Vault`

Returns information about a specific vault.

Request:

- `Type`: Type of vault
- `Number`: Vault number

Response includes:

- `VaultId`: Identifier for the vault
- `SubaccountId`: Associated subaccount
- `Equity`: Current equity in quote quantums
- `Inventory`: Current inventory position
- `VaultParams`: Current vault parameters
- `MostRecentClientIds`: Client IDs of recent orders

#### `AllVaults`

Returns information about all vaults with pagination support.

#### `VaultParams`

Returns parameters for a specific vault.

Request:

- `Type`: Type of vault
- `Number`: Vault number

Response includes:

- `VaultId`: Identifier for the vault
- `VaultParams`: Current vault parameters

### Megavault Information

#### `MegavaultTotalShares`

Returns the total shares in the megavault.

#### `MegavaultOwnerShares`

Returns share information for a specific owner.

Request:

- `Address`: Owner address

Response includes:

- `Address`: Owner address
- `Shares`: Total shares owned
- `ShareUnlocks`: Scheduled share unlocks
- `Equity`: Total equity attributable to owner
- `WithdrawableEquity`: Equity available for withdrawal

#### `MegavaultAllOwnerShares`

Returns share information for all owners with pagination support.

#### `MegavaultWithdrawalInfo`

Calculates expected redemption value for a withdrawal.

Request:

- `SharesToWithdraw`: Number of shares to redeem

Response includes:

- `SharesToWithdraw`: Number of shares to redeem
- `ExpectedQuoteQuantums`: Expected quote quantums to receive
- `MegavaultEquity`: Total megavault equity
- `TotalShares`: Total shares outstanding

### Parameters

#### `Params`

Returns module parameters.

Response includes:

- `DefaultQuotingParams`: Default quoting parameters
- `OperatorParams`: Operator parameters

## Events

### Deposit Events

#### `deposit_to_megavault`

Emitted when a user deposits funds to the megavault.

Attributes:

- `depositor`: Address of depositor
- `quote_quantums`: Amount deposited in quote quantums
- `minted_shares`: Number of shares minted

### Withdrawal Events

#### `withdraw_from_megavault`

Emitted when a user withdraws funds from the megavault.

Attributes:

- `withdrawer`: Address of withdrawer
- `shares_to_withdraw`: Number of shares redeemed
- `total_shares`: Total shares outstanding
- `megavault_equity`: Total megavault equity
- `redeemed_quote_quantums`: Quote quantums received

### Sweep Events

#### `sweep_to_megavault`

Emitted when funds are swept to the megavault.

Attributes:

- `swept_quote_quantums`: Amount swept in quote quantums

## ABCI Methods

### BeginBlocker

Executes at the beginning of each block:

- Decommissions vaults with non-positive equity

### EndBlocker

Executes at the end of each block:

- Refreshes all vault orders
- Sweeps main vault bank balances to subaccount

## CLI Commands

### Query Commands

#### `get-params`

Retrieves module parameters.

Usage:

```
dydxprotocold query vault get-params
```

#### `get-vault [type] [number]`

Retrieves information about a specific vault.

Usage:

```
dydxprotocold query vault get-vault clob 0
```

#### `list-vault`

Lists all vaults.

Usage:

```bash
dydxprotocold query vault list-vault
```

#### `total-shares`

Gets total shares of megavault.

Usage:

```bash
dydxprotocold query vault total-shares
```

#### `list-owner-shares`

Lists owner shares.

Usage:

```bash
dydxprotocold query vault list-owner-shares
```

#### `megavault-withdrawal-info [shares_to_withdraw]`

Gets megavault withdrawal info.

Usage:

```bash
dydxprotocold query vault megavault-withdrawal-info 1000000
```

#### `owner-shares [address]`

Gets owner shares by their address.

Usage:

```bash
dydxprotocold query vault owner-shares dydx1...
```

### Transaction Commands

#### `deposit-to-megavault [depositor_owner] [depositor_number] [quantums]`

Deposits funds to the megavault.

Usage:

```bash
dydxprotocold tx vault deposit-to-megavault dydx1... 0 1000000
```

#### `set-vault-params [authority] [vault_type] [vault_number] [status] [quoting_params_json]`

Sets parameters for a vault.

Usage:

```bash
dydxprotocold tx vault set-vault-params dydx1... clob 0 quoting '{}'
```

#### `allocate-to-vault [authority] [vault_type] [vault_number] [quote_quantums]`

Allocates funds to a sub vault.

Usage:

```bash
dydxprotocold tx vault allocate-to-vault dydx1... clob 0 1000000
```

#### `retrieve-from-vault [authority] [vault_type] [vault_number] [quote_quantums]`

Retrieves funds from a sub vault.

Usage:

```bash
dydxprotocold tx vault retrieve-from-vault dydx1... clob 0 1000000
```

#### `withdraw-from-megavault [withdrawer_owner] [withdrawer_number] [shares] [min_quote_quantums]`

Withdraws funds from the megavault.

Usage:

```bash
dydxprotocold tx vault withdraw-from-megavault dydx1... 0 1000000 900000
```

#### `update-default-quoting-params [authority] [quoting_params_json]`

Updates default quoting parameters.

Usage:

```bash
dydxprotocold tx vault update-default-quoting-params dydx1... '{"activation_threshold_quote_quantums":"1000000000","order_size_pct_ppm":100000}'
```

## Dependencies

The vault module depends on several other modules:

- **Assets**: For asset information
- **Bank**: For balance queries
- **CLOB**: For order placement and management
- **DelayMsg**: For delayed message execution
- **Perpetuals**: For perpetual market information
- **Prices**: For market price data
- **Sending**: For transfer processing
- **Subaccounts**: For subaccount management

## Error Handling

The module defines various error types for different failure conditions:

- `ErrNegativeShares`: Shares are negative
- `ErrClobPairNotFound`: CLOB pair not found
- `ErrMarketParamNotFound`: Market parameter not found
- `ErrInvalidQuoteQuantums`: Invalid quote quantums amount
- `ErrNonPositiveEquity`: Non-positive equity
- `ErrInvalidOrderSizePctPpm`: Invalid order size percentage
- And many others covering various validation and operational failures

## Genesis Initialization

The module's genesis state includes:

- Default quoting parameters
- Operator parameters
- Total shares
- Owner shares
- Vault configurations
- Share unlock schedules
