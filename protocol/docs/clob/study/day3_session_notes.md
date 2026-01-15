# Day 3 Session Notes - Order Lifecycle

**Date**: January 14, 2026  
**Focus**: Order placement, cancellation, and order type mechanics (short-term, stateful, TWAP, conditional)

---

## 🎯 Session Goals

1. ✅ Understand the complete order placement flow from MsgServer to MemClob
2. ✅ Study order cancellation mechanics
3. ✅ Deep dive into TWAP order generation and execution
4. ✅ Understand conditional order triggering logic
5. ✅ Document key differences between order types

---

## 📚 Study Notes

### 1. Order Placement Entry Point (`keeper/msg_server_place_order.go`)

#### A. MsgServer Entry Point

**Function**: `PlaceOrder()` (Lines 22-33)

```go
func (k msgServer) PlaceOrder(goCtx context.Context, msg *types.MsgPlaceOrder) (
    resp *types.MsgPlaceOrderResponse,
    err error,
) {
    ctx := lib.UnwrapSDKContext(goCtx, types.ModuleName)
    
    if err := k.Keeper.HandleMsgPlaceOrder(ctx, msg, false); err != nil {
        return nil, err
    }
    
    return &types.MsgPlaceOrderResponse{}, nil
}
```

**Key Insight**: This is the entry point for **stateful orders only**. Short-term orders are filtered by the mempool in the CometBFT fork and never reach this handler!

#### B. HandleMsgPlaceOrder - The Core Handler

**Function**: `HandleMsgPlaceOrder()` (Lines 40-160)

**Flow**:
```
1. Assert DeliverTx mode (lib.AssertDeliverTxMode)
2. Attach logging tags (module, proposer, block height, etc.)
3. Setup metrics and error handling (defer function)
4. Validate order is stateful (order.MustBeStatefulOrder)
5. Check for conflicts:
   ├─ Already cancelled in this block? → Error
   └─ Already removed in this block? → Error
6. Place order (k.PlaceStatefulOrder)
7. Emit indexer events:
   ├─ Conditional order → NewConditionalOrderPlacementEvent
   ├─ TWAP order → NewTwapOrderPlacementEvent
   └─ Long-term order → NewLongTermOrderPlacementEvent
```

#### C. Conflict Detection (Lines 88-105)

**Critical Safety Check**:
```go
// Check if order was already cancelled in this block
cancelledOrderIds := lib.UniqueSliceToSet(k.GetDeliveredCancelledOrderIds(ctx))
if _, found := cancelledOrderIds[order.GetOrderId()]; found {
    return ErrStatefulOrderPreviouslyCancelled
}

// Check if order was already removed in this block
removedOrderIds := lib.UniqueSliceToSet(processProposerMatchesEvents.RemovedStatefulOrderIds)
if _, found := removedOrderIds[order.GetOrderId()]; found {
    return ErrStatefulOrderPreviouslyRemoved
}
```

**Why this matters**:
- Prevents placing an order that was cancelled/removed in the same block
- Ensures consistency between operations within a single block
- Protects against race conditions in block processing

#### D. Indexer Event Differentiation (Lines 116-157)

**Three different event types**:
1. **Conditional orders**: `NewConditionalOrderPlacementEvent()` + `AddDeliveredConditionalOrderId()`
2. **TWAP orders**: `NewTwapOrderPlacementEvent()` (no delivered ID tracking)
3. **Long-term orders**: `NewLongTermOrderPlacementEvent()` + `AddDeliveredLongTermOrderId()`

**Why track delivered IDs?**
- Conditional and long-term orders need to be tracked for conflict detection
- TWAP orders are parent orders that spawn suborders, different lifecycle

---

### 2. Order Cancellation (`keeper/msg_server_cancel_orders.go`)

#### A. CancelOrder Entry Point

**Function**: `CancelOrder()` (Lines 20-31)

Simple wrapper that calls `HandleMsgCancelOrder()`.

#### B. HandleMsgCancelOrder - The Core Handler

