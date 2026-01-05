# CLOB Orders Documentation

## Table of Contents

- [CLOB Orders Documentation](#clob-orders-documentation)
  - [Table of Contents](#table-of-contents)
  - [Ecosystem Overview](#ecosystem-overview)
  - [Function Index](#function-index)
  - [Detailed Function Documentation](#detailed-function-documentation)
    - [GetOperations](#getoperations)
      - [Purpose](#purpose)
      - [Side Effects](#side-effects)
      - [Interactions](#interactions)
    - [BatchCancelShortTermOrder](#batchcancelshorttermorder)
      - [Purpose](#purpose-1)
      - [Side Effects](#side-effects-1)
      - [Interactions](#interactions-1)
    - [CancelShortTermOrder](#cancelshorttermorder)
      - [Purpose](#purpose-2)
      - [Side Effects](#side-effects-2)
      - [Interactions](#interactions-2)
    - [PlaceShortTermOrder](#placeshorttermorder)
      - [Purpose](#purpose-3)
      - [Side Effects](#side-effects-3)
      - [Interactions](#interactions-3)
    - [CancelStatefulOrder](#cancelstatefulorder)
      - [Purpose](#purpose-4)
      - [Side Effects](#side-effects-4)
      - [Interactions](#interactions-4)
    - [PlaceStatefulOrder](#placestatefulorder)
      - [Purpose](#purpose-5)
      - [Side Effects](#side-effects-5)
      - [Interactions](#interactions-5)
    - [ReplayPlaceOrder](#replayplaceorder)
      - [Purpose](#purpose-6)
      - [Side Effects](#side-effects-6)
      - [Interactions](#interactions-6)
    - [AddPreexistingStatefulOrder](#addpreexistingstatefulorder)
      - [Purpose](#purpose-7)
      - [Side Effects](#side-effects-7)
      - [Interactions](#interactions-7)
    - [PlaceStatefulOrdersFromLastBlock](#placestatefulordersfromlastblock)
      - [Purpose](#purpose-8)
      - [Side Effects](#side-effects-8)
      - [Interactions](#interactions-8)
    - [PlaceConditionalOrdersTriggeredInLastBlock](#placeconditionalorderstriggeredinlastblock)
      - [Purpose](#purpose-9)
      - [Side Effects](#side-effects-9)
      - [Interactions](#interactions-9)
    - [PerformOrderCancellationStatefulValidation](#performordercancellationstatefulvalidation)
      - [Purpose](#purpose-10)
      - [Side Effects](#side-effects-10)
      - [Interactions](#interactions-10)
    - [getOrderFromStore](#getorderfromstore)
      - [Purpose](#purpose-11)
      - [Side Effects](#side-effects-11)
      - [Interactions](#interactions-11)
    - [validateGoodTilBlock](#validategoodtilblock)
      - [Purpose](#purpose-12)
      - [Side Effects](#side-effects-12)
      - [Interactions](#interactions-12)
    - [PerformStatefulOrderValidation](#performstatefulordervalidation)
      - [Purpose](#purpose-13)
      - [Side Effects](#side-effects-13)
      - [Interactions](#interactions-13)
    - [MustValidateReduceOnlyOrder](#mustvalidatereduceonlyorder)
      - [Purpose](#purpose-14)
      - [Side Effects](#side-effects-14)
      - [Interactions](#interactions-14)
    - [GetSubticksForCollatCheck](#getsubticksforcollatcheck)
      - [Purpose](#purpose-15)
      - [Side Effects](#side-effects-15)
      - [Interactions](#interactions-15)
    - [AddOrderToOrderbookSubaccountUpdatesCheck](#addordertoorderbooksubaccountupdatescheck)
      - [Purpose](#purpose-16)
      - [Side Effects](#side-effects-16)
      - [Interactions](#interactions-16)
    - [GetOraclePriceSubticksRat](#getoraclepricesubticksrat)
      - [Purpose](#purpose-17)
      - [Side Effects](#side-effects-17)
      - [Interactions](#interactions-17)
    - [GetStatePosition](#getstateposition)
      - [Purpose](#purpose-18)
      - [Side Effects](#side-effects-18)
      - [Interactions](#interactions-18)
    - [InitStatefulOrders](#initstatefulorders)
      - [Purpose](#purpose-19)
      - [Side Effects](#side-effects-19)
      - [Interactions](#interactions-19)
    - [sendOffchainMessagesWithTxHash](#sendoffchainmessageswithtxhash)
      - [Purpose](#purpose-20)
      - [Side Effects](#side-effects-20)
      - [Interactions](#interactions-20)
    - [SendOffchainMessages](#sendoffchainmessages)
      - [Purpose](#purpose-21)
      - [Side Effects](#side-effects-21)
      - [Interactions](#interactions-21)

## Ecosystem Overview

The CLOB (Central Limit Order Book) module is responsible for managing order placement, cancellation, and matching on the dYdX v4 chain. It handles both short-term orders (which expire within a few blocks) and stateful orders (long-term and conditional orders that persist in state).

The keeper in this module interacts with several components:

- **MemClob**: An in-memory order book that handles order matching and maintains the current state of the order book.
- **Indexer**: Sends off-chain updates about order placements, cancellations, and fills.
- **Subaccounts**: Manages user balances and positions.
- **Perpetuals**: Handles perpetual contract information.
- **Block Time Keeper**: Tracks block times for order expiration validation.

Orders in the CLOB module can be categorized as:

1. **Short-Term Orders**: Valid for a limited number of blocks, stored only in memory.
2. **Long-Term Orders**: Persistent orders with longer expiration times, stored in state.
3. **Conditional Orders**: Orders that are triggered when certain conditions are met, stored in state until triggered.

## Function Index

| Function Name | Description |
|---------------|-------------|
| [GetOperations](#getoperations) | Retrieves the current operations queue from the memclob |
| [BatchCancelShortTermOrder](#batchcancelshorttermorder) | Cancels a batch of short-term orders |
| [CancelShortTermOrder](#cancelshorttermorder) | Cancels a single short-term order |
| [PlaceShortTermOrder](#placeshorttermorder) | Places a short-term order on the orderbook |
| [CancelStatefulOrder](#cancelstatefulorder) | Cancels a stateful order |
| [PlaceStatefulOrder](#placestatefulorder) | Places a stateful order in state |
| [ReplayPlaceOrder](#replayplaceorder) | Replays an order placement for operations replay |
| [AddPreexistingStatefulOrder](#addpreexistingstatefulorder) | Adds a pre-existing stateful order to the memclob |
| [PlaceStatefulOrdersFromLastBlock](#placestatefulordersfromlastblock) | Places stateful orders from the last block onto the memclob |
| [PlaceConditionalOrdersTriggeredInLastBlock](#placeconditionalorderstriggeredinlastblock) | Places conditional orders triggered in the last block |
| [PerformOrderCancellationStatefulValidation](#performordercancellationstatefulvalidation) | Performs stateful validation for order cancellations |
| [getOrderFromStore](#getorderfromstore) | Retrieves an order from the appropriate store |
| [validateGoodTilBlock](#validategoodtilblock) | Validates the good-til-block parameter for short-term orders |
| [PerformStatefulOrderValidation](#performstatefulordervalidation) | Performs stateful validation for order placements |
| [MustValidateReduceOnlyOrder](#mustvalidatereduceonlyorder) | Validates reduce-only orders during matching |
| [GetSubticksForCollatCheck](#getsubticksforcollatcheck) | Gets subticks for collateralization checks |
| [AddOrderToOrderbookSubaccountUpdatesCheck](#addordertoorderbooksubaccountupdatescheck) | Checks subaccount updates for order placement |
| [GetOraclePriceSubticksRat](#getoraclepricesubticksrat) | Gets oracle price in subticks |
| [GetStatePosition](#getstateposition) | Gets the current position size for a subaccount |
| [InitStatefulOrders](#initstatefulorders) | Initializes stateful orders during app startup |
| [sendOffchainMessagesWithTxHash](#sendoffchainmessageswithtxhash) | Sends off-chain messages with transaction hash |
| [SendOffchainMessages](#sendoffchainmessages) | Sends off-chain messages |

## Detailed Function Documentation

### GetOperations

```go
func (k Keeper) GetOperations(ctx sdk.Context) *types.MsgProposedOperations
```

#### Purpose

Retrieves the current operations queue from the memclob and wraps it in a `MsgProposedOperations`.

#### Side Effects

None (pure function)

#### Interactions

- Calls `k.MemClob.GetOperationsRaw(ctx)` to get the raw operations queue
- Validates the resulting `MsgProposedOperations` using `ValidateBasic()`
- Performs stateful validation using `ValidateAndTransformRawOperations`

---

### BatchCancelShortTermOrder

```go
func (k Keeper) BatchCancelShortTermOrder(
    ctx sdk.Context,
    msg *types.MsgBatchCancel,
) (success []uint32, failure []uint32, err error)
```

#### Purpose

Removes a batch of short-term orders from all order-related data structures in the memclob and adds cancels to the desired `goodTilBlock` in the memclob.

#### Side Effects

- Cancels multiple short-term orders in the memclob
- Updates memclob with cancel information for each order
- Sends off-chain updates for each cancellation

#### Interactions

- Calls `CancelShortTermOrder` for each order in the batch
- Uses `lib.AssertCheckTxMode(ctx)` to ensure it's only called during CheckTx
- Sends off-chain updates via `sendOffchainMessagesWithTxHash`

---

### CancelShortTermOrder

```go
func (k Keeper) CancelShortTermOrder(
    ctx sdk.Context,
    msgCancelOrder *types.MsgCancelOrder,
) error
```

#### Purpose

Removes a Short-Term order by `OrderId` (if it exists) from all order-related data structures in the memclob and adds (or updates) a cancel to the desired `goodTilBlock` in the memclob.

#### Side Effects

- Removes order from memclob
- Updates memclob with cancel information
- Sends off-chain updates

#### Interactions

- Calls `PerformOrderCancellationStatefulValidation` for validation
- Calls `k.MemClob.CancelOrder` to perform the actual cancellation in the memclob
- Sends off-chain updates via `sendOffchainMessagesWithTxHash`

---

### PlaceShortTermOrder

```go
func (k Keeper) PlaceShortTermOrder(
    ctx sdk.Context,
    msg *types.MsgPlaceOrder,
) (
    orderSizeOptimisticallyFilledFromMatchingQuantums satypes.BaseQuantums,
    orderStatus types.OrderStatus,
    err error,
)
```

#### Purpose

Places a short-term order on the corresponding orderbook and performs matching if placing the order causes an overlap.

#### Side Effects

- Places order on memclob
- Performs matching if applicable
- Sends off-chain updates

#### Interactions

- Calls `PerformStatefulOrderValidation` for validation
- Calls `k.MemClob.PlaceOrder` to place the order on the memclob
- Sends off-chain updates via `sendOffchainMessagesWithTxHash`

---

### CancelStatefulOrder

```go
func (k Keeper) CancelStatefulOrder(
    ctx sdk.Context,
    msg *types.MsgCancelOrder,
) (err error)
```

#### Purpose

Performs stateful order cancellation validation and removes the stateful order from state and the memstore.

#### Side Effects

- Removes stateful order from state (during DeliverTx)
- Adds uncommitted stateful order cancellation to memstore (during CheckTx)

#### Interactions

- Calls `PerformOrderCancellationStatefulValidation` for validation
- During DeliverTx: Calls `MustRemoveStatefulOrder` to remove from state
- During CheckTx: Calls `MustAddUncommittedStatefulOrderCancellation` to add to memstore

---

### PlaceStatefulOrder

```go
func (k Keeper) PlaceStatefulOrder(
    ctx sdk.Context,
    msg *types.MsgPlaceOrder,
    isInternalOrder bool,
) (err error)
```

#### Purpose

Performs order validation, equity tier limit check, a collateralization check, and writes the order to state and the memstore. The order will not be placed on the orderbook.

#### Side Effects

- Writes stateful order to state (during DeliverTx)
- Adds uncommitted stateful order placement to memstore (during CheckTx)
- Performs collateralization check

#### Interactions

- Calls `PerformStatefulOrderValidation` for validation
- During DeliverTx: Calls `SetLongTermOrderPlacement` or `SetTWAPOrderPlacement` to write to state
- During CheckTx: Calls `MustAddUncommittedStatefulOrderPlacement` to add to memstore
- Calls `ValidateSubaccountEquityTierLimitForStatefulOrder` for equity tier validation
- Calls `AddOrderToOrderbookSubaccountUpdatesCheck` for collateralization check

---

### ReplayPlaceOrder

```go
func (k Keeper) ReplayPlaceOrder(
    ctx sdk.Context,
    msg *types.MsgPlaceOrder,
) (
    orderSizeOptimisticallyFilledFromMatchingQuantums satypes.BaseQuantums,
    orderStatus types.OrderStatus,
    offchainUpdates *types.OffchainUpdates,
    err error,
)
```

#### Purpose

Returns the result of calling `PlaceOrder` on the memclob. Used in the `ReplayOperations` flow to replay Short-Term and newly-played stateful orders back onto the memclob.

#### Side Effects

- Places order on memclob
- Performs matching if applicable

#### Interactions

- Calls `PerformStatefulOrderValidation` for validation
- Calls `k.MemClob.PlaceOrder` to place the order on the memclob

---

### AddPreexistingStatefulOrder

```go
func (k Keeper) AddPreexistingStatefulOrder(
    ctx sdk.Context,
    order *types.Order,
    memclob types.MemClob,
) (
    orderSizeOptimisticallyFilledFromMatchingQuantums satypes.BaseQuantums,
    orderStatus types.OrderStatus,
    offchainUpdates *types.OffchainUpdates,
    err error,
)
```

#### Purpose

Performs stateful validation on an order and adds it to the specified memclob. Does not add the order into state, assuming it's preexisting.

#### Side Effects

- Places order on memclob
- Performs matching if applicable

#### Interactions

- Calls `PerformStatefulOrderValidation` for validation (without checking existing order in state)
- Calls `memclob.PlaceOrder` to place the order on the memclob

---

### PlaceStatefulOrdersFromLastBlock

```go
func (k Keeper) PlaceStatefulOrdersFromLastBlock(
    ctx sdk.Context,
    placedStatefulOrderIds []types.OrderId,
    existingOffchainUpdates *types.OffchainUpdates,
    postOnlyFilter bool,
) (
    offchainUpdates *types.OffchainUpdates,
)
```

#### Purpose

Validates and places stateful orders from the last block onto the memclob. Used in `PrepareCheckState` to place newly placed long term orders and in `PlaceConditionalOrdersTriggeredInLastBlock`.

#### Side Effects

- Places orders on memclob
- Sends off-chain updates

#### Interactions

- Calls `GetLongTermOrderPlacement` to retrieve orders from state
- Calls `AddPreexistingStatefulOrder` to place each order on the memclob
- Sends off-chain updates via `existingOffchainUpdates`

---

### PlaceConditionalOrdersTriggeredInLastBlock

```go
func (k Keeper) PlaceConditionalOrdersTriggeredInLastBlock(
    ctx sdk.Context,
    conditionalOrderIdsTriggeredInLastBlock []types.OrderId,
    existingOffchainUpdates *types.OffchainUpdates,
    postOnlyFilter bool,
) (
    offchainUpdates *types.OffchainUpdates,
)
```

#### Purpose

Takes a list of conditional order IDs that were triggered in the last block, verifies they are in triggered state, and places the orders on the memclob.

#### Side Effects

- Places orders on memclob
- Sends off-chain updates

#### Interactions

- Calls `IsConditionalOrderTriggered` to verify orders are in triggered state
- Calls `PlaceStatefulOrdersFromLastBlock` to place the orders

---

### PerformOrderCancellationStatefulValidation

```go
func (k Keeper) PerformOrderCancellationStatefulValidation(
    ctx sdk.Context,
    msgCancelOrder *types.MsgCancelOrder,
    blockHeight uint32,
) error
```

#### Purpose

Performs stateful validation on an order cancellation, checking both stateful and short-term order cancellations.

#### Side Effects

None (pure validation function)

#### Interactions

- For stateful orders:
  - Checks uncommitted stateful order cancellations
  - Retrieves existing stateful orders from state
  - Validates GTBT constraints
- For short-term orders:
  - Calls `validateGoodTilBlock` for validation

---

### getOrderFromStore

```go
func (k Keeper) getOrderFromStore(ctx sdk.Context, orderId types.OrderId) (types.Order, bool)
```

#### Purpose

Retrieves an order from the appropriate store (TWAP or Long-Term) based on the order ID type.

#### Side Effects

None (pure function)

#### Interactions

- For TWAP orders: Calls `GetTwapOrderPlacement`
- For Long-Term orders: Calls `GetLongTermOrderPlacement`

---

### validateGoodTilBlock

```go
func (k Keeper) validateGoodTilBlock(goodTilBlock uint32, blockHeight uint32) error
```

#### Purpose

Validates that the good til block (GTB) is within valid bounds for short-term orders.

#### Side Effects

None (pure validation function)

#### Interactions

- Checks that GTB >= blockHeight
- Checks that GTB <= blockHeight + ShortBlockWindow

---

### PerformStatefulOrderValidation

```go
func (k Keeper) PerformStatefulOrderValidation(
    ctx sdk.Context,
    order *types.Order,
    blockHeight uint32,
    isPreexistingStatefulOrder bool,
) error
```

#### Purpose

Performs stateful validation on an order, covering CLOB pair validation, subtick/quantum validation, and order-specific validations for short-term and stateful orders.

#### Side Effects

None (pure validation function)

#### Interactions

- Calls `GetClobPair` to retrieve CLOB pair information
- For short-term orders: Calls `validateGoodTilBlock`
- For stateful orders:
  - Validates GTBT constraints
  - Checks for uncommitted cancellations
  - Checks for existing orders in uncommitted and committed state

---

### MustValidateReduceOnlyOrder

```go
func (k Keeper) MustValidateReduceOnlyOrder(
    ctx sdk.Context,
    order types.MatchableOrder,
    matchedAmount uint64,
) error
```

#### Purpose

Validates that a reduce-only order is valid with respect to the current position size, ensuring it's on the opposite side of the existing position and doesn't change the position side.

#### Side Effects

None (pure validation function)

#### Interactions

- Calls `GetStatePosition` to get current position size
- Performs validation checks on order side and matched amount

---

### GetSubticksForCollatCheck

```go
func (k Keeper) GetSubticksForCollatCheck(ctx sdk.Context, order types.Order) (types.Subticks, error)
```

#### Purpose

Returns the subticks for the given order. For TWAP market orders, returns the current oracle price as subticks; otherwise, returns the order's subticks.

#### Side Effects

None (pure function)

#### Interactions

- For TWAP market orders:
  - Calls `GetClobPair` to retrieve CLOB pair
  - Calls `GetOraclePriceSubticksRat` to get oracle price
- For other orders: Returns order's subticks directly

---

### AddOrderToOrderbookSubaccountUpdatesCheck

```go
func (k Keeper) AddOrderToOrderbookSubaccountUpdatesCheck(
    ctx sdk.Context,
    subaccountId satypes.SubaccountId,
    order types.PendingOpenOrder,
) satypes.UpdateResult
```

#### Purpose

Performs checks on the subaccount updates that will occur for orders to determine whether or not they may be added to the orderbook.

#### Side Effects

None (pure function)

#### Interactions

- Calls `GetClobPair` to retrieve CLOB pair
- Calls `feeTiersKeeper.GetPerpetualFeePpm` to get fee rates
- Calls `subaccountsKeeper.CanUpdateSubaccounts` to check if subaccount can be updated

---

### GetOraclePriceSubticksRat

```go
func (k Keeper) GetOraclePriceSubticksRat(ctx sdk.Context, clobPair types.ClobPair) *big.Rat
```

#### Purpose

Returns the oracle price in subticks for the given `ClobPair`.

#### Side Effects

None (pure function)

#### Interactions

- Calls `perpetualsKeeper.GetPerpetualAndMarketPrice` to get perpetual and market price
- Calls `types.PriceToSubticks` to convert price to subticks

---

### GetStatePosition

```go
func (k Keeper) GetStatePosition(ctx sdk.Context, subaccountId satypes.SubaccountId, clobPairId types.ClobPairId,
) (
    positionSizeQuantums *big.Int,
)
```

#### Purpose

Returns the current size of a subaccount's position for the specified `clobPairId`.

#### Side Effects

None (pure function)

#### Interactions

- Calls `GetClobPair` to retrieve CLOB pair
- Calls `subaccountsKeeper.GetSubaccount` to get subaccount information
- Retrieves position from subaccount object

---

### InitStatefulOrders

```go
func (k Keeper) InitStatefulOrders(
    ctx sdk.Context,
) 
```

#### Purpose

Places all stateful orders in state on the memclob during app initialization, ordered by time priority.

#### Side Effects

- Places orders on memclob
- Sends off-chain updates

#### Interactions

- Calls `GetAllPlacedStatefulOrders` to retrieve all stateful orders
- For each order:
  - Calls `k.MemClob.PlaceOrder` to place on memclob
  - Sends off-chain updates via `SendOffchainMessages`

---

### sendOffchainMessagesWithTxHash

```go
func (k Keeper) sendOffchainMessagesWithTxHash(
    offchainUpdates *types.OffchainUpdates,
    txHash []byte,
    metric string,
)
```

#### Purpose

Sends all the `Message` in the offchainUpdates passed in along with an additional header for the transaction hash.

#### Side Effects

- Sends off-chain messages

#### Interactions

- Calls `SendOffchainMessages` with transaction hash header

---

### SendOffchainMessages

```go
func (k Keeper) SendOffchainMessages(
    offchainUpdates *types.OffchainUpdates,
    additionalHeaders []msgsender.MessageHeader,
    metric string,
)
```

#### Purpose

Sends all the `Message` in the offchainUpdates passed in along with any additional headers.

#### Side Effects

- Sends off-chain messages

#### Interactions

- Calls `GetIndexerEventManager().SendOffchainData` to send each message
