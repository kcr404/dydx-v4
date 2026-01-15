# `x/clob`

## Overview

The clob module implements a Central Limit Order Book (CLOB) for perpetual futures trading on the dYdX chain. It provides functionality for placing, canceling, and matching orders, as well as handling liquidations, rate limiting, and MEV (Maximal Extractable Value) protection. The module supports different order types including short-term, long-term, conditional, and TWAP orders.

## Concepts

### Order Types

#### Short-Term Orders

Short-term orders are committed to the mempool and expire at a specific block height (`GoodTilBlock`). They are not stored in persistent state and are only kept in memory.

#### Long-Term Orders

Long-term orders are stateful orders that are stored in the blockchain state and expire at a specific timestamp (`GoodTilBlockTime`). They persist across blocks until filled or expired.

#### Conditional Orders

Conditional orders are stateful orders that are triggered when certain conditions are met, such as when the oracle price reaches a specific trigger price. They include take-profit and stop-loss orders.

#### TWAP Orders

TWAP (Time Weighted Average Price) orders are special long-term orders that split a large order into smaller suborders executed over time at regular intervals.

### Order Matching

The CLOB uses a price-time priority matching algorithm. Buy orders are matched against sell orders based on price priority (highest bids first, lowest asks first) and time priority (earlier orders first).

### Liquidations

The module handles subaccount liquidations when positions fall below maintenance margin requirements. Liquidation orders are IOC (Immediate-or-Cancel) orders that are matched against the order book.

### Rate Limiting

The module implements rate limiting for orders to prevent spam and ensure network stability. Both block-based rate limits and equity-tier-based limits are enforced.

### MEV Protection

The module includes mechanisms to minimize MEV (Maximal Extractable Value) by ensuring fair ordering of transactions and preventing front-running.

## State

The clob module maintains the following state:

### ClobPairs

Stores the available CLOB pairs for trading.

Key: `ClobPairKeyPrefix | BigEndian(ClobPair.Id)`
Value: `ClobPair`

Structure:

```protobuf
message ClobPair {
  uint32 id = 1;
  oneof metadata {
    PerpetualClobMetadata perpetual_clob_metadata = 2;
    SpotClobMetadata spot_clob_metadata = 3;
  }
  Status status = 4;
  uint32 step_base_quantums = 5;
  uint32 subticks_per_tick = 6;
}

message PerpetualClobMetadata {
  uint32 perpetual_id = 1;
}

message SpotClobMetadata {
  uint32 spot_id = 1;
}
```

### Block Rate Limit Configuration

Stores configuration for rate limiting orders per N blocks.

Key: `BlockRateLimitConfigKey`
Value: `BlockRateLimitConfiguration`

Structure:

```protobuf
message BlockRateLimitConfiguration {
  repeated MaxPerNBlocksRateLimit max_short_term_orders_and_cancels_per_n_blocks = 1;
  repeated MaxPerNBlocksRateLimit max_stateful_orders_per_n_blocks = 2;
  repeated MaxPerNBlocksRateLimit max_leverage_updates_per_n_blocks = 3;
}

message MaxPerNBlocksRateLimit {
  uint32 num_blocks = 1;
  uint32 limit = 2;
}
```

### Equity Tier Limit Configuration

Stores configuration for equity-tier-based order limits.

Key: `EquityTierLimitConfigKey`
Value: `EquityTierLimitConfiguration`

Structure:

```protobuf
message EquityTierLimitConfiguration {
  repeated EquityTierLimit short_term_order_equity_tiers = 1;
  repeated EquityTierLimit stateful_order_equity_tiers = 2;
}

message EquityTierLimit {
  github_com_dydxprotocol_v4_chain_protocol_dtypes.SerializableInt usd_tnc_required = 1;
  uint32 limit = 2;
}
```

### Liquidations Configuration

Stores configuration for liquidation parameters.

Key: `LiquidationsConfigKey`
Value: `LiquidationsConfig`

Structure:

```protobuf
message LiquidationsConfig {
  FillablePriceConfig fillable_price_config = 1;
  uint32 max_liquidation_fee_ppm = 2;
  PositionBlockLimits position_block_limits = 3;
  SubaccountBlockLimits subaccount_block_limits = 4;
}

message FillablePriceConfig {
  uint32 bankruptcy_adjustment_ppm = 1;
  uint32 spread_to_maintenance_margin_ratio_ppm = 2;
}

message PositionBlockLimits {
  uint32 max_position_portion_liquidated_ppm = 1;
}

message SubaccountBlockLimits {
  uint64 max_notional_liquidated = 1;
  uint64 max_quantums_insurance_lost = 2;
}
```