**Function**: `HandleMsgCancelOrder()` (Lines 37-119)

**Flow**:
```
1. Assert DeliverTx mode
2. Attach logging tags
3. Setup metrics and error handling (defer function)
4. Validate order is stateful (msg.OrderId.MustBeStatefulOrder)
5. Cancel the order (k.CancelStatefulOrder)
6. Update memstore (k.AddDeliveredCancelledOrderId)
7. Emit indexer event (NewStatefulOrderRemovalEvent)
```

#### C. Graceful Error Handling (Lines 60-89)

**Special case**: Order already removed by proposer operations

```go
if errors.Is(err, types.ErrStatefulOrderDoesNotExist) {
    processProposerMatchesEvents := k.GetProcessProposerMatchesEvents(ctx)
    removedOrderIds := lib.UniqueSliceToSet(processProposerMatchesEvents.RemovedStatefulOrderIds)
    
    if _, found := removedOrderIds[msg.GetOrderId()]; found {
        // This is expected! Order was removed due to matching errors.
        // Emit metric and return gracefully.
        telemetry.IncrCounterWithLabels(...)
        err = ErrStatefulOrderCancellationFailedForAlreadyRemovedOrder
        log.InfoLog(ctx, "Cancel Order Expected Error", log.Error, err)
        return
    }
}
```

**Why this is needed**:
- Order removal operations can be included in the same block as cancellation
- By the time cancellation is processed, order might already be removed
- This is a **race condition** that's handled gracefully
- TODO(CLOB-778): Prevent invalid MsgCancelOrder from being included

#### D. Removal Reason

**Always**: `ORDER_REMOVAL_REASON_USER_CANCELED`

This distinguishes user cancellations from other removal reasons (expiration, undercollateralized, etc.)

---

### 3. TWAP Orders (`keeper/twap_order_state.go`)

#### A. TWAP Order Structure

**Type**: `TwapOrderPlacement` (Lines 50-54)

```go
type TwapOrderPlacement struct {
    Order             types.Order  // Parent TWAP order
    RemainingLegs     uint32       // How many suborders left to place
    RemainingQuantums uint64       // How much size left to execute
}
```

**Constants**:
- `TWAP_SUBORDER_GOOD_TIL_BLOCK_TIME_OFFSET = 3` seconds
- `TWAP_MAX_SUBORDER_CATCHUP_MULTIPLE = 3x` original quantums per leg

#### B. TWAP Placement (Lines 41-62)

**Function**: `SetTWAPOrderPlacement()`

```go
func (k Keeper) SetTWAPOrderPlacement(ctx sdk.Context, order types.Order, blockHeight uint32) {
    total_legs := order.GetTotalLegsTWAPOrder()
    
    twapOrderPlacement := types.TwapOrderPlacement{
        Order:             order,
        RemainingLegs:     total_legs,
        RemainingQuantums: order.Quantums,
    }
    
    // Increment stateful order count
    k.CheckAndIncrementStatefulOrderCount(ctx, order.OrderId)
    
    // Write to state
    store.Set(orderKey, twapOrderPlacementBytes)
    
    // Add first suborder to trigger store with offset 0 (immediate)
    k.AddSuborderToTriggerStore(ctx, k.twapToSuborderId(order.OrderId), 0)
}
```

**Key insight**: First suborder is triggered immediately (offset 0)!

#### C. Trigger Store Mechanism

**Function**: `AddSuborderToTriggerStore()` (Lines 117-130)

```go
func (k Keeper) AddSuborderToTriggerStore(
    ctx sdk.Context,
    suborderId types.OrderId,
    triggerOffset int64,
) []byte {
    triggerStore := k.GetTWAPTriggerOrderPlacementStore(ctx)
    triggerTime := ctx.BlockTime().Unix() + triggerOffset
    
    // Key format: [timestamp][suborderId]
    triggerKey := types.GetTWAPTriggerKey(triggerTime, suborderId)
    
    triggerStore.Set(triggerKey, []byte{})  // Value is empty!
    return triggerKey
}
```

