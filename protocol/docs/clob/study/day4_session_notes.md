# Day 4 Session Notes - MemClob & Matching Engine

**Date**: January 15, 2026  
**Focus**: In-memory orderbook structure, matching engine, and operation processing

---

## 🎯 Session Goals

1. ✅ Understand MemClob architecture and data structures
2. ✅ Study Orderbook implementation and order storage
3. ✅ Analyze matching engine and price-time priority
4. ⏳ Understand operation processing and deterministic matching

**📊 Visual Diagrams**: See [Day 4 Architecture Diagrams](./day4_architecture_diagrams.md) for visual representations of:
- MemClob structure and orderbook organization
- Price-time priority implementation
- Matching engine flow and decision tree
- State branching pattern
- Operations queue integration

---

## 📚 Study Notes

### 1. MemClob Structure (`memclob/memclob.go`)

#### A. MemClobPriceTimePriority - The Core Structure (Lines 35-50)

```go
type MemClobPriceTimePriority struct {
    // Holds every `Orderbook` by ID of the CLOB.
    orderbooks map[types.ClobPairId]*Orderbook
    
    // OperationsToPropose struct for proposing operations in the next block.
    operationsToPropose types.OperationsToPropose
    
    // A reference to an expected clob keeper.
    clobKeeper types.MemClobKeeper
    
    // Fields for determining if off-chain update messages should be generated
    generateOffchainUpdates bool
    
    // Fields for determining if orderbook updates should be generated
    generateOrderbookUpdates bool
}
```

**Key Insights**:
- **One orderbook per ClobPairId**: Each trading pair has its own isolated orderbook
- **Operations queue**: `operationsToPropose` is the bridge to deterministic consensus
- **Bidirectional dependency**: MemClob and ClobKeeper reference each other (set via `SetClobKeeper()`)
- **Off-chain updates**: Generates messages for indexer (Ender, Vulcan, etc.)
- **Orderbook updates**: Generates streaming updates for full-node gRPC streams

#### B. Orderbook Lifecycle (Lines 159-204)

**Creation**:
```go
func (m *MemClobPriceTimePriority) CreateOrderbook(clobPair types.ClobPair) {
    clobPairId := clobPair.GetClobPairId()
    
    // Panic if orderbook already exists
    if _, exists := m.orderbooks[clobPairId]; exists {
        panic(fmt.Sprintf("Orderbook for ClobPair ID %d already exists", clobPairId))
    }
    
    // Create new orderbook with initialized data structures
    m.orderbooks[clobPairId] = &Orderbook{
        Asks:                           make(map[types.Subticks]*types.Level),
        BestAsk:                        math.MaxUint64,  // Worst possible ask
        BestBid:                        0,                // Worst possible bid
        Bids:                           make(map[types.Subticks]*types.Level),
        MinOrderBaseQuantums:           minOrderBaseQuantums,
        SubaccountOpenClobOrders:       make(map[satypes.SubaccountId]map[types.Order_Side]map[types.OrderId]bool),
        SubticksPerTick:                subticksPerTick,
        SubaccountOpenReduceOnlyOrders: make(map[satypes.SubaccountId]map[types.OrderId]bool),
        orderIdToLevelOrder:            make(map[types.OrderId]*types.LevelOrder),
        blockExpirationsForOrders:      make(map[uint32]map[types.OrderId]bool),
        orderIdToCancelExpiry:          make(map[types.OrderId]uint32),
        cancelExpiryToOrderIds:         make(map[uint32]map[types.OrderId]bool),
    }
}
```

**Why this matters**:
- Orderbooks are created dynamically when ClobPairs are added
- Each orderbook is fully isolated with its own data structures
- Panic on duplicate creation ensures consistency

---

### 2. Orderbook Data Structure (`memclob/orderbook.go`)

#### A. Orderbook Structure (Lines 14-53)

```go
type Orderbook struct {
    // Price tick configuration
    SubticksPerTick types.SubticksPerTick
    
    // Price levels (map of price → Level containing orders at that price)
    Bids map[types.Subticks]*types.Level  // Buy orders
    Asks map[types.Subticks]*types.Level  // Sell orders
    
    // Best prices (for O(1) access to top of book)
    BestBid types.Subticks  // Highest buy price (0 if no bids)
    BestAsk types.Subticks  // Lowest sell price (MaxUint64 if no asks)
    
    // Subaccount tracking
    SubaccountOpenClobOrders map[satypes.SubaccountId]map[types.Order_Side]map[types.OrderId]bool
    
    // Order size constraints
    MinOrderBaseQuantums satypes.BaseQuantums
    
    // Reduce-only order tracking
    SubaccountOpenReduceOnlyOrders map[satypes.SubaccountId]map[types.OrderId]bool
    
    // Observability
    TotalOpenOrders uint
    
    // O(1) order lookup and removal
    orderIdToLevelOrder map[types.OrderId]*types.LevelOrder
    
    // Short-term order expiration tracking
    blockExpirationsForOrders map[uint32]map[types.OrderId]bool
    
    // Cancel tracking
    orderIdToCancelExpiry map[types.OrderId]uint32
    cancelExpiryToOrderIds map[uint32]map[types.OrderId]bool
}
```

