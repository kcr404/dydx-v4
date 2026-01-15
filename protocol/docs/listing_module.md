# `x/listing`

## Overview

The listing module provides functionality for managing market listings on the dYdX chain. It enables permissionless creation of new markets, setting hard caps on the number of listed markets, configuring vault deposit parameters for new market listings, and upgrading isolated perpetuals to cross perpetuals.

## Concepts

### Permissionless Market Creation

The listing module allows users to create new markets without going through governance. This is done through the `MsgCreateMarketPermissionless` message, which requires a ticker and a subaccount to deposit funds from. The module will create a new market, perpetual, and clob pair for the specified ticker.

### Hard Cap for Markets

The module enforces a hard cap on the total number of markets that can be listed. This cap can be set by authorized accounts through the `MsgSetMarketsHardCap` message. The hard cap is stored in the module's state and checked during market creation.

### Listing Vault Deposit Parameters

When creating a new market, the module can automatically deposit funds to the megavault to provide initial liquidity. The parameters for these deposits (amounts for new vault and main vault, lockup period) can be configured by authorized accounts through the `MsgSetListingVaultDepositParams` message.

### Isolated Perpetual to Cross Upgrade

The module provides functionality to upgrade an isolated perpetual to a cross perpetual. This allows isolated markets to become part of the cross-margin system, enabling more flexible trading.

## State

The listing module maintains the following state:

### HardCapForMarkets

Stores the hard cap on the number of markets that can be listed.

Key: `HardCapForMarketsKey`
Value: `uint32`

### ListingVaultDepositParams

Stores the parameters for vault deposits when creating new markets.

Key: `ListingVaultDepositParamsKey`
Value: `ListingVaultDepositParams`

Structure:

```protobuf
message ListingVaultDepositParams {
  // Amount that will be deposited into the new market vault exclusively
  string new_vault_deposit_amount = 1;
  // Amount deposited into the main vault exclusively. This amount does not
  // include the amount deposited into the new vault.
  string main_vault_deposit_amount = 2;
  // Lockup period for this deposit
  uint32 num_blocks_to_lock_shares = 3;
}
```

## Messages

### `MsgCreateMarketPermissionless`

Creates a new market without going through governance.

```protobuf
message MsgCreateMarketPermissionless {
  // The name of the `Perpetual` (e.g. `BTC-USD`).
  string ticker = 1;
  // The subaccount to deposit from.
  SubaccountId subaccount_id = 2;
}
```

Fields:

- `ticker`: The ticker symbol for the new market (e.g., "BTC-USD")
- `subaccount_id`: The subaccount to deposit funds from for the vault deposit

### `MsgSetMarketsHardCap`

Sets a hard cap on the number of markets listed.

```protobuf
message MsgSetMarketsHardCap {
  string authority = 1;
  // Hard cap for the total number of markets listed
  uint32 hard_cap_for_markets = 2;
}
```

Fields:

- `authority`: The authority address (must be in the module's authority list)
- `hard_cap_for_markets`: The maximum number of markets that can be listed

### `MsgSetListingVaultDepositParams`

Sets the parameters for vault deposits when creating new markets.

```protobuf
message MsgSetListingVaultDepositParams {
  string authority = 1;
  // Params which define the vault deposit for market listing
  ListingVaultDepositParams params = 2;
}
```

Fields:

- `authority`: The authority address (must be in the module's authority list)
- `params`: The vault deposit parameters

### `MsgUpgradeIsolatedPerpetualToCross`

Upgrades an isolated perpetual to cross margin.

```protobuf
message MsgUpgradeIsolatedPerpetualToCross {
  string authority = 1;
  // ID of the perpetual to be upgraded to CROSS
  uint32 perpetual_id = 2;
}
```

Fields:

- `authority`: The authority address (must be in the module's authority list)
- `perpetual_id`: The ID of the perpetual to upgrade from isolated to cross margin

## Queries

### `MarketsHardCap`

Queries for the hard cap number of listed markets.

```protobuf
message QueryMarketsHardCap {}
```

Response:

```protobuf
message QueryMarketsHardCapResponse {
  uint32 hard_cap = 1;
}
```

### `ListingVaultDepositParams`

Queries the listing vault deposit params.

```protobuf
message QueryListingVaultDepositParams {}
```

Response:

```protobuf
message QueryListingVaultDepositParamsResponse {
  ListingVaultDepositParams params = 1;
}
```

## Client

### CLI

#### Transactions

To create a new market permissionlessly:

```bash
dydxprotocold tx listing create-market [ticker] [address]
```

#### Query Commands

To query the listing vault deposit parameters:

```bash
dydxprotocold query listing listing-vault-deposit-params
```

## Events

The listing module emits events when markets are created and when perpetuals are upgraded from isolated to cross margin. These events are handled by the indexer to track market listings and upgrades.

## Params

The listing module does not have traditional parameters. Instead, it stores configuration values directly in the state:

1. **HardCapForMarkets**: Maximum number of markets that can be listed
2. **ListingVaultDepositParams**: Parameters for vault deposits when creating new markets

These values can be set through the appropriate messages by authorized accounts.

## Keeper Methods

### State Management

- `SetMarketsHardCap(ctx sdk.Context, hardCap uint32) error`: Sets the hard cap on listed markets
- `GetMarketsHardCap(ctx sdk.Context) uint32`: Gets the hard cap on listed markets
- `SetListingVaultDepositParams(ctx sdk.Context, params ListingVaultDepositParams) error`: Sets the listing vault deposit parameters
- `GetListingVaultDepositParams(ctx sdk.Context) ListingVaultDepositParams`: Gets the listing vault deposit parameters

### Market Creation

- `CreateMarket(ctx sdk.Context, ticker string) (marketId uint32, err error)`: Creates a new market
- `CreatePerpetual(ctx sdk.Context, marketId uint32, ticker string) (perpetualId uint32, err error)`: Creates a new perpetual
- `CreateClobPair(ctx sdk.Context, perpetualId uint32) (clobPairId uint32, err error)`: Creates a new clob pair
- `DepositToMegavaultforPML(ctx sdk.Context, fromSubaccount SubaccountId, clobPairId uint32) error`: Deposits to the megavault for a new PML market

### Perpetual Upgrades

- `UpgradeIsolatedPerpetualToCross(ctx sdk.Context, perpetualId uint32) error`: Upgrades an isolated perpetual to cross margin