**Why this design?**:
- Keys are sorted by timestamp → easy to iterate triggered orders
- Value is empty because the key contains all necessary info
- Trigger offset allows scheduling future suborders

#### D. Suborder Generation and Placement (Lines 140-238)

**Function**: `GenerateAndPlaceTriggeredTwapSuborders()`

**Called in**: EndBlocker

**Flow**:
```
1. Iterate trigger store (sorted by timestamp)
2. For each triggered suborder (triggerTime <= blockTime):
   ├─ Get parent TWAP order placement
   ├─ If parent not found → parentTwapCancelled
   ├─ Generate suborder (GenerateSuborder)
   ├─ If generation fails → parentTwapCompleted
   └─ Otherwise → createSuborder
3. Process operations:
   ├─ parentTwapCancelled: Delete trigger key (no-op)
   ├─ parentTwapCompleted: Delete TWAP placement
   └─ createSuborder:
       ├─ Decrement remaining legs
       ├─ Schedule next suborder (triggerOffset = interval)
       ├─ Place suborder (safeHandleMsgPlaceOrder)
       └─ On error: Delete TWAP + emit removal event
```

**Operation Types**:
```go
const (
    parentTwapCompleted twapOperationType = iota
    parentTwapCancelled
    createSuborder
)
```

#### E. Suborder Price Calculation (Lines 309-337)

**Function**: `calculateSuborderSubticks()`

**Logic**:
```go
// If parent TWAP has explicit price, use it
if twapOrderPlacement.Order.Subticks != 0 {
    return twapOrderPlacement.Order.Subticks
}

// Otherwise, use oracle price with tolerance adjustment
oraclePriceSubticksRat := k.GetOraclePriceSubticksRat(ctx, clobPair)

priceTolerancePpm := int32(twapOrder.TwapParameters.PriceTolerance)
if twapOrder.Side == types.Order_SIDE_SELL {
    // For sell orders, adjust price DOWN
    priceTolerancePpm = -priceTolerancePpm
}
adjustment := int32(1_000_000) + priceTolerancePpm

adjustedPrice := lib.BigRatMulPpm(oraclePriceSubticksRat, uint32(adjustment))
roundedSubticks := lib.BigRatRoundToMultiple(adjustedPrice, SubticksPerTick, ...)

return roundedSubticks.Uint64()
```

**Examples**:
- Buy order with 5% tolerance → oracle price * 1.05 (willing to pay more)
- Sell order with 5% tolerance → oracle price * 0.95 (willing to accept less)

#### F. Suborder Quantity Calculation (Lines 339-373)

**Function**: `calculateSuborderQuantums()`

**Logic**:
```go
totalLegs := twapOrderPlacement.Order.GetTotalLegsTWAPOrder()
originalQuantums := twapOrderPlacement.Order.Quantums
originalQuantumsPerLeg := BigDivCeil(originalQuantums, totalLegs)

// Calculate remaining quantums per leg
remainingQuantums := twapOrderPlacement.RemainingQuantums
remainingLegs := twapOrderPlacement.RemainingLegs
remainingQuantumsPerLeg := BigDivCeil(remainingQuantums, remainingLegs)

// Cap at 3x original size (catchup mechanism)
maxSuborderSize := originalQuantumsPerLeg * 3

suborderQuantums := BigMin(remainingQuantumsPerLeg, maxSuborderSize)

// Round down to StepBaseQuantums
suborderQuantumsRounded := (suborderQuantums / StepBaseQuantums) * StepBaseQuantums
return suborderQuantumsRounded
```

**Why 3x catchup?**:
- If early suborders don't fill completely, remaining legs get larger
- Capped at 3x to prevent excessive size
- Helps complete the TWAP even if some suborders partially fill

#### G. Safe Placement with Panic Recovery (Lines 428-451)

**Function**: `safeHandleMsgPlaceOrder()`