**Data Structure Breakdown**:

1. **Price Levels** (`Bids`/`Asks`):
   - Map from price (in subticks) to a `Level`
   - Each `Level` contains a linked list of orders at that price
   - Sparse representation (only populated price levels exist)

2. **Best Prices** (`BestBid`/`BestAsk`):
   - Cached for O(1) access to top of book
   - Updated when orders are added/removed
   - `BestBid = 0` means no bids exist
   - `BestAsk = MaxUint64` means no asks exist

3. **Order ID Lookup** (`orderIdToLevelOrder`):
   - **Critical for O(1) order removal**
   - Maps OrderId → pointer to LevelOrder in linked list
   - Enables instant order cancellation/replacement

4. **Subaccount Tracking** (`SubaccountOpenClobOrders`):
   - Nested map: SubaccountId → Side → OrderId → bool
   - Used for collateralization checks
   - Enables querying all orders for a subaccount

5. **Expiration Tracking** (`blockExpirationsForOrders`):
   - Map: BlockHeight → Set of OrderIds expiring at that block
   - Enables efficient bulk expiration in EndBlocker
   - Only for short-term orders

6. **Cancel Tracking**:
   - `orderIdToCancelExpiry`: OrderId → expiry block
   - `cancelExpiryToOrderIds`: Block → Set of cancelled OrderIds
   - Bidirectional mapping for efficient cleanup

#### B. Price Level Structure

From `types/level.go` (referenced):
```go
type Level struct {
    LevelOrders list.List[ClobOrder]  // Doubly-linked list
}

type LevelOrder struct {
    Value ClobOrder
    Next  *LevelOrder  // Next order in price-time priority
    Prev  *LevelOrder  // Previous order
}
```

**Why linked lists?**:
- **Price-time priority**: Orders at same price are FIFO
- **O(1) insertion**: Add to front (maker) or back (taker)
- **O(1) removal**: Remove from middle of list
- **Memory efficient**: No array resizing

#### C. Order Addition (Lines 322-404)

```go
func (ob *Orderbook) mustAddOrderToOrderbook(
    newOrder types.Order,
    forceToFrontOfLevel bool,  // true for maker orders, false for taker
) {
    isBuy := newOrder.IsBuy()
    
    // Update best price if necessary
    if isBuy {
        if ob.BestBid < newOrder.GetOrderSubticks() {
            ob.BestBid = newOrder.GetOrderSubticks()
        }
    } else {
        if ob.BestAsk > newOrder.GetOrderSubticks() {
            ob.BestAsk = newOrder.GetOrderSubticks()
        }
    }
    
    // Get or create price level
    orders := ob.GetSide(isBuy)
    level, exists := orders[newOrder.GetOrderSubticks()]
    if !exists {
        level = &types.Level{
            LevelOrders: *list.New[types.ClobOrder](),
        }
        orders[newOrder.GetOrderSubticks()] = level
    }
    
    // Add to linked list (front or back based on forceToFrontOfLevel)
    if forceToFrontOfLevel {
        level.LevelOrders.PushFront(clobOrder)
        ob.orderIdToLevelOrder[newOrder.OrderId] = level.LevelOrders.Front
    } else {
        level.LevelOrders.PushBack(clobOrder)
        ob.orderIdToLevelOrder[newOrder.OrderId] = level.LevelOrders.Back
    }
    
    // Update bookkeeping
    ob.mustAddOrderToSubaccountOrders(newOrder)
    ob.TotalOpenOrders++
    
    if newOrder.IsShortTermOrder() {
        ob.mustAddShortTermOrderToBlockExpirationsForOrders(newOrder)
    }
    
    if newOrder.IsReduceOnly() {
        // Track reduce-only orders
        openReduceOnlyOrders, exists := ob.SubaccountOpenReduceOnlyOrders[newOrder.OrderId.SubaccountId]
        if !exists {
            openReduceOnlyOrders = make(map[types.OrderId]bool)
        }
        openReduceOnlyOrders[newOrder.OrderId] = true
        ob.SubaccountOpenReduceOnlyOrders[newOrder.OrderId.SubaccountId] = openReduceOnlyOrders
    }
}
```

