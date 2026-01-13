# Day 2 Session Notes - Keeper Layer

**Date**: January 13, 2026  
**Focus**: Understanding the Keeper layer - the state management orchestrator of the CLOB module

---

## 🎯 Key Learnings

### 1. Keeper Structure & Initialization (`keeper/keeper.go`)

#### Keeper Struct Anatomy (Lines 29-71)

```go
type Keeper struct {
    // Core infrastructure
    cdc               codec.BinaryCodec
    storeKey          storetypes.StoreKey      // Persistent state
    memKey            storetypes.StoreKey      // Volatile memstore
    transientStoreKey storetypes.StoreKey      // Transient state
    authorities       map[string]struct{}       // Authorized addresses
    
    // In-memory matching engine
    MemClob                 types.MemClob
    PerpetualIdToClobPairId map[uint32][]types.ClobPairId
    
    // Cross-module dependencies (11 total!)
    subaccountsKeeper types.SubaccountsKeeper   // Balance/position management
    assetsKeeper      types.AssetsKeeper        // Asset definitions
    bankKeeper        types.BankKeeper          // Token transfers
    blockTimeKeeper   types.BlockTimeKeeper     // Block timestamps
    feeTiersKeeper    types.FeeTiersKeeper      // Fee calculations
    perpetualsKeeper  types.PerpetualsKeeper    // Perpetual markets
    pricesKeeper      types.PricesKeeper        // Oracle prices
    statsKeeper       types.StatsKeeper         // Statistics
    rewardsKeeper     types.RewardsKeeper       // Rewards distribution
    affiliatesKeeper  types.AffiliatesKeeper    // Affiliate program
    revshareKeeper    types.RevShareKeeper      // Revenue sharing
    accountPlusKeeper types.AccountPlusKeeper   // Account operations
    
    // Event management
    indexerEventManager      indexer_manager.IndexerEventManager
    streamingManager         streamingtypes.FullNodeStreamingManager
    finalizeBlockEventStager finalizeblock.EventStager
    
    // State tracking
    inMemStructuresInitialized *atomic.Bool  // Atomic flag for hydration
    
    // Configuration
    Flags flags.ClobFlags
    mevTelemetryConfig MevTelemetryConfig
    
    // Validation
    txDecoder   sdk.TxDecoder
    antehandler sdk.AnteHandler
    
    // Rate limiting
    placeCancelOrderRateLimiter rate_limit.RateLimiter[sdk.Msg]
    updateLeverageRateLimiter   rate_limit.RateLimiter[string]
    
    // Liquidation daemon integration
    DaemonLiquidationInfo *liquidationtypes.DaemonLiquidationInfo
}
```

**Critical Insight**: The keeper is the **central orchestrator** - it coordinates 11 different modules! This is why CLOB is the "heart" of dYdX.

#### Three-Store Architecture

| Store | Type | Purpose | Lifetime |
|-------|------|---------|----------|
| `storeKey` | Persistent | Long-term state (orders, fills, pairs) | Permanent |
| `memKey` | Memory | Fast access cache (stateful orders) | Per-block |
| `transientStoreKey` | Transient | Uncommitted state (CheckTx) | Cleared after commit |

**Why 3 stores?**
- **Persistent**: Survives restarts, consensus-critical
- **Memory**: Performance optimization, rebuilt from persistent on restart
- **Transient**: Temporary state during transaction validation

---

### 2. Keeper Initialization Flow

#### Initialize() Method (Lines 192-221)

**Two-Phase Initialization**:

```
Phase 1: InitMemStore()
├─ Copy stateful orders from persistent → memstore
├─ Set memstore initialized flag
└─ Ensure stateful order count is accurate

Phase 2: Hydrate In-Memory Structures (once only)
├─ Check inMemStructuresInitialized atomic flag
├─ Branch context (CacheContext) to avoid state pollution
├─ InitMemClobOrderbooks() - Create orderbooks from ClobPairs
├─ InitStatefulOrders() - Load existing stateful orders
└─ HydrateClobPairAndPerpetualMapping() - Build perpetual mapping
```

**Critical Detail** (Lines 204-210):
```go
// Branch the context for hydration.
// This means that new order matches from hydration will get added to the operations
// queue but the corresponding state changes will be discarded.
// This is needed because we are hydrating in memory structures in PreBlock
// which operates on deliver state. Writing optimistic matches breaks consensus.
checkCtx, _ := ctx.CacheContext()
checkCtx = checkCtx.WithIsCheckTx(true)
```

