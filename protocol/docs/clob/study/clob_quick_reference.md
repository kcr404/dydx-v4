# CLOB Module Quick Reference Card

## 📁 Key File Locations

| Component | File | Purpose |
|-----------|------|---------|
| Module Entry | `module.go` | Module registration & ABCI hooks |
| Lifecycle | `abci.go` | PreBlock, BeginBlock, EndBlock, PrepareCheckState, Precommit |
| Core Keeper | `keeper/keeper.go` | Keeper struct & initialization |
| Order Processing | `keeper/orders.go` | Order validation & placement |
| Operations | `keeper/process_operations.go` | Proposer operations processing |
| Matching | `keeper/process_single_match.go` | Match execution |
| MemClob | `memclob/memclob.go` | In-memory matching engine |
| Orderbook | `memclob/orderbook.go` | Orderbook structure |
| Liquidations | `keeper/liquidations.go` | Liquidation logic |
| Order Types | `types/order.go` | Order struct & methods |
| CLOB Pair | `types/clob_pair.go` | Market configuration |

## 🔑 Critical Data Structures

### ProcessProposerMatchesEvents
```go
type ProcessProposerMatchesEvents struct {
    BlockHeight                              uint32
    OrderIdsFilledInLastBlock               []OrderId
    ExpiredStatefulOrderIds                 []OrderId
    RemovedStatefulOrderIds                 []OrderId
    ConditionalOrderIdsTriggeredInLastBlock []OrderId
}
```
**Purpose**: Bridge between blocks - tracks what happened in block N

### Keeper Stores
- **storeKey**: Persistent on-chain state
- **memKey**: Volatile memstore (reset each block)
- **transientStoreKey**: Transient state (cleared after commit)

## 🔄 ABCI Lifecycle Sequence

```
PreBlock          → Initialize MemClob structures
BeginBlock        → Reset ProcessProposerMatchesEvents
DeliverTx (many)  → Process Msgs + Proposer Operations
EndBlock          → Expire orders, trigger TWAP/conditional
PrepareCheckState → 9-step process (replay, liquidate)
Precommit         → Apply finalize-block side effects
Commit            → Persist state
```

## 📦 Order Type Classification

```
Order
├── Short-Term (GTB, single block)
│   └── In-memory only, not persisted
└── Stateful (multi-block)
    ├── Long-Term (GTB > current block)
    ├── Conditional (triggered by price)
    │   ├── Take Profit
    │   └── Stop Loss
    └── TWAP (split into suborders)
```

## 🎯 Important Functions

### Order Lifecycle
- `HandleMsgPlaceOrder()` - Entry point for order placement
- `PlaceStatefulOrder()` - Validate & persist stateful orders
- `ProcessProposerOperations()` - Process operations from proposer
- `PersistMatchToState()` - Execute and persist a match

### MemClob Operations
- `PlaceOrder()` - Add order to in-memory book
- `CancelOrder()` - Remove order from book
- `GetOperationsToReplay()` - Get local operations queue
- `ReplayOperations()` - Replay operations onto book
- `PurgeInvalidMemclobState()` - Clean up invalid state

### State Management
- `GetProcessProposerMatchesEvents()` - Get events from last block
- `MustSetProcessProposerMatchesEvents()` - Update events
- `GetDeliveredLongTermOrderIds()` - Get orders from last block
- `RemoveExpiredStatefulOrders()` - Prune expired orders

## 🔍 Common Patterns

### 2-Pass Order Placement
```go
// Pass 1: Post-only orders
PlaceStatefulOrdersFromLastBlock(ctx, orderIds, updates, true)

// Pass 2: All orders
PlaceStatefulOrdersFromLastBlock(ctx, orderIds, updates, false)
```

### Operations Queue Flow
```
Proposer: MemClob.Match() → Generate Operations
          ↓
Block:    Include Operations
          ↓
Validators: ProcessProposerOperations() → Persist
          ↓
Non-Proposers: ReplayOperations() → Sync MemClob
```

### Cross-Module Interaction
```go
// Check collateral
keeper.subaccountsKeeper.GetNetCollateral(ctx, subaccountId)

// Get oracle price
keeper.pricesKeeper.GetMarketPrice(ctx, marketId)

// Update vault
keeper.vaultKeeper.UpdateVault(ctx, vaultId, delta)
```

## 🚨 Critical Invariants

1. **Determinism**: All validators must produce same state
2. **Operations Queue**: Only source of truth for matches
3. **Two-Pass Placement**: Post-only first prevents MEV
4. **ProcessProposerMatchesEvents**: Must be set in EndBlock
5. **MemClob Sync**: Must replay operations in PrepareCheckState

## 📊 Metrics & Telemetry

Key metrics to monitor:
- `clob_expired_stateful_orders` - Expired order count
- `insurance_fund_balance` - Insurance fund size
- `place_long_term_orders_from_last_block` - Latency & count

## 🐛 Common Debugging Points

1. **Order not matching?** Check:
   - Order is in MemClob (`GetOrder()`)
   - Price levels are correct
   - Collateral is sufficient

2. **State mismatch?** Check:
   - ProcessProposerMatchesEvents is correct
   - Operations were replayed
   - No panics in PrepareCheckState

3. **Liquidation not triggering?** Check:
   - DaemonLiquidationInfo has subaccount
   - PrepareCheckState is running
   - Subaccount TNC is negative

## 💡 Pro Tips

- Use `GetOrderTextString()` for debugging orders
- Check `ProcessProposerMatchesEvents` to understand block transitions
- MemClob state is volatile - always check after PrepareCheckState
- Rate limiters can reject valid orders - check limits
- Streaming is optional - check `GetFullNodeStreamingManager().Enabled()`