**Key Insights**:
- **forceToFrontOfLevel**: Maker orders go to front (better priority), taker orders to back
- **Lazy level creation**: Price levels only created when first order arrives
- **Best price maintenance**: Updated on every order addition
- **Multiple indexes**: Order added to 4-5 different data structures simultaneously

#### D. Order Removal (Lines 406-501)

```go
func (ob *Orderbook) mustRemoveOrder(levelOrder *types.LevelOrder) {
    order := levelOrder.Value.Order
    orderId := order.OrderId
    subticks := order.GetOrderSubticks()
    isBuy := order.IsBuy()
    
    // Remove from expiration tracking (if short-term)
    if order.OrderId.IsShortTermOrder() {
        goodTilBlock := order.GetGoodTilBlock()
        delete(ob.blockExpirationsForOrders[goodTilBlock], orderId)
        if len(ob.blockExpirationsForOrders[goodTilBlock]) == 0 {
            delete(ob.blockExpirationsForOrders, goodTilBlock)
        }
    }
    
    // Remove from subaccount tracking
    delete(ob.SubaccountOpenClobOrders[subaccountId][side], orderId)
    // Cleanup empty maps
    if len(ob.SubaccountOpenClobOrders[subaccountId][side]) == 0 {
        delete(ob.SubaccountOpenClobOrders[subaccountId], side)
        if len(ob.SubaccountOpenClobOrders[subaccountId]) == 0 {
            delete(ob.SubaccountOpenClobOrders, subaccountId)
        }
    }
    
    // Remove from order ID lookup
    delete(ob.orderIdToLevelOrder, orderId)
    
    // Remove from reduce-only tracking (if applicable)
    if order.IsReduceOnly() {
        delete(ob.SubaccountOpenReduceOnlyOrders[subaccountId], orderId)
        if len(ob.SubaccountOpenReduceOnlyOrders[subaccountId]) == 0 {
            delete(ob.SubaccountOpenReduceOnlyOrders, subaccountId)
        }
    }
    
    // Remove from price level linked list
    levels := ob.GetSide(isBuy)
    level := levels[subticks]
    level.LevelOrders.Remove(levelOrder)
    ob.TotalOpenOrders--
    
    // If level is now empty, remove it and update best price if needed
    if level.LevelOrders.Front == nil {
        delete(levels, subticks)
        
        if isBuy && subticks == ob.BestBid {
            // Find next best bid
            nextBestSubticks, _ := ob.findNextBestSubticks(subticks, true)
            ob.BestBid = nextBestSubticks
        } else if !isBuy && subticks == ob.BestAsk {
            // Find next best ask
            nextBestSubticks, _ := ob.findNextBestSubticks(subticks, false)
            ob.BestAsk = nextBestSubticks
        }
    }
}
```

**Removal Process**:
1. Remove from all tracking maps (expiration, subaccount, reduce-only)
2. Remove from order ID lookup
3. Remove from price level linked list
4. If level is empty, delete it
5. If deleted level was best price, find next best price

**Best Price Update Algorithm** (Lines 105-171):
```go
func (ob *Orderbook) findNextBestSubticks(startingTicks types.Subticks, isBuy bool) (
    nextBestSubtick types.Subticks,
    found bool,
) {
    levels := ob.GetSide(isBuy)
    numLevels := len(levels)
    orderbookSubticksPerTick := types.Subticks(ob.SubticksPerTick)
    
    // Phase 1: Scan in increments of SubticksPerTick (optimistic)
    for i := 0; i < numLevels; i++ {
        if isBuy {
            curSubticks -= orderbookSubticksPerTick
        } else {
            curSubticks += orderbookSubticksPerTick
        }
        
        if levels[curSubticks] != nil {
            return curSubticks, true
        }
    }
    
    // Phase 2: Fallback - iterate all levels (pessimistic)
    if isBuy {
        nextBestSubtick = 0  // Worst bid
    } else {
        nextBestSubtick = math.MaxUint64  // Worst ask
    }
    
    for subtick := range levels {
        if isBuy && nextBestSubtick < subtick && startingTicks > subtick {
            nextBestSubtick = subtick
            found = true
        } else if !isBuy && nextBestSubtick > subtick && startingTicks < subtick {
            nextBestSubtick = subtick
            found = true
        }
    }
    
    return nextBestSubtick, found
}
```

**Two-phase search**:
1. **Optimistic**: Scan in `SubticksPerTick` increments (fast if levels are dense)
2. **Pessimistic**: Iterate all levels (guaranteed O(n) worst case)