**Why branch the context?**
- Hydration happens in `PreBlock` (deliver state)
- Placing orders might generate matches
- We want matches in operations queue but NOT state changes
- Branched context discards state changes after hydration

---

### 3. Order Processing (`keeper/orders.go`)

This file is **MASSIVE** (1330 lines, 48KB) - it's the core of order handling!

#### A. Short-Term Order Placement

**Function**: `PlaceShortTermOrder()` (Lines 166-237)

**Flow**:
```
1. Assert CheckTx mode (lib.AssertCheckTxMode)
2. Calculate next block height (ctx.BlockHeight() + 1)
3. Validate order is short-term (MustBeShortTermOrder)
4. Perform stateful validation (PerformStatefulOrderValidation)
5. Place on MemClob (MemClob.PlaceOrder)
6. Send offchain updates to indexer
7. Record telemetry metrics
```

**Key Characteristics**:
- **Only runs in CheckTx** - short-term orders are mempool-only
- **Uses next block height** - validates for block N+1, not N
- **No state writes** - everything is in-memory (MemClob)
- **Returns immediately** - optimistic fill amount and status

#### B. Stateful Order Placement

**Function**: `PlaceStatefulOrder()` (Lines 307-436)

**Flow**:
```
1. Assert order is stateful (MustBeStatefulOrder)
2. Perform stateful validation
3. Check equity tier limit (ValidateSubaccountEquityTierLimitForStatefulOrder)
4. Validate order router rev share
5. Perform collateralization check (AddOrderToOrderbookSubaccountUpdatesCheck)
6. Write to state (conditional on CheckTx vs DeliverTx):
   ├─ DeliverTx: SetLongTermOrderPlacement() → committed state
   └─ CheckTx: MustAddUncommittedStatefulOrderPlacement() → transient state
```

**Critical Branching Logic** (Lines 414-433):
```go
if lib.IsDeliverTxMode(ctx) {
    // Write the stateful order to state and the memstore.
    if order.IsTwapOrder() {
        k.SetTWAPOrderPlacement(ctx, order, blockHeight)
    } else {
        k.SetLongTermOrderPlacement(ctx, order, blockHeight)
        k.AddStatefulOrderIdExpiration(ctx, order.MustGetUnixGoodTilBlockTime(), order.GetOrderId())
    }
} else {
    // Write the stateful order to a transient store.
    k.MustAddUncommittedStatefulOrderPlacement(ctx, msg)
}
```

**Why the split?**
- **DeliverTx**: Transaction is being committed → write to permanent state
- **CheckTx**: Transaction is being validated → write to transient state
- This allows mempool validation without polluting committed state

#### C. Collateralization Check

**The Most Important Spam Prevention** (Lines 377-410)

```go
if order.IsCollateralCheckRequired(isInternalOrder) {
    order_subticks, err := k.GetSubticksForCollatCheck(ctx, order)
    
    updateResult := k.AddOrderToOrderbookSubaccountUpdatesCheck(
        ctx,
        order.OrderId.SubaccountId,
        types.PendingOpenOrder{
            RemainingQuantums:     order.GetBaseQuantums(),
            IsBuy:                 order.IsBuy(),
            Subticks:              order_subticks,
            ClobPairId:            order.GetClobPairId(),
            BuilderCodeParameters: order.GetBuilderCodeParameters(),
        },
    )
    
    if !updateResult.IsSuccess() {
        return ErrStatefulOrderCollateralizationCheckFailed
    }
}
```

**What this does**:
1. Simulates adding the full order to the orderbook
2. Checks if subaccount would still be collateralized
3. Rejects order if it would make account undercollateralized
4. **Prevents spam** - can't place orders you can't afford

**Special case**: For market TWAP orders (subticks = 0), uses oracle price!

---

### 4. Stateful Order State Management (`keeper/stateful_order_state.go`)

#### Order Placement Storage

**Function**: `SetLongTermOrderPlacement()` (Lines 26-78)

```go
type LongTermOrderPlacement struct {
    Order       types.Order
    PlacedBlock uint32
}
```

**Storage Keys**:
- **Long-term orders**: `StatefulOrderKeyPrefix + OrderId`
- **Triggered conditional**: `TriggeredConditionalOrderKeyPrefix + OrderId`
- **Untriggered conditional**: `UntriggeredConditionalOrderKeyPrefix + OrderId`