```go
func (k Keeper) safeHandleMsgPlaceOrder(
    ctx sdk.Context,
    msg *types.MsgPlaceOrder,
    isStateful bool,
) (err error) {
    if err = abci.RunCached(ctx, func(ctx sdk.Context) error {
        return k.HandleMsgPlaceOrder(ctx, msg, isStateful)
    }); err != nil {
        k.Logger(ctx).Error(
            "failed to handle TWAP suborder placement via HandleMsgPlaceOrder (panic recovered or error)",
            "cause", err,
            "orderId", msg.GetOrder().OrderId,
        )
        return err
    }
    return nil
}
```

**Why safe?**:
- Called in EndBlocker where panics would halt the chain
- `abci.RunCached()` recovers from panics and converts to errors
- Allows graceful handling of suborder placement failures

---

### 4. Conditional Orders (`keeper/untriggered_conditional_orders.go`)

#### A. UntriggeredConditionalOrders Structure (Lines 26-36)

**In-memory data structure** (not persisted directly):

```go
type UntriggeredConditionalOrders struct {
    // Trigger when oracle price <= trigger price
    // (Take profit BUY, Stop loss SELL)
    OrdersToTriggerWhenOraclePriceLTETriggerPrice []types.Order
    
    // Trigger when oracle price >= trigger price
    // (Take profit SELL, Stop loss BUY)
    OrdersToTriggerWhenOraclePriceGTETriggerPrice []types.Order
}
```

**Why two arrays?**:
- Efficient polling based on price direction
- Take profit BUY: Trigger when price drops (buy low)
- Take profit SELL: Trigger when price rises (sell high)
- Stop loss BUY: Trigger when price rises (limit losses on short)
- Stop loss SELL: Trigger when price drops (limit losses on long)

#### B. Adding Untriggered Orders (Lines 55-87)

**Function**: `AddUntriggeredConditionalOrder()`

**Logic**:
```go
if order.IsTakeProfitOrder() {
    if order.IsBuy() {
        // Take profit BUY → trigger when price <= trigger price
        OrdersToTriggerWhenOraclePriceLTETriggerPrice.append(order)
    } else {
        // Take profit SELL → trigger when price >= trigger price
        OrdersToTriggerWhenOraclePriceGTETriggerPrice.append(order)
    }
}

if order.IsStopLossOrder() {
    if order.IsBuy() {
        // Stop loss BUY → trigger when price >= trigger price
        OrdersToTriggerWhenOraclePriceGTETriggerPrice.append(order)
    } else {
        // Stop loss SELL → trigger when price <= trigger price
        OrdersToTriggerWhenOraclePriceLTETriggerPrice.append(order)
    }
}
```

#### C. Polling Triggered Orders (Lines 133-176)

**Function**: `PollTriggeredConditionalOrders()`

**Pessimistic rounding**:
```go
// Round UP for LTE conditions (conservative)
pessimisticLTESubticks := lib.BigRatRound(oraclePriceSubticksRat, true)

// Round DOWN for GTE conditions (conservative)
pessimisticGTESubticks := lib.BigRatRound(oraclePriceSubticksRat, false)
```

**Why pessimistic?**:
- We only trigger when we're **sure** the condition is met
- Prevents premature triggering due to rounding errors
- Conservative approach protects users

**Polling logic**:
```go
for _, order := range OrdersToTriggerWhenOraclePriceLTETriggerPrice {
    if order.CanTrigger(pessimisticLTESubticks) {
        triggeredOrderIds.append(order.OrderId)
    } else {
        // Keep in untriggered list
        newOrdersToTriggerWhenOraclePriceLTETriggerPrice.append(order)
    }
}
```

#### D. Triggering in EndBlocker (Lines 198-273)

**Function**: `MaybeTriggerConditionalOrders()`

**Called in**: EndBlocker

**Flow**:
```
1. Organize all untriggered conditional orders by ClobPairId
2. Sort ClobPairIds (deterministic state writes)
3. For each ClobPairId:
   ├─ Get ClobPair and PerpetualId
   ├─ Get oracle price
   ├─ Trigger with oracle price
   ├─ Get clamped trade prices (min/max)
   ├─ Trigger with min trade price
   ├─ Trigger with max trade price
   └─ Emit metrics (num untriggered orders)
4. Return all triggered order IDs
```

