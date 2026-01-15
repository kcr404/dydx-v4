# Day 1 Session Notes - Foundation & Architecture

**Date**: January 12, 2026  
**Focus**: Understanding the CLOB module's foundation, architecture, and ABCI lifecycle

---

## 🎯 Key Learnings

### 1. Module Structure (`module.go`)

#### AppModule Components
The CLOB module implements several critical Cosmos SDK interfaces:

```go
var (
    _ module.AppModuleBasic   = AppModuleBasic{}
    _ appmodule.AppModule            = AppModule{}
    _ appmodule.HasBeginBlocker      = AppModule{}
    _ appmodule.HasEndBlocker        = AppModule{}
    _ appmodule.HasPrepareCheckState = AppModule{}
    _ module.HasConsensusVersion     = AppModule{}
)
```

**Key Insight**: The module hooks into **5 ABCI lifecycle stages**:
1. `PreBlock` - Initialize in-memory structures
2. `BeginBlock` - Reset state for new block
3. `EndBlock` - Expire orders, trigger TWAP/conditional orders
4. `PrepareCheckState` - Replay operations, liquidations
5. `Precommit` - Apply finalize-block side effects

#### Module Dependencies
```go
type AppModule struct {
    keeper            *keeper.Keeper
    accountKeeper     types.AccountKeeper
    bankKeeper        types.BankKeeper
    subaccountsKeeper types.SubaccountsKeeper
}
```

**Observation**: The CLOB module is tightly coupled with:
- **Subaccounts** - For balance/position management
- **Bank** - For transfers
- **Account** - For account operations

---

### 2. ABCI Lifecycle Deep Dive (`abci.go`)

#### PreBlocker (Line 20-26)
```go
func PreBlocker(ctx sdk.Context, keeper types.ClobKeeper) {
    keeper.Initialize(ctx)
}
```
**Purpose**: Hydrate in-memory structures (MemClob) if not already initialized.

#### BeginBlocker (Line 28-47)
```go
func BeginBlocker(ctx sdk.Context, keeper types.ClobKeeper) {
    // Reset ProcessProposerMatchesEvents for new block
    keeper.MustSetProcessProposerMatchesEvents(ctx, types.ProcessProposerMatchesEvents{
        BlockHeight: lib.MustConvertIntegerToUint32(ctx.BlockHeight()),
    })
    keeper.ResetAllDeliveredOrderIds(ctx)
}
```
**Purpose**: 
- Clear events from previous block
- Reset delivered order IDs
- Prepare clean slate for new block

#### EndBlocker (Line 66-134)
**Critical Operations** (in order):
1. **Prune short-term order fill amounts** (line 79)
2. **Remove expired stateful orders** (line 82-112)
   - Delete order fill amounts
   - Delete long-term placements
   - Emit indexer events
3. **Generate TWAP suborders** (line 115)
4. **Trigger conditional orders** (line 118)
5. **Update ProcessProposerMatchesEvents** (line 124)
6. **Emit metrics** (line 130-133)

**Key Data Structure**: `ProcessProposerMatchesEvents`
```go
type ProcessProposerMatchesEvents struct {
    BlockHeight                              uint32
    OrderIdsFilledInLastBlock               []OrderId
    ExpiredStatefulOrderIds                 []OrderId
    RemovedStatefulOrderIds                 []OrderId
    ConditionalOrderIdsTriggeredInLastBlock []OrderId
}
```
This is the **bridge** between blocks - it tracks what happened in block N to inform PrepareCheckState for block N+1.

#### PrepareCheckState (Line 136-307) - **THE MOST COMPLEX**

This is where the magic happens! It prepares the memclob for the next block.

**9-Step Process**:

1. **Snapshot subaccounts** (line 151-154) - For streaming
2. **Prune rate limits** (line 157)
3. **Get operations queue** (line 172)
4. **Remove operations from memclob** (line 178)
5. **Purge invalid memclob state** (line 180-189)
   - Remove filled orders
   - Remove expired orders
   - Remove cancelled orders
6. **Place stateful orders (2-pass)** (line 191-247)
   - **Pass 1**: Post-only orders
   - **Pass 2**: All orders
7. **Replay local operations** (line 249-259)
8. **Liquidate subaccounts** (line 261-279)
9. **Gate withdrawals** (line 283-286)

**Critical Insight**: The **2-pass placement** (post-only first, then all) prevents certain race conditions and ensures fair order matching.

#### Precommit (Line 49-64)
```go
func Precommit(ctx sdk.Context, keeper keeper.Keeper) {
    keeper.ProcessStagedFinalizeBlockEvents(ctx)
    keeper.StreamBatchUpdatesAfterFinalizeBlock(ctx)
}
```
**Purpose**: 
- Apply side effects that couldn't be done during FinalizeBlock
- Stream batch updates to full nodes

---

### 3. Keeper Structure (`keeper/keeper.go`)

#### Core Keeper Fields
```go
type Keeper struct {
    cdc               codec.BinaryCodec
    storeKey          storetypes.StoreKey      // Persistent state
    memKey            storetypes.StoreKey      // Memstore (volatile)
    transientStoreKey storetypes.StoreKey      // Transient state
    
    MemClob           types.MemClob            // In-memory matching engine
    
    // Cross-module keepers
    subaccountsKeeper     types.SubaccountsKeeper
    bankKeeper            types.BankKeeper
    perpetualsKeeper      types.PerpetualsKeeper
    pricesKeeper          types.PricesKeeper
    feeTiersKeeper        types.FeeTiersKeeper
    affiliatesKeeper      types.AffiliatesKeeper
    revshareKeeper        types.RevShareKeeper
    rewardsKeeper         types.RewardsKeeper
    statsKeeper           types.StatsKeeper
    vaultKeeper           types.VaultKeeper
    
    // Rate limiting
    placeCancelOrderRateLimiter rate_limit.RateLimiter[sdk.Msg]
    updateLeverageRateLimiter   rate_limit.RateLimiter[string]
    
    // Liquidation info from daemon
    DaemonLiquidationInfo *liquidationtypes.DaemonLiquidationInfo
}
```