**Why separate triggered/untriggered?**
- Untriggered conditionals are NOT on the orderbook
- When triggered (price condition met), moved to triggered state
- Then placed on orderbook in PrepareCheckState

#### Order Expiration Management

**Function**: `AddStatefulOrderIdExpiration()` (Lines 194-207)

```go
// Key format: ExpirationKeyPrefix + GoodTilBlockTime + OrderId
```

**Expiration Flow**:
```
1. Order placed with GoodTilBlockTime (GTBT)
2. AddStatefulOrderIdExpiration(GTBT, OrderId)
3. In EndBlocker: RemoveExpiredStatefulOrders(blockTime)
4. Iterates expirations up to blockTime
5. Removes expired orders from state
6. Emits indexer events
```

**Function**: `RemoveExpiredStatefulOrders()` (Lines 209-230)

Returns slice of expired order IDs for ProcessProposerMatchesEvents.

#### Conditional Order Triggering

**Function**: `MustTriggerConditionalOrder()` (Lines 256-299)

```go
func (k Keeper) MustTriggerConditionalOrder(ctx sdk.Context, orderId types.OrderId) {
    // 1. Get order from untriggered state
    placement, found := k.GetUntriggeredConditionalOrderPlacement(ctx, orderId)
    if !found {
        panic("Order not in untriggered state")
    }
    
    // 2. Remove from untriggered state
    k.deleteUntriggeredConditionalOrderPlacement(ctx, orderId)
    
    // 3. Add to triggered state
    k.setTriggeredConditionalOrderPlacement(ctx, placement)
}
```

**State Transition**:
```
Untriggered State → (Price condition met) → Triggered State → (PrepareCheckState) → On Orderbook
```

---

### 5. CLOB Pair Management (`keeper/clob_pair.go`)

#### CLOB Pair Creation

**Function**: `CreatePerpetualClobPair()` (Lines 70-108)

**Two-Step Process**:
```
1. createPerpetualClobPair() - Validate and write to state
2. StageNewClobPairSideEffects() - Stage orderbook creation
```

**Why stage?**
- Creating orderbooks has in-memory side effects
- Can't do during FinalizeBlock (consensus issues)
- Staged events processed in Precommit hook
- Ensures orderbook creation happens AFTER block commit

**Function**: `ApplySideEffectsForNewClobPair()` (Lines 248-261)

```go
func (k Keeper) ApplySideEffectsForNewClobPair(ctx sdk.Context, clobPair types.ClobPair) {
    k.MemClob.CreateOrderbook(ctx, clobPair)
    k.SetClobPairIdForPerpetual(clobPair)
}
```

Called in Precommit after staged events are retrieved.

#### CLOB Pair Status Validation

**Function**: `validateOrderAgainstClobPairStatus()` (Lines 447-526)

**Status Transitions**:
```
INITIALIZING → ACTIVE → FINAL_SETTLEMENT
```

**Order Restrictions by Status**:
- **INITIALIZING**: No orders allowed
- **ACTIVE**: All orders allowed
- **FINAL_SETTLEMENT**: Only reduce-only orders allowed

**Why FINAL_SETTLEMENT?**
- Market is being wound down
- Can't open new positions
- Can only close existing positions
- Prevents new exposure to dying market

---

## 🔑 Critical Insights

### 1. CheckTx vs DeliverTx Pattern

**Everywhere in the keeper**:
```go
if lib.IsDeliverTxMode(ctx) {
    // Write to committed state
    k.SetLongTermOrderPlacement(ctx, order, blockHeight)
} else {
    // Write to transient/uncommitted state
    k.MustAddUncommittedStatefulOrderPlacement(ctx, msg)
}
```

**Why this matters**:
- **CheckTx**: Mempool validation - needs to be fast, reversible
- **DeliverTx**: Block execution - permanent, consensus-critical
- Allows optimistic validation without state pollution

### 2. Collateralization as Spam Prevention

The `AddOrderToOrderbookSubaccountUpdatesCheck()` is **critical**:
- Simulates full order execution
- Checks account would remain solvent
- **Prevents spam orders** that would fail anyway
- Runs BEFORE writing to state

Without this, attackers could flood mempool with invalid orders!

### 3. Atomic Bool for Initialization

```go
inMemStructuresInitialized *atomic.Bool
```

