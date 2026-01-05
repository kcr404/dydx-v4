# Subaccounts Module

## Overview

The Subaccounts module manages isolated trading accounts within the dYdX v4 protocol. Each subaccount is uniquely identified by an owner address and a subaccount number, allowing users to maintain separate trading positions and balances. This module handles asset positions, perpetual positions, margin trading, and risk management for all trading activities.

## Contents

- [Concepts](#concepts)
- [State](#state)
- [Messages](#messages)
- [Queries](#queries)
- [Events](#events)
- [Params](#params)
- [Functions](#functions)

## Concepts

### Subaccount Structure

A subaccount is a unique trading entity identified by:

- **Owner**: The wallet address that owns the subaccount
- **Number**: A unique number (0-128,000) identifying the subaccount for that owner

Each subaccount contains:

- **Asset Positions**: Holdings of different assets (currently only USDC)
- **Perpetual Positions**: Holdings of perpetual contracts
- **Margin Enabled**: Flag indicating if margin trading is enabled

### Asset Positions

Asset positions represent holdings of assets in a subaccount:

- **AssetId**: Identifier of the asset (currently only USDC with ID 0)
- **Quantums**: Absolute size of the position in base quantums
- **Index**: Settlement index (reserved for future margin trading)

### Perpetual Positions

Perpetual positions represent holdings of perpetual contracts:

- **PerpetualId**: Identifier of the perpetual contract
- **Quantums**: Size of the position in base quantums (positive for long, negative for short)
- **FundingIndex**: Funding index at the last settlement
- **QuoteBalance**: Quote balance for the perpetual position

### Margin Trading

Subaccounts can enable margin trading by setting the `margin_enabled` flag. This allows:

- Leveraged positions in perpetual contracts
- Borrowing against collateral for larger positions
- Funding payments between long and short positions

### Risk Management

The module enforces risk management through:

- **Collateral Requirements**: Ensuring sufficient collateral for open positions
- **Margin Checks**: Validating margin requirements before position updates
- **Isolated Positions**: Managing isolated perpetual markets separately
- **Leverage Limits**: Controlling maximum leverage through IMF (Initial Margin Fraction) settings

### Position Settlement

Positions are periodically settled to account for:

- **Funding Payments**: Transfers between long and short positions
- **Interest Payments**: For margin trading (future feature)
- **Fee Distribution**: Revenue sharing with market makers

## State

### Subaccounts

Subaccounts are stored with the key prefix `SA:` followed by the subaccount ID.

```protobuf
// Subaccount defines a single sub-account for a given address.
message Subaccount {
  // The Id of the Subaccount
  SubaccountId id = 1;
  // All `AssetPosition`s associated with this subaccount.
  repeated AssetPosition asset_positions = 2;
  // All `PerpetualPosition`s associated with this subaccount.
  repeated PerpetualPosition perpetual_positions = 3;
  // Set by the owner. If true, then margin trades can be made in this subaccount.
  bool margin_enabled = 4;
}

// SubaccountId defines a unique identifier for a Subaccount.
message SubaccountId {
  // The address of the wallet that owns this subaccount.
  string owner = 1;
  // The unique number of this subaccount for the owner.
  uint32 number = 2;
}

// AssetPosition represents an account's position in an asset.
message AssetPosition {
  // The `Id` of the `Asset`.
  uint32 asset_id = 1;
  // The absolute size of the position in base quantums.
  bytes quantums = 2;
  // The `Index` of the `Asset` the last time this position was settled.
  uint64 index = 3;
}

// PerpetualPosition represents an account's position in a perpetual.
message PerpetualPosition {
  // The `Id` of the `Perpetual`.
  uint32 perpetual_id = 1;
  // The size of the position in base quantums.
  bytes quantums = 2;
  // The funding_index of the `Perpetual` the last time this position was settled.
  bytes funding_index = 3;
  // The quote_balance of the `Perpetual`.
  bytes quote_balance = 4;
}
```

### Leverage Settings

Leverage settings are stored with the key prefix `Lev:` followed by the subaccount ID.

```protobuf
// PerpetualLeverageEntry represents a single perpetual leverage setting.
message PerpetualLeverageEntry {
  // The perpetual ID
  uint32 perpetual_id = 1;
  // The user selected IMF in parts per million
  uint32 custom_imf_ppm = 2;
}

// LeverageData represents the leverage settings for a subaccount.
message LeverageData {
  // List of leverage entries for this subaccount
  repeated PerpetualLeverageEntry entries = 1;
}
```

## Messages

Currently, the subaccounts module doesn't define any messages in its own module. Position updates and transfers are handled through other modules like CLOB (Central Limit Order Book).

## Queries

### QueryAllSubaccount

Fetches all subaccounts with pagination.

```protobuf
rpc SubaccountAll(QueryAllSubaccountRequest) returns (QuerySubaccountAllResponse);
```

### QueryGetSubaccount

Fetches a specific subaccount by owner and number.

```protobuf
rpc Subaccount(QueryGetSubaccountRequest) returns (QuerySubaccountResponse);
```

### QueryGetWithdrawalAndTransfersBlockedInfo

Returns information about withdrawal and transfer blocking.

```protobuf
rpc WithdrawalAndTransfersBlockedInfo(QueryGetWithdrawalAndTransfersBlockedInfoRequest) 
  returns (QueryWithdrawalAndTransfersBlockedInfoResponse);
```

### QueryGetCollateralPoolAddress

Returns the collateral pool address for a given perpetual ID.

```protobuf
rpc CollateralPoolAddress(QueryGetCollateralPoolAddressRequest) 
  returns (QueryCollateralPoolAddressResponse);
```

## Events

### SettledFunding

Emitted when funding payments are settled for a subaccount.

```protobuf
message SettledFundingEvent {
  SubaccountId subaccount_id = 1;
  uint32 perpetual_id = 2;
  bytes funding_payment = 3;
}
```

## Params

The subaccounts module doesn't have any parameters.

## Functions

### Core Keeper Functions

#### SetSubaccount

Sets a subaccount in the store. Empty subaccounts are automatically removed.

```go
func (k Keeper) SetSubaccount(ctx sdk.Context, subaccount types.Subaccount)
```

#### GetSubaccount

Retrieves a subaccount by its ID. Returns a default empty subaccount if not found.

```go
func (k Keeper) GetSubaccount(ctx sdk.Context, id types.SubaccountId) (val types.Subaccount)
```

#### UpdateSubaccounts

Atomically validates and applies updates to subaccounts. All updates succeed or fail together.

```go
func (k Keeper) UpdateSubaccounts(
  ctx sdk.Context,
  updates []types.Update,
  updateType types.UpdateType,
) (success bool, successPerUpdate []types.UpdateResult, err error)
```

#### CanUpdateSubaccounts

Validates if subaccount updates would be successful without applying them.

```go
func (k Keeper) CanUpdateSubaccounts(
  ctx sdk.Context,
  updates []types.Update,
  updateType types.UpdateType,
) (success bool, successPerUpdate []types.UpdateResult, err error)
```

#### GetNetCollateralAndMarginRequirements

Calculates net collateral and margin requirements for a hypothetical subaccount update.

```go
func (k Keeper) GetNetCollateralAndMarginRequirements(
  ctx sdk.Context,
  update types.Update,
) (risk margin.Risk, err error)
```

### Transfer Functions

#### DepositFundsFromAccountToSubaccount

Deposits funds from a wallet account to a subaccount.

```go
func (k Keeper) DepositFundsFromAccountToSubaccount(
  ctx sdk.Context,
  fromAccount sdk.AccAddress,
  toSubaccountId types.SubaccountId,
  assetId uint32,
  quantums *big.Int,
) error
```

#### WithdrawFundsFromSubaccountToAccount

Withdraws funds from a subaccount to a wallet account.

```go
func (k Keeper) WithdrawFundsFromSubaccountToAccount(
  ctx sdk.Context,
  fromSubaccountId types.SubaccountId,
  toAccount sdk.AccAddress,
  assetId uint32,
  quantums *big.Int,
) error
```

#### TransferFundsFromSubaccountToSubaccount

Transfers funds between two subaccounts.

```go
func (k Keeper) TransferFundsFromSubaccountToSubaccount(
  ctx sdk.Context,
  senderSubaccountId types.SubaccountId,
  recipientSubaccountId types.SubaccountId,
  assetId uint32,
  quantums *big.Int,
) error
```

### Collateral Pool Functions

#### GetCollateralPoolForSubaccount

Returns the collateral pool address for a subaccount based on its perpetual positions.

```go
func (k Keeper) GetCollateralPoolForSubaccount(
  ctx sdk.Context,
  subaccountId types.SubaccountId,
) (sdk.AccAddress, error)
```

#### GetCollateralPoolFromPerpetualId

Returns the collateral pool address for a perpetual ID.

```go
func (k Keeper) GetCollateralPoolFromPerpetualId(
  ctx sdk.Context,
  perpetualId uint32,
) (sdk.AccAddress, error)
```

### Leverage Functions

#### SetLeverage

Stores leverage data for a subaccount.

```go
func (k Keeper) SetLeverage(
  ctx sdk.Context,
  subaccountId *types.SubaccountId,
  leverageMap map[uint32]uint32,
)
```

#### GetLeverage

Retrieves leverage data for a subaccount.

```go
func (k Keeper) GetLeverage(
  ctx sdk.Context,
  subaccountId *types.SubaccountId,
) (map[uint32]uint32, bool)
```

#### UpdateLeverage

Updates leverage settings for specific perpetuals in a subaccount.

```go
func (k Keeper) UpdateLeverage(
  ctx sdk.Context,
  subaccountId *types.SubaccountId,
  perpetualLeverage map[uint32]uint32,
) error
```

### Insurance Fund Functions

#### TransferInsuranceFundPayments

Transfers funds to/from the insurance fund for covering liquidation losses.

```go
func (k Keeper) TransferInsuranceFundPayments(
  ctx sdk.Context,
  insuranceFundDelta *big.Int,
  perpetualId uint32,
) error
```

#### GetInsuranceFundBalance

Returns the current balance of the insurance fund for a perpetual.

```go
func (k Keeper) GetInsuranceFundBalance(
  ctx sdk.Context,
  perpetualId uint32,
) (balance *big.Int)