**Three price sources**:
1. **Oracle price**: Primary trigger source
2. **Min trade price**: Clamped to oracle ± allowed range
3. **Max trade price**: Clamped to oracle ± allowed range

**Why three prices?**:
- Oracle price might not reflect actual market conditions
- Trade prices show real execution prices
- Clamping prevents manipulation via extreme trade prices

#### E. Price Clamping for Triggering (Lines 322-375)

**Function**: `getClampedTradePricesForTriggering()`

**Logic**:
```go
// Get the allowed price range
maxAllowedRange := oraclePrice * (MinPriceChangePpm / 1_000_000) * ConditionalOrderTriggerMultiplier

upperBound := oraclePrice + maxAllowedRange
lowerBound := oraclePrice - maxAllowedRange

// Clamp trade prices to bounds
clampedMinTradePrice := Clamp(minTradePriceSubticks, lowerBound, upperBound)
clampedMaxTradePrice := Clamp(maxTradePriceSubticks, lowerBound, upperBound)
```

**Why clamp?**:
- Prevents manipulation via extreme trade prices
- Ensures triggers are based on reasonable prices
- Protects users from unfair triggering

#### F. State Transition on Trigger (Lines 275-320)

**Function**: `TriggerOrdersWithPrice()`

**Flow**:
```
1. Poll triggered orders from UntriggeredConditionalOrders
2. For each triggered order:
   ├─ Move from untriggered → triggered state (MustTriggerConditionalOrder)
   ├─ Emit indexer event (NewConditionalOrderTriggeredEvent)
   └─ Emit metrics
3. Return triggered order IDs
```

**State transition**:
```
Untriggered State (UntriggeredConditionalOrderKeyPrefix)
    ↓
MustTriggerConditionalOrder()
    ↓
Triggered State (TriggeredConditionalOrderKeyPrefix)
    ↓
PrepareCheckState: PlaceConditionalOrdersTriggeredInLastBlock()
    ↓
On Orderbook (MemClob)
```

---

## 🔑 Critical Insights

### 1. Stateful-Only MsgServer

**Key fact**: `msg_server_place_order.go` and `msg_server_cancel_orders.go` **only handle stateful orders**.

Short-term orders:
- Filtered by mempool in CometBFT fork
- Never reach these handlers
- Placed directly via gRPC to MemClob

### 2. Conflict Detection is Critical

**Both placement and cancellation check**:
- Was this order already cancelled in this block?
- Was this order already removed in this block?

**Why?**:
- Multiple operations can affect the same order in one block
- Prevents inconsistent state
- Gracefully handles race conditions

### 3. TWAP is a Scheduling System

**TWAP orders are NOT on the orderbook**:
- Parent TWAP order stored in state
- Suborders scheduled via trigger store
- EndBlocker generates and places suborders
- Each suborder is a regular stateful order

**Trigger store key format**: `[timestamp][suborderId]`
- Sorted by timestamp for efficient iteration
- Only triggered suborders (timestamp <= blockTime) are processed

### 4. Conditional Orders Have Two Lives

**Lifecycle**:
```
Placement → Untriggered State (not on orderbook)
    ↓
EndBlocker: Price condition met
    ↓
Triggered State (still not on orderbook)
    ↓
PrepareCheckState: Place on orderbook
    ↓
On Orderbook (can match)
```

**Why two states?**:
- Untriggered: Waiting for price condition
- Triggered: Condition met, waiting for next block to place
- Separation ensures clean state transitions

### 5. Pessimistic Rounding Protects Users

**Conditional order triggering**:
- LTE conditions: Round oracle price UP
- GTE conditions: Round oracle price DOWN

**Effect**:
- Only trigger when we're **absolutely sure**
- Prevents premature triggering
- Conservative approach favors users

### 6. Safe Execution in EndBlocker