**Why atomic?**
- Multiple goroutines might call `Initialize()`
- Atomic ensures only ONE initialization happens
- `Swap(true)` returns old value atomically
- If already true, skip initialization

### 4. Branched Context for Hydration

**The branching trick** (Lines 209-210):
```go
checkCtx, _ := ctx.CacheContext()
checkCtx = checkCtx.WithIsCheckTx(true)
```

**What this achieves**:
- Hydration can generate matches (side effect)
- Matches added to operations queue (wanted)
- State changes discarded (unwanted in PreBlock)
- Prevents consensus-breaking state writes

### 5. Three-Tier Order Storage

**Storage Strategy**:
1. **Persistent Store**: Long-term orders, TWAP orders
2. **Memstore**: Fast access cache of stateful orders
3. **MemClob**: In-memory orderbook (short-term + stateful)

**Why three tiers?**
- **Performance**: Memstore faster than persistent
- **Separation**: Short-term never touch persistent
- **Hydration**: Memstore rebuilt from persistent on restart

---

## 📊 Order Placement Flow Diagrams

### Short-Term Order Flow

```
User → MsgPlaceOrder (CheckTx)
  ↓
PlaceShortTermOrder()
  ├─ Validate: PerformStatefulOrderValidation()
  ├─ Place: MemClob.PlaceOrder()
  ├─ Stream: sendOffchainMessagesWithTxHash()
  └─ Return: (fillAmount, status, error)
  
[No state writes - all in-memory]
```

### Stateful Order Flow

```
User → MsgPlaceOrder
  ↓
PlaceStatefulOrder()
  ├─ Validate: PerformStatefulOrderValidation()
  ├─ Check: ValidateSubaccountEquityTierLimitForStatefulOrder()
  ├─ Collateral: AddOrderToOrderbookSubaccountUpdatesCheck()
  └─ Write State:
      ├─ DeliverTx: SetLongTermOrderPlacement() → Persistent
      └─ CheckTx: MustAddUncommittedStatefulOrderPlacement() → Transient
  
[State writes depend on execution mode]
```

### Conditional Order Lifecycle

```
Place (Untriggered)
  ↓
SetLongTermOrderPlacement() → UntriggeredConditionalOrderKeyPrefix
  ↓
[Wait for price condition]
  ↓
EndBlocker: MaybeTriggerConditionalOrders()
  ↓
MustTriggerConditionalOrder()
  ├─ Remove from untriggered state
  └─ Add to triggered state
  ↓
PrepareCheckState: PlaceConditionalOrdersTriggeredInLastBlock()
  ↓
AddPreexistingStatefulOrder() → MemClob
  ↓
[Order now on orderbook, can match]
```

---

## 🎓 Understanding Check

Can you answer these?
- [x] What are the 11 cross-module dependencies of the keeper?
- [x] Why does the keeper have 3 different stores?
- [x] What's the difference between CheckTx and DeliverTx order placement?
- [x] Why is collateralization check critical for spam prevention?
- [x] How does the keeper use atomic.Bool for initialization?
- [x] Why branch the context during hydration?
- [x] What's the lifecycle of a conditional order?
- [x] Why stage CLOB pair creation side effects?

---

## 🔍 Questions for Further Study

1. How exactly does `AddOrderToOrderbookSubaccountUpdatesCheck()` work?
2. What are the specific equity tier limits?
3. How does the rate limiter prevent spam?
4. What happens if a stateful order fails collateralization in DeliverTx?
5. How are TWAP suborders generated and placed?

---

## 📝 Next Steps (Day 3)

Tomorrow we'll dive into:
- Complete order lifecycle (placement → matching → fill)
- Order cancellation flows
- TWAP order mechanics
- Conditional order triggering logic

**Files to study**:
- `keeper/process_operations.go` - Operations processing
- `keeper/process_single_match.go` - Match execution
- `keeper/twap_order_state.go` - TWAP logic
- `keeper/untriggered_conditional_orders.go` - Conditional triggering

---

## 💡 Key Takeaways

1. **Keeper is the orchestrator** - coordinates 11 modules!
2. **Three stores serve different purposes** - persistent, memory, transient
3. **CheckTx vs DeliverTx pattern is everywhere** - separates validation from execution
4. **Collateralization check prevents spam** - critical security feature
5. **Atomic initialization prevents race conditions** - thread-safe hydration
6. **Context branching enables safe hydration** - operations queue without state pollution
7. **Staged events solve consensus problems** - in-memory side effects after commit