**Why this design?**:
- Most orderbooks have dense price levels near best price
- Optimistic search finds next level quickly in common case
- Fallback ensures correctness even with sparse orderbooks

---

### 3. Matching Engine (`memclob/memclob.go`)

#### A. High-Level Matching Flow (Lines 752-870)

**Entry Point**: `matchOrder()`

```go
func (m *MemClobPriceTimePriority) matchOrder(
    ctx sdk.Context,
    order types.MatchableOrder,
) (
    orderStatus types.TakerOrderStatus,
    offchainUpdates *types.OffchainUpdates,
    makerOrdersToRemove []OrderWithRemovalReason,
    err error,
) {
    // 1. Branch the state (cache context)
    branchedContext, writeCache := ctx.CacheContext()
    
    // 2. Perform matching (does NOT modify memclob state)
    newMakerFills,
        matchedOrderHashToOrder,
        matchedMakerOrderIdToOrder,
        makerOrdersToRemove,
        takerOrderStatus := m.mustPerformTakerOrderMatching(branchedContext, order)
    
    // 3. Handle replacement orders (remove old order)
    if !order.IsLiquidation() {
        orderId := order.MustGetOrder().OrderId
        if orderToBeReplaced, found := orderbook.getOrder(orderId); found {
            makerOrdersToRemove = append(makerOrdersToRemove, OrderWithRemovalReason{Order: orderToBeReplaced})
        }
    }
    
    // 4. Remove failed maker orders from orderbook
    for _, makerOrderWithRemovalReason := range makerOrdersToRemove {
        m.mustRemoveOrder(branchedContext, makerOrderId)
        if makerOrderId.IsStatefulOrder() {
            m.operationsToPropose.MustAddOrderRemovalToOperationsQueue(
                makerOrderId,
                makerOrderWithRemovalReason.RemovalReason,
            )
        }
    }
    
    // 5. Check for post-only or isolated subaccount violations
    if takerOrderStatus.OrderStatus == types.PostOnlyWouldCrossMakerOrder {
        matchingErr = types.ErrPostOnlyWouldCrossMakerOrder
    }
    if takerOrderStatus.OrderStatus == types.ViolatesIsolatedSubaccountConstraints {
        matchingErr = types.ErrWouldViolateIsolatedSubaccountConstraints
    }
    
    // 6. If valid matches, update memclob state
    takerGeneratedValidMatches := len(newMakerFills) > 0 && matchingErr == nil
    if takerGeneratedValidMatches {
        matchOffchainUpdates := m.mustUpdateMemclobStateWithMatches(
            branchedContext,
            order,
            newMakerFills,
            matchedOrderHashToOrder,
            matchedMakerOrderIdToOrder,
        )
        offchainUpdates.Append(matchOffchainUpdates)
        
        // Commit the branched state
        writeCache()
    }
    
    return takerOrderStatus, offchainUpdates, makerOrdersToRemove, matchingErr
}
```

**Critical Design Decisions**:

1. **State Branching**: Uses `ctx.CacheContext()` to create isolated state
   - Matching happens in branched context
   - Only committed if matching succeeds
   - Enables atomic rollback on errors

2. **Read-Only Matching**: `mustPerformTakerOrderMatching` does NOT modify memclob
   - Returns list of fills and removals
   - Actual state updates happen after validation
   - Separation of concerns: matching logic vs state management

3. **Two-Phase Commit**:
   - Phase 1: Match orders (in branched context)
   - Phase 2: Update memclob state (if successful)
   - `writeCache()` commits branched state to parent context

#### B. Core Matching Algorithm (Lines 1528-1894)

**Function**: `mustPerformTakerOrderMatching()`

**The Matching Loop** (Lines 1601-1883):