**Both TWAP and conditional orders use safe execution**:
- `safeHandleMsgPlaceOrder()` with panic recovery
- `abci.RunCached()` to isolate state changes
- Errors logged but don't halt the chain

**Why?**:
- EndBlocker panics would halt the entire chain
- Graceful degradation is critical
- Failed suborders don't break the system

### 7. Three Price Sources for Triggering

**Conditional orders can trigger on**:
1. Oracle price (primary)
2. Min trade price (clamped)
3. Max trade price (clamped)

**Why three?**:
- Oracle might lag real market
- Trade prices show actual execution
- Clamping prevents manipulation

---

## 📊 Flow Diagrams

### Stateful Order Placement Flow

```
User → MsgPlaceOrder (DeliverTx)
  ↓
msgServer.PlaceOrder()
  ↓
HandleMsgPlaceOrder()
  ├─ Assert DeliverTx mode
  ├─ Attach logging tags
  ├─ Validate order is stateful
  ├─ Check conflicts:
  │   ├─ Already cancelled? → Error
  │   └─ Already removed? → Error
  ├─ PlaceStatefulOrder() → (from Day 2)
  │   ├─ Validate
  │   ├─ Collateralization check
  │   └─ Write to state
  └─ Emit indexer event:
      ├─ Conditional → NewConditionalOrderPlacementEvent
      ├─ TWAP → NewTwapOrderPlacementEvent
      └─ Long-term → NewLongTermOrderPlacementEvent
```

### Stateful Order Cancellation Flow

```
User → MsgCancelOrder (DeliverTx)
  ↓
msgServer.CancelOrder()
  ↓
HandleMsgCancelOrder()
  ├─ Assert DeliverTx mode
  ├─ Attach logging tags
  ├─ Validate order is stateful
  ├─ CancelStatefulOrder()
  │   ├─ Remove from state
  │   └─ Remove from memstore
  ├─ AddDeliveredCancelledOrderId()
  └─ Emit indexer event:
      └─ NewStatefulOrderRemovalEvent(USER_CANCELED)
  
Error Handling:
  └─ If order already removed by proposer operations:
      ├─ Check removedOrderIds
      ├─ Emit metric
      └─ Return gracefully (expected error)
```

### TWAP Order Complete Lifecycle

```
User → MsgPlaceOrder (TWAP)
  ↓
SetTWAPOrderPlacement()
  ├─ Create TwapOrderPlacement:
  │   ├─ RemainingLegs = total_legs
  │   └─ RemainingQuantums = order.Quantums
  ├─ Write to state
  └─ AddSuborderToTriggerStore(offset=0) ← First suborder immediate!
  
EndBlocker (every block):
  ↓
GenerateAndPlaceTriggeredTwapSuborders()
  ├─ Iterate trigger store (sorted by timestamp)
  ├─ For each triggered suborder:
  │   ├─ Get parent TWAP placement
  │   ├─ GenerateSuborder():
  │   │   ├─ Calculate subticks (oracle + tolerance)
  │   │   ├─ Calculate quantums (remaining / legs, cap at 3x)
  │   │   └─ Set GoodTilBlockTime (blockTime + 3 seconds)
  │   ├─ DecrementTwapOrderRemainingLegs()
  │   ├─ AddSuborderToTriggerStore(offset=interval) ← Schedule next
  │   └─ safeHandleMsgPlaceOrder() ← Place suborder
  └─ On completion (RemainingLegs = 0):
      └─ DeleteTWAPOrderPlacement()

On Suborder Fill:
  ↓
UpdateTWAPOrderRemainingQuantityOnFill()
  └─ RemainingQuantums -= filledQuantums
```

### Conditional Order Complete Lifecycle