## Messages

### `MsgPlaceOrder`

Places an order on the CLOB.

```protobuf
message MsgPlaceOrder {
  Order order = 1;
}
```

Fields:

- `order`: The order to place

### `MsgCancelOrder`

Cancels an existing order.

```protobuf
message MsgCancelOrder {
  OrderId order_id = 1;
  oneof good_til_oneof {
    uint32 good_til_block = 2;
    uint32 good_til_block_time = 3;
  }
}
```

Fields:

- `order_id`: The ID of the order to cancel
- `good_til_block`: For short-term orders, the block height at which the cancellation expires
- `good_til_block_time`: For stateful orders, the timestamp at which the cancellation expires

### `MsgBatchCancel`

Cancels multiple orders in a single transaction.

```protobuf
message MsgBatchCancel {
  SubaccountId subaccount_id = 1;
  repeated OrderBatch order_batches = 2;
  uint32 good_til_block = 3;
}
```

Fields:

- `subaccount_id`: The subaccount whose orders are being canceled
- `order_batches`: List of order batches to cancel
- `good_til_block`: The block height at which the batch cancellation expires

### `MsgCreateClobPair`

Creates a new CLOB pair.

```protobuf
message MsgCreateClobPair {
  string authority = 1;
  ClobPair clob_pair = 2;
}
```

Fields:

- `authority`: The authority address (must be in the module's authority list)
- `clob_pair`: The CLOB pair to create

### `MsgUpdateClobPair`

Updates an existing CLOB pair.

```protobuf
message MsgUpdateClobPair {
  string authority = 1;
  ClobPair clob_pair = 2;
}
```

Fields:

- `authority`: The authority address (must be in the module's authority list)
- `clob_pair`: The updated CLOB pair

### `MsgUpdateBlockRateLimitConfiguration`

Updates the block rate limit configuration.

```protobuf
message MsgUpdateBlockRateLimitConfiguration {
  string authority = 1;
  BlockRateLimitConfiguration block_rate_limit_config = 2;
}
```

Fields:

- `authority`: The authority address (must be in the module's authority list)
- `block_rate_limit_config`: The new block rate limit configuration

### `MsgUpdateEquityTierLimitConfiguration`

Updates the equity tier limit configuration.

```protobuf
message MsgUpdateEquityTierLimitConfiguration {
  string authority = 1;
  EquityTierLimitConfiguration equity_tier_limit_config = 2;
}
```

Fields:

- `authority`: The authority address (must be in the module's authority list)
- `equity_tier_limit_config`: The new equity tier limit configuration

### `MsgUpdateLiquidationsConfig`

Updates the liquidations configuration.

```protobuf
message MsgUpdateLiquidationsConfig {
  string authority = 1;
  LiquidationsConfig liquidations_config = 2;
}
```

Fields:

- `authority`: The authority address (must be in the module's authority list)
- `liquidations_config`: The new liquidations configuration

## Queries

### `ClobPair`

Queries a specific CLOB pair by ID.

```protobuf
message QueryGetClobPairRequest {
  uint32 id = 1;
}
```

Response:

```protobuf
message QueryGetClobPairResponse {
  ClobPair clob_pair = 1;
}
```

### `ClobPairAll`

Queries all CLOB pairs.

```protobuf
message QueryAllClobPairRequest {
  cosmos.base.query.v1beta1.PageRequest pagination = 1;
}
```

Response:

```protobuf
message QueryAllClobPairResponse {
  repeated ClobPair clob_pair = 1;
  cosmos.base.query.v1beta1.PageResponse pagination = 2;
}
```

### `BlockRateLimitConfiguration`

Queries the block rate limit configuration.

```protobuf
message QueryBlockRateLimitConfigurationRequest {}
```

Response:

```protobuf
message QueryBlockRateLimitConfigurationResponse {
  BlockRateLimitConfiguration block_rate_limit_config = 1;
}
```

### `EquityTierLimitConfiguration`

Queries the equity tier limit configuration.

```protobuf
message QueryEquityTierLimitConfigurationRequest {}
```

Response:

```protobuf
message QueryEquityTierLimitConfigurationResponse {
  EquityTierLimitConfiguration equity_tier_limit_config = 1;
}
```

### `LiquidationsConfiguration`

Queries the liquidations configuration.

```protobuf
message QueryLiquidationsConfigurationRequest {}
```

Response:

```protobuf
message QueryLiquidationsConfigurationResponse {
  LiquidationsConfig liquidations_config = 1;
}
```

### `StatefulOrder`

Queries a specific stateful order by ID.

```protobuf
message QueryStatefulOrderRequest {
  OrderId order_id = 1;
}
```

Response:

```protobuf
message QueryStatefulOrderResponse {
  Order order = 1;
  uint32 fill_amount = 2;
  int64 good_til_block_time = 3;
}
```

## Client

### CLI

#### Transactions

To place an order:

```bash
dydxprotocold tx clob place-order [flags]
```

To cancel an order:

```bash
dydxprotocold tx clob cancel-order [flags]
```

To batch cancel orders:

```bash
dydxprotocold tx clob batch-cancel [flags]
```

#### Query Commands

To query a CLOB pair:

```bash
dydxprotocold query clob show-clob-pair [id]
```

To query all CLOB pairs:

```bash
dydxprotocold query clob list-clob-pair
```

To query block rate limit configuration:

```bash
dydxprotocold query clob get-block-rate-limit-configuration
```

To query equity tier limit configuration:

```bash
dydxprotocold query clob get-equity-tier-limit-config
```

To query liquidations configuration:

```bash
dydxprotocold query clob get-liquidations-configuration
```

To query a stateful order:

```bash
dydxprotocold query clob query-stateful-order [flags]
```

## Events

The clob module emits events for order placements, cancellations, fills, and liquidations. These events are handled by the indexer to track trading activity and position changes.

## Params

The clob module does not have traditional parameters. Instead, it stores configuration values directly in the state:

1. **BlockRateLimitConfiguration**: Rate limits for orders per N blocks
2. **EquityTierLimitConfiguration**: Order limits based on account equity tiers
3. **LiquidationsConfig**: Configuration for liquidation parameters

These values can be updated through the appropriate messages by authorized accounts.

## Keeper Methods

### State Management

- `GetClobPair(ctx sdk.Context, id ClobPairId) (ClobPair, bool)`: Gets a CLOB pair by ID
- `HasClobPair(ctx sdk.Context, id ClobPairId) bool`: Checks if a CLOB pair exists
- `CreatePerpetualClobPair(ctx sdk.Context, clobPairId uint32, perpetualId uint32, stepSizeBaseQuantums uint64, subticksPerTick uint32) (ClobPair, error)`: Creates a new perpetual CLOB pair
- `UpdateClobPair(ctx sdk.Context, clobPair ClobPair) error`: Updates an existing CLOB pair

### Order Handling

- `PlaceOrder(ctx sdk.Context, msg *MsgPlaceOrder) (OrderSizeOptimisticallyFilledQuantums, OrderStatus, error)`: Places an order on the CLOB
- `CancelOrder(ctx sdk.Context, msg *MsgCancelOrder) error`: Cancels an existing order
- `BatchCancelShortTermOrder(ctx sdk.Context, msg *MsgBatchCancel) (Success, SuccessPerOrder, error)`: Cancels multiple short-term orders in a batch

### Liquidation Processing

- `MaybeDeleverageSubaccount(ctx sdk.Context, subaccountId satypes.SubaccountId, perpetualId uint32) (bool, error)`: Deleverages a subaccount if needed
- `ProcessSingleMatch(ctx sdk.Context, matchWithOrders *MatchWithOrders) (success bool, takerUpdateResult satypes.UpdateResult, makerUpdateResult satypes.UpdateResult, err error)`: Processes a single order match

### Rate Limiting Configuration

- `GetBlockRateLimitConfiguration(ctx sdk.Context) BlockRateLimitConfiguration`: Gets the block rate limit configuration
- `GetEquityTierLimitConfiguration(ctx sdk.Context) EquityTierLimitConfiguration`: Gets the equity tier limit configuration
- `GetLiquidationsConfig(ctx sdk.Context) LiquidationsConfig`: Gets the liquidations configuration

### MEV Protection Methods

- `CalculatePricePremiums(ctx sdk.Context, clobPairId ClobPairId) (pricePremiumPpm int32, err error)`: Calculates price premiums for MEV protection