**Key Observations**:
1. **3 different stores**: persistent, mem, transient
2. **9 cross-module dependencies** - CLOB is the integration hub!
3. **Rate limiters** for spam protection
4. **Daemon integration** for liquidation detection

#### Critical Methods

**Initialization**:
- `Initialize(ctx)` - Hydrate in-memory structures
- `InitMemStore(ctx)` - Initialize memstore
- `InitializeForGenesis(ctx)` - Genesis initialization

**Streaming**:
- `SendOrderbookUpdates(ctx, offchainUpdates)` - Stream to full nodes
- `InitializeNewStreams(ctx, subaccountSnapshots)` - Initialize new orderbook streams

---

### 4. Type System

#### Order Type (`types/order.go`)

**Key Methods** (Order implements `MatchableOrder` interface):
- `IsBuy()` - Buy or sell side
- `GetOrderHash()` - SHA256 hash for uniqueness
- `GetBaseQuantums()` - Order size
- `GetOrderSubticks()` - Price in subticks
- `IsShortTermOrder()` - Single-block order
- `IsStatefulOrder()` - Multi-block order (long-term/conditional)
- `IsConditionalOrder()` - Triggered by conditions
- `IsTwapOrder()` - Time-weighted average price order
- `IsReduceOnly()` - Can only reduce position
- `RequiresImmediateExecution()` - IOC orders

**Order Classification**:
```
Orders
├── Short-Term (single block, in-memory only)
└── Stateful (multi-block, persisted)
    ├── Long-Term (GTB - Good Till Block)
    ├── Conditional (triggered by price)
    │   ├── Take Profit
    │   └── Stop Loss
    └── TWAP (split into suborders)
```

#### ClobPair Type (`types/clob_pair.go`)

**Status Transitions**:
```
INITIALIZING → ACTIVE → FINAL_SETTLEMENT
     ↓                        ↓
     └────────────────────────┘
```

**Key Fields**:
- `Id` - ClobPairId
- `PerpetualId` - Associated perpetual market
- `SubticksPerTick` - Price precision
- `StepBaseQuantums` - Minimum order size
- `Status` - Current status

---

## 🔑 Critical Insights

### 1. Hybrid Architecture
**On-chain state** (persistent):
- Stateful orders (long-term, conditional, TWAP)
- Order fill amounts
- ProcessProposerMatchesEvents

**In-memory** (MemClob):
- Short-term orders
- Orderbook structure (bids/asks)
- Operations queue

### 2. Operations Queue Pattern
The **operations queue** is the deterministic bridge:
1. Proposer runs MemClob matching → generates operations
2. Operations included in block
3. Validators validate and persist operations
4. Non-proposers replay operations in PrepareCheckState

This ensures **deterministic matching** across all validators!

### 3. Two-Pass Order Placement
In PrepareCheckState, orders are placed in 2 passes:
1. **Post-only pass**: Only place orders that add liquidity
2. **Full pass**: Place all orders

This prevents certain MEV attacks and ensures fair matching.

### 4. Cross-Module Coordination
CLOB is the **orchestrator** that coordinates:
- **Subaccounts** - Balance checks, position updates
- **Vault** - Collateral management
- **Prices** - Oracle price feeds
- **Perpetuals** - Market configuration
- **Fees/Affiliates/Revshare** - Fee distribution
- **Rewards/Stats** - Incentives and metrics

---

## 📊 ABCI Lifecycle Flow Diagram

```
Block N-1 Committed
        ↓
    PreBlock
        ↓ [Initialize MemClob]
    BeginBlock
        ↓ [Reset ProcessProposerMatchesEvents]
    DeliverTx (multiple)
        ↓ [Process Msgs + Proposer Operations]
    EndBlock
        ↓ [Expire orders, trigger TWAP/conditional]
    PrepareCheckState (for Block N+1)
        ↓ [9-step process: replay ops, liquidations]
    Precommit
        ↓ [Apply finalize-block side effects]
    Commit
        ↓
Block N Committed
```

---

## 🎓 Understanding Check

Can you answer these?
- [x] What are the 5 ABCI lifecycle hooks the CLOB module uses?
- [x] What is ProcessProposerMatchesEvents and why is it important?
- [x] What's the difference between short-term and stateful orders?
- [x] Why is PrepareCheckState the most complex lifecycle hook?
- [x] What is the operations queue and how does it ensure determinism?
- [x] Why are orders placed in 2 passes (post-only first)?
- [x] What are the 3 different stores the keeper uses?

---

## 🔍 Questions for Further Study

1. How exactly does the MemClob matching algorithm work?
2. What are the specific MEV vectors and how are they mitigated?
3. How are liquidations calculated and executed?
4. What is the exact format of the operations queue?
5. How does streaming work for full nodes?

---

## 📝 Next Steps (Day 2)

Tomorrow we'll dive into:
- Keeper layer implementation details
- Order state management
- CLOB pair management
- Cross-module interactions

**Files to study**:
- `keeper/orders.go`
- `keeper/stateful_order_state.go`
- `keeper/clob_pair.go`
- `keeper/process_operations.go`