```
User → MsgPlaceOrder (Conditional)
  ↓
SetLongTermOrderPlacement()
  └─ Write to UntriggeredConditionalOrderKeyPrefix
  
EndBlocker (every block):
  ↓
MaybeTriggerConditionalOrders()
  ├─ OrganizeUntriggeredConditionalOrdersFromState()
  │   ├─ Take profit BUY → OrdersToTriggerWhenOraclePriceLTETriggerPrice
  │   ├─ Take profit SELL → OrdersToTriggerWhenOraclePriceGTETriggerPrice
  │   ├─ Stop loss BUY → OrdersToTriggerWhenOraclePriceGTETriggerPrice
  │   └─ Stop loss SELL → OrdersToTriggerWhenOraclePriceLTETriggerPrice
  ├─ For each ClobPairId:
  │   ├─ Get oracle price
  │   ├─ TriggerOrdersWithPrice(oracle price)
  │   │   ├─ PollTriggeredConditionalOrders()
  │   │   │   ├─ Pessimistic rounding
  │   │   │   └─ Check CanTrigger()
  │   │   └─ For each triggered:
  │   │       ├─ MustTriggerConditionalOrder()
  │   │       │   ├─ Delete from untriggered state
  │   │       │   └─ Write to triggered state
  │   │       └─ Emit NewConditionalOrderTriggeredEvent
  │   ├─ Get clamped trade prices
  │   ├─ TriggerOrdersWithPrice(min trade price)
  │   └─ TriggerOrdersWithPrice(max trade price)
  └─ Return triggered order IDs
  
PrepareCheckState (next block):
  ↓
PlaceConditionalOrdersTriggeredInLastBlock()
  └─ AddPreexistingStatefulOrder() → MemClob
      └─ Order now on orderbook, can match
```

---

## 🎓 Understanding Check

Can you answer these?
- [x] What is the entry point for stateful order placement?
- [x] Why do we check for conflicts (cancelled/removed) before placing?
- [x] How does the TWAP trigger store work?
- [x] What is the 3x catchup multiple for TWAP suborders?
- [x] Why do we use pessimistic rounding for conditional orders?
- [x] What are the three price sources for conditional order triggering?
- [x] Why do we need safe execution in EndBlocker?
- [x] What's the difference between untriggered and triggered conditional orders?

---

## 🔍 Questions for Further Study

1. How does `CancelStatefulOrder()` actually remove orders from MemClob?
2. What happens if a TWAP suborder fails collateralization check?
3. How are expired conditional orders removed?
4. What is the `ConditionalOrderTriggerMultiplier` value?
5. How does `PrepareCheckState` place triggered conditional orders?
6. What happens if the same conditional order is triggered by multiple prices?

---

## 💡 Key Takeaways

1. **MsgServer is stateful-only** - Short-term orders never reach these handlers
2. **Conflict detection is critical** - Prevents inconsistent state within a block
3. **TWAP is a scheduling system** - Parent order spawns suborders via trigger store
4. **Conditional orders have two states** - Untriggered (waiting) → Triggered (ready to place)
5. **Pessimistic rounding protects users** - Only trigger when absolutely sure
6. **Safe execution in EndBlocker** - Panic recovery prevents chain halts
7. **Three price sources for triggering** - Oracle + clamped trade prices
8. **First TWAP suborder is immediate** - Trigger offset = 0 for first suborder
9. **TWAP catchup mechanism** - Suborders can be up to 3x original size
10. **Graceful error handling** - Cancellation handles already-removed orders

---

## ✅ Completion Status

- [x] Order placement flow understood
- [x] Order cancellation mechanics documented
- [x] TWAP order logic analyzed
- [x] Conditional order triggering understood
- [x] Flow diagrams created
- [x] Key insights documented

**Files Analyzed**: 4/4
- ✅ `msg_server_place_order.go` (161 lines)
- ✅ `msg_server_cancel_orders.go` (120 lines)
- ✅ `twap_order_state.go` (452 lines)
- ✅ `untriggered_conditional_orders.go` (376 lines)

**Total Lines Studied**: 1,109 lines

---

**Next Steps (Day 4)**: MemClob & Matching Engine
- Study `memclob/memclob.go` (96KB - the heart of matching!)
- Understand `memclob/orderbook.go` - in-memory orderbook structure
- Analyze `keeper/process_single_match.go` - match execution
- Review `keeper/process_operations.go` - operation processing