```go
for {
    // Step 1: Find next best maker order
    if makerLevelOrder == nil {
        // First iteration: get best order on opposite side
        makerLevelOrder, foundMakerOrder = orderbook.getBestOrderOnSide(!takerIsBuy)
    } else {
        // Subsequent iterations: get next best order
        makerLevelOrder, foundMakerOrder = orderbook.findNextBestLevelOrder(makerLevelOrder)
    }
    
    if !foundMakerOrder {
        break  // No more maker orders
    }
    
    // Step 2: Check if orderbook is crossed
    makerOrder := makerLevelOrder.Value
    if takerIsBuy {
        takerOrderCrossesMakerOrder = newTakerOrder.GetOrderSubticks() >= makerOrder.Order.GetOrderSubticks()
    } else {
        takerOrderCrossesMakerOrder = newTakerOrder.GetOrderSubticks() <= makerOrder.Order.GetOrderSubticks()
    }
    
    if !takerOrderCrossesMakerOrder {
        break  // No more overlapping orders
    }
    
    // Step 3: Skip replacement orders
    if !takerIsLiquidation && makerOrderId == newTakerOrder.MustGetOrder().OrderId {
        continue  // This is the order being replaced
    }
    
    // Step 4: Prevent self-trading
    if makerSubaccountId == takerSubaccountId {
        makerOrdersToRemove = append(makerOrdersToRemove, OrderWithRemovalReason{
            Order:         makerOrder.Order,
            RemovalReason: types.OrderRemoval_REMOVAL_REASON_INVALID_SELF_TRADE,
        })
        continue  // Remove maker order, keep matching
    }
    
    // Step 5: Validate smart account authenticators (short-term orders only)
    if makerOrder.Order.IsShortTermOrder() {
        txBytes := m.operationsToPropose.MustGetShortTermOrderTxBytes(makerOrder.Order)
        err := m.clobKeeper.MaybeValidateAuthenticators(ctx, txBytes)
        if err != nil {
            makerOrdersToRemove = append(makerOrdersToRemove, OrderWithRemovalReason{
                Order:         makerOrder.Order,
                RemovalReason: types.OrderRemoval_REMOVAL_REASON_PERMISSIONED_KEY_EXPIRED,
            })
            continue
        }
    }
    
    // Step 6: Calculate matched amount
    makerRemainingSize, _ := m.GetOrderRemainingAmount(ctx, makerOrder.Order)
    matchedAmount := min(takerRemainingSize, makerRemainingSize)
    
    // Step 7: Handle reduce-only orders (resize if necessary)
    if makerOrder.Order.IsReduceOnly() {
        currentPositionSize := m.clobKeeper.GetStatePosition(ctx, makerSubaccountId, clobPairId)
        resizedMatchAmount := m.resizeReduceOnlyMatchIfNecessary(
            ctx, makerSubaccountId, clobPairId, currentPositionSize, matchedAmount, !takerIsBuy,
        )
        
        if resizedMatchAmount == 0 {
            // Maker reduce-only order would increase position, remove it
            makerOrdersToRemove = append(makerOrdersToRemove, OrderWithRemovalReason{
                Order:         makerOrder.Order,
                RemovalReason: types.OrderRemoval_REMOVAL_REASON_INVALID_REDUCE_ONLY,
            })
            continue
        }
        
        matchedAmount = resizedMatchAmount
    }
    
    if newTakerOrder.IsReduceOnly() {
        currentPositionSize := m.clobKeeper.GetStatePosition(ctx, takerSubaccountId, clobPairId)
        resizedMatchAmount := m.resizeReduceOnlyMatchIfNecessary(
            ctx, takerSubaccountId, clobPairId, currentPositionSize, matchedAmount, takerIsBuy,
        )
        
        if resizedMatchAmount == 0 {
            panic("mustPerformTakerOrderMatching: taker reduce-only order resized to 0")
        }
        
        matchedAmount = resizedMatchAmount
    }
    
    // Step 8: Perform collateralization check
    matchWithOrders := types.MatchWithOrders{
        TakerOrder: newTakerOrder,
        MakerOrder: &makerOrder.Order,
        FillAmount: matchedAmount,
    }
    
    success, takerUpdateResult, makerUpdateResult, _, err := m.clobKeeper.ProcessSingleMatch(
        ctx, &matchWithOrders, map[string]bool{}, affiliatetypes.AffiliateParameters{},
    )
    
    // Handle special liquidation errors
    if errors.Is(err, types.ErrLiquidationExceedsSubaccountMaxInsuranceLost) {
        takerOrderStatus.OrderStatus = types.LiquidationExceededSubaccountMaxInsuranceLost
        break
    }
    if errors.Is(err, types.ErrLiquidationExceedsSubaccountMaxNotionalLiquidated) {
        takerOrderStatus.OrderStatus = types.LiquidationExceededSubaccountMaxNotionalLiquidated
        break
    }
    if errors.Is(err, types.ErrInsuranceFundHasInsufficientFunds) {
        takerOrderStatus.OrderStatus = types.LiquidationRequiresDeleveraging
        break
    }
    
    // Step 9: Handle collateralization failures
    if !success {
        makerCollatOkay := updateResultToOrderStatus(makerUpdateResult).IsSuccess()
        takerCollatOkay := takerIsLiquidation || updateResultToOrderStatus(takerUpdateResult).IsSuccess()
        
        if !makerCollatOkay {
            // Remove undercollateralized maker order
            makerOrdersToRemove = append(makerOrdersToRemove, OrderWithRemovalReason{
                Order:         makerOrder.Order,
                RemovalReason: types.OrderRemoval_REMOVAL_REASON_UNDERCOLLATERALIZED,
            })
        }
        
        if !takerCollatOkay {
            // Taker failed collateralization, stop matching
            takerOrderStatus.OrderStatus = updateResultToOrderStatus(takerUpdateResult)
            break
        }
        
        // Maker failed but taker OK, continue matching
        continue
    }
    
    // Step 10: Handle post-only orders
    if takerOrderCrossesMakerOrder &&
        !newTakerOrder.IsLiquidation() &&
        newTakerOrder.MustGetOrder().TimeInForce == types.Order_TIME_IN_FORCE_POST_ONLY {
        takerOrderStatus.OrderStatus = types.PostOnlyWouldCrossMakerOrder
        break
    }
    
    // Step 11: Record the match
    takerRemainingSize -= matchedAmount
    
    if newTakerOrder.IsBuy() {
        bigTotalMatchedAmount.Add(bigTotalMatchedAmount, matchedAmount.ToBigInt())
    } else {
        bigTotalMatchedAmount.Sub(bigTotalMatchedAmount, matchedAmount.ToBigInt())
    }
    
    // Add to matched orders maps
    makerOrderHash := makerOrder.Order.GetOrderHash()
    matchedOrderHashToOrder[makerOrderHash] = &makerOrder.Order
    matchedMakerOrderIdToOrder[makerOrderId] = makerOrder.Order
    
    if !takerOrderHashWasSet {
        takerOrderHash = newTakerOrder.GetOrderHash()
        matchedOrderHashToOrder[takerOrderHash] = newTakerOrder
        takerOrderHashWasSet = true
    }
    
    // Add to fills list
    newMakerFills = append(newMakerFills, types.MakerFill{
        MakerOrderId: makerOrderId,
        FillAmount:   matchedAmount.ToUint64(),
    })
    
    // Step 12: Check if reduce-only taker closed position
    if newTakerOrder.IsReduceOnly() && takerRemainingSize > 0 {
        takerStatePositionSize := m.clobKeeper.GetStatePosition(ctx, takerSubaccountId, clobPairId)
        if takerStatePositionSize.Sign() == 0 {
            // Position closed, cancel remaining reduce-only order
            takerOrderStatus.OrderStatus = types.ReduceOnlyResized
            break
        }
    }
    
    // Step 13: Check if taker fully matched
    if takerRemainingSize == 0 {
        break
    }
}

// Update taker order status
takerOrderStatus.RemainingQuantums = takerRemainingSize
takerOrderStatus.OrderOptimisticallyFilledQuantums = takerRemainingSizeBeforeMatching - takerRemainingSize

return newMakerFills, matchedOrderHashToOrder, matchedMakerOrderIdToOrder, makerOrdersToRemove, takerOrderStatus
```

**Matching Loop Exit Conditions**:
1. No more maker orders on opposite side
2. Orderbook no longer crossed (taker price doesn't overlap maker price)
3. Taker order fully matched (remaining size = 0)
4. Taker order failed collateralization check
5. Post-only order would cross (becomes taker)
6. Reduce-only order closed position
7. Liquidation limits reached

#### C. Price-Time Priority Implementation

**How it works**:

1. **Price Priority**: 
   - Always match against best price first
   - `getBestOrderOnSide()` returns highest bid or lowest ask
   - Continue matching at same price level before moving to next level

2. **Time Priority** (within same price level):
   - Orders stored in linked list (FIFO)
   - `findNextBestLevelOrder()` returns `levelOrder.Next`
   - First order at price level matched first

3. **Level Traversal**:
   ```
   Best Price Level → Order 1 → Order 2 → Order 3 → (empty)
                                                      ↓
   Next Best Price Level → Order 4 → Order 5 → ...
   ```

**Example**:
```
Bids (Buy Orders):
  $100.50: [Order A (10), Order B (5), Order C (20)]  ← Best bid
  $100.25: [Order D (15), Order E (8)]
  $100.00: [Order F (30)]

Asks (Sell Orders):
  $100.75: [Order G (12), Order H (7)]  ← Best ask
  $101.00: [Order I (25)]
  $101.25: [Order J (18), Order K (9)]

Incoming taker SELL order @ $100.25 for 40 units:
  Match 1: Order A (10 units @ $100.50) ← Best price, first in time
  Match 2: Order B (5 units @ $100.50)  ← Same price, next in time
  Match 3: Order C (20 units @ $100.50) ← Same price, next in time
  Match 4: Order D (5 units @ $100.25)  ← Next best price, partial fill
  Remaining: 0 units (fully matched)
```

#### D. Collateralization Checks

**When**: After calculating matched amount, before recording fill

**What it checks**:
- Taker has enough margin to support new position
- Maker has enough margin to support new position
- Neither subaccount becomes undercollateralized

**Handled by**: `m.clobKeeper.ProcessSingleMatch()`

**Outcomes**:
1. **Both pass**: Match recorded, continue matching
2. **Maker fails**: Remove maker order, continue matching with next maker
3. **Taker fails**: Stop matching, return taker status
4. **Liquidation special cases**:
   - Max insurance lost exceeded
   - Max notional liquidated exceeded
   - Insurance fund insufficient (requires deleveraging)

#### E. Special Order Handling

**1. Self-Trade Prevention** (Lines 1642-1654):
```go
if makerSubaccountId == takerSubaccountId {
    makerOrdersToRemove = append(makerOrdersToRemove, OrderWithRemovalReason{
        Order:         makerOrder.Order,
        RemovalReason: types.OrderRemoval_REMOVAL_REASON_INVALID_SELF_TRADE,
    })
    continue  // Remove maker, keep matching
}
```

**2. Reduce-Only Orders** (Lines 1687-1737):
- Check if match would increase position size
- Resize match to only reduce position
- If resized to 0, remove order (invalid reduce-only)
- If position closes, cancel remaining reduce-only size

**3. Post-Only Orders** (Lines 1821-1829):
- Check if order would cross (become taker)
- If yes, cancel order instead of matching
- Prevents post-only from paying taker fees

**4. Replacement Orders** (Lines 1636-1640):
- Skip matching against own order being replaced
- Order will be removed after matching completes

**5. Smart Account Authenticators** (Lines 1656-1672):
- Validate permissioned keys for short-term orders
- Remove orders with expired keys
- Only checked during matching (not placement)

---

## 🔑 Critical Insights (Continued)

### 6. Matching is Read-Only

**Key fact**: `mustPerformTakerOrderMatching` does NOT modify memclob state

**Why?**:
- Enables atomic rollback if matching fails
- Separates matching logic from state management
- State updates happen in `mustUpdateMemclobStateWithMatches` after validation

### 7. State Branching Pattern

**Uses `ctx.CacheContext()`**:
- Creates isolated copy of state
- Matching happens in branched context
- Only committed if successful (`writeCache()`)
- Enables "try before you buy" pattern

### 8. Maker Order Removal is Deferred

**Undercollateralized makers**:
- Not removed during matching loop
- Added to `makerOrdersToRemove` list
- Removed after matching completes
- Allows taker to continue matching against other makers

### 9. Liquidations Have Special Rules

**Taker liquidations**:
- Never fail collateralization checks
- Can exceed normal limits (with caps)
- Stop matching on insurance fund depletion
- Require deleveraging if insurance insufficient

### 10. Optimistic Hashing

**Taker order hash** (Lines 1854-1861):
- Only hashed if actually matched
- Avoids hashing unmatched orders
- Optimization based on 100:1 place-to-match ratio

---

## 📊 Matching Algorithm Complexity

| Operation | Time Complexity | Notes |
|-----------|----------------|-------|
| Find best maker | O(1) | Cached in BestBid/BestAsk |
| Find next maker | O(1) | Linked list traversal |
| Check if crossed | O(1) | Simple price comparison |
| Collateralization check | O(1) | State lookup |
| Record match | O(1) | Append to slice |
| **Overall matching** | **O(n)** | n = number of matched orders |

**Worst case**: O(m) where m = total orders on opposite side (if all fail collateralization)

---

## 🎓 Understanding Check (Updated)

Can you answer these?
- [x] What are the three main data structures in an Orderbook?
- [x] Why use linked lists within price levels?
- [x] How is O(1) order removal achieved?
- [x] What are the sentinel values for BestBid and BestAsk?
- [x] Why is there a bidirectional dependency between MemClob and ClobKeeper?
- [x] What is the two-phase search algorithm for finding next best price?
- [x] How does the matching engine implement price-time priority?
- [x] What is state branching and why is it used?
- [x] How are self-trades prevented?
- [x] What happens when a maker order fails collateralization?
- [ ] How does the operations queue work?
- [ ] How do validators reach consensus on matches?

---

## 🔍 Questions for Further Study (Updated)

1. ~~How does `PlaceOrder()` coordinate matching and state updates?~~ ✅ Answered
2. ~~What is the `matchOrder()` function and how does it work?~~ ✅ Answered
3. ~~How are fills calculated and applied?~~ ✅ Answered
4. What is `mustUpdateMemclobStateWithMatches()` and what does it do?
5. What is the operations queue format?
6. How do validators reach consensus on matches?
7. What is `ProcessSingleMatch()` in the ClobKeeper?
8. How are fees calculated during matching?

---

## ✅ Progress Status (Updated)

**Files Analyzed**: 2/4 (in progress)
- ✅ `memclob/memclob.go` (2566 lines) - Structure, lifecycle, **matching engine**
- ✅ `memclob/orderbook.go` (604 lines) - Data structures and algorithms
- ⏳ `keeper/process_single_match.go` - Match execution (next)
- ⏳ `keeper/process_operations.go` - Operations queue (next)

**Lines Studied**: 3,540 lines (including matching engine)

**Key Functions Analyzed**:
- ✅ `PlaceOrder()` - Order placement and matching coordination
- ✅ `matchOrder()` - Matching orchestration with state branching
- ✅ `mustPerformTakerOrderMatching()` - Core matching algorithm (370 lines!)
- ✅ `mustAddOrderToOrderbook()` - Order addition to price levels
- ✅ `mustRemoveOrder()` - Order removal and best price updates

---

**Next Steps**: Study `mustUpdateMemclobStateWithMatches()` and operations queue

---

## 🔑 Critical Insights

### 1. Hybrid Data Structure Design

**MemClob uses THREE complementary data structures**:

1. **Price-level map** (`Bids`/`Asks`): Fast price lookup
2. **Linked lists** (within each level): FIFO ordering (price-time priority)
3. **Order ID map** (`orderIdToLevelOrder`): O(1) order removal

**Why all three?**:
- Map alone: Can't maintain FIFO order within price level
- List alone: Can't find orders by price efficiently
- Combined: O(1) for all operations (add, remove, match)

### 2. Best Price Caching

**BestBid and BestAsk are cached**:
- Updated on every order add/remove
- Enables O(1) access to top of book
- Critical for matching performance

**Sentinel values**:
- `BestBid = 0`: No bids exist
- `BestAsk = MaxUint64`: No asks exist

### 3. Lazy Level Creation

**Price levels only created when needed**:
- Saves memory for sparse orderbooks
- No pre-allocation of price levels
- Levels deleted when last order removed

### 4. Multiple Indexes for Different Use Cases

**Each order is indexed in 4-5 places**:
1. **Price level** (for matching)
2. **Order ID map** (for cancellation)
3. **Subaccount map** (for collateralization)
4. **Expiration map** (for short-term orders)
5. **Reduce-only map** (if reduce-only)

**Trade-off**: More memory, but O(1) for all operations

### 5. Bidirectional Dependency Pattern

**MemClob ↔ ClobKeeper**:
- MemClob needs ClobKeeper for state queries
- ClobKeeper needs MemClob for matching
- Set via `SetClobKeeper()` after construction

**Why?**:
- Avoids circular dependency in constructors
- Allows independent initialization
- Common pattern in complex systems



---

## 📊 Data Structure Complexity

| Operation | Time Complexity | Data Structure Used |
|-----------|----------------|---------------------|
| Add order | O(1) | Map + Linked list |
| Remove order | O(1) | orderIdToLevelOrder |
| Get best price | O(1) | BestBid/BestAsk cache |
| Find next best price | O(n) worst, O(1) average | Two-phase search |
| Get subaccount orders | O(m) where m = # orders | SubaccountOpenClobOrders |
| Expire orders at block | O(k) where k = # expiring | blockExpirationsForOrders |

---

## 🎓 Understanding Check

Can you answer these?
- [x] What are the three main data structures in an Orderbook?
- [x] Why use linked lists within price levels?
- [x] How is O(1) order removal achieved?
- [x] What are the sentinel values for BestBid and BestAsk?
- [x] Why is there a bidirectional dependency between MemClob and ClobKeeper?
- [x] What is the two-phase search algorithm for finding next best price?
- [ ] How does the matching engine use these data structures?
- [ ] What is the operations queue and how does it work?

---

## 🔍 Questions for Further Study

1. How does `PlaceOrder()` coordinate matching and state updates?
2. What is the `matchOrder()` function and how does it work?
3. How are fills calculated and applied?
4. What is the operations queue format?
5. How do validators reach consensus on matches?
6. What happens when collateralization checks fail during matching?

---

## ✅ Progress Status

**Files Analyzed**: 2/4
- ✅ `memclob/memclob.go` (2566 lines) - Structure and lifecycle
- ✅ `memclob/orderbook.go` (604 lines) - Data structures and algorithms
- ⏳ `keeper/process_single_match.go` - Match execution (next)
- ⏳ `keeper/process_operations.go` - Operations queue (next)

**Lines Studied**: 3,170 lines

---

**Next Steps**: Study matching engine and operation processing
