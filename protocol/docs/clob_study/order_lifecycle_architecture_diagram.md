# Order Lifecycle Architecture Diagram

## Overview

This document visualizes the complete order lifecycle in the dYdX v4 CLOB module, covering order placement, cancellation, TWAP execution, and conditional order triggering mechanisms studied in Day 3.

---

## Order Type Classification

```mermaid
graph TB
    subgraph "Order Types"
        Orders[All Orders]
        
        Orders --> ShortTerm[Short-Term Orders]
        Orders --> Stateful[Stateful Orders]
        
        Stateful --> LongTerm[Long-Term Orders]
        Stateful --> TWAP[TWAP Orders]
        Stateful --> Conditional[Conditional Orders]
        
        Conditional --> TakeProfit[Take Profit]
        Conditional --> StopLoss[Stop Loss]
        
        TakeProfit --> TPBuy[TP Buy: Trigger when price ≤ trigger]
        TakeProfit --> TPSell[TP Sell: Trigger when price ≥ trigger]
        
        StopLoss --> SLBuy[SL Buy: Trigger when price ≥ trigger]
        StopLoss --> SLSell[SL Sell: Trigger when price ≤ trigger]
    end
    
    subgraph "Submission Path"
        ShortTerm --> gRPC[gRPC/WebSocket\nDirect to MemClob]
        Stateful --> MsgServer[MsgServer\nvia DeliverTx]
    end
    
    style ShortTerm fill:#E74C3C,color:#fff
    style Stateful fill:#2ECC71,color:#fff
    style TWAP fill:#3498DB,color:#fff
    style Conditional fill:#9B59B6,color:#fff
    style gRPC fill:#E67E22,color:#fff
    style MsgServer fill:#27AE60,color:#fff
```

---

## Stateful Order Placement Flow

```mermaid
sequenceDiagram
    participant User
    participant MsgServer as msg_server_place_order.go
    participant Handler as HandleMsgPlaceOrder
    participant Keeper
    participant ConflictCheck as Conflict Detection
    participant PlaceOrder as PlaceStatefulOrder
    participant Indexer as Indexer Events
    
    User->>MsgServer: MsgPlaceOrder
    MsgServer->>Handler: PlaceOrder(ctx, msg)
    
    Handler->>Handler: Assert DeliverTx Mode
    Handler->>Handler: Attach Logging Tags
    Handler->>Handler: Setup Metrics Defer
    
    Handler->>Handler: order.MustBeStatefulOrder()
    
    Handler->>ConflictCheck: Check Conflicts
    ConflictCheck->>ConflictCheck: Already Cancelled?
    ConflictCheck->>ConflictCheck: Already Removed?
    ConflictCheck-->>Handler: No Conflicts
    
    Handler->>PlaceOrder: PlaceStatefulOrder(ctx, msg)
    Note over PlaceOrder: Validation + Collateralization
    PlaceOrder-->>Handler: Success
    
    alt Conditional Order
        Handler->>Indexer: NewConditionalOrderPlacementEvent
        Handler->>Handler: AddDeliveredConditionalOrderId
    else TWAP Order
        Handler->>Indexer: NewTwapOrderPlacementEvent
    else Long-Term Order
        Handler->>Indexer: NewLongTermOrderPlacementEvent
        Handler->>Handler: AddDeliveredLongTermOrderId
    end
    
    Handler-->>MsgServer: Success
    MsgServer-->>User: MsgPlaceOrderResponse
```

---

## Order Cancellation Flow

```mermaid
sequenceDiagram
    participant User
    participant MsgServer as msg_server_cancel_orders.go
    participant Handler as HandleMsgCancelOrder
    participant Keeper
    participant CancelOrder as CancelStatefulOrder
    participant Indexer as Indexer Events
    
    User->>MsgServer: MsgCancelOrder
    MsgServer->>Handler: CancelOrder(ctx, msg)
    
    Handler->>Handler: Assert DeliverTx Mode
    Handler->>Handler: Attach Logging Tags
    Handler->>Handler: Setup Error Handling Defer
    
    Handler->>Handler: orderId.MustBeStatefulOrder()
    
    Handler->>CancelOrder: CancelStatefulOrder(ctx, msg)
    
    alt Order Exists
        CancelOrder->>CancelOrder: Remove from State
        CancelOrder->>CancelOrder: Remove from Memstore
        CancelOrder-->>Handler: Success
        Handler->>Handler: AddDeliveredCancelledOrderId
        Handler->>Indexer: NewStatefulOrderRemovalEvent\n(USER_CANCELED)
    else Order Already Removed
        CancelOrder-->>Handler: ErrStatefulOrderDoesNotExist
        Handler->>Handler: Check RemovedOrderIds
        alt Found in Removed List
            Handler->>Handler: Emit Metric (Expected Error)
            Handler->>Handler: Log Info (Graceful Handling)
            Handler-->>MsgServer: Error (Already Removed)
        else Not Found
            Handler-->>MsgServer: Error (Unexpected)
        end
    end
    
    Handler-->>MsgServer: Success/Error
    MsgServer-->>User: MsgCancelOrderResponse
```

---

## TWAP Order Complete Lifecycle

```mermaid
flowchart TD
    Start[User Places TWAP Order]
    
    Start --> SetTWAP[SetTWAPOrderPlacement]
    
    SetTWAP --> CreatePlacement[Create TwapOrderPlacement:\n- RemainingLegs = total_legs\n- RemainingQuantums = order.Quantums]
    CreatePlacement --> WriteState[Write to Persistent Store]
    WriteState --> FirstTrigger[AddSuborderToTriggerStore\noffset=0 - IMMEDIATE!]
    
    FirstTrigger --> EndBlocker1[EndBlocker: Next Block]
    
    EndBlocker1 --> IterateTriggers[GenerateAndPlaceTriggeredTwapSuborders\nIterate Trigger Store]
    
    IterateTriggers --> CheckTime{triggerTime ≤\nblockTime?}
    
    CheckTime -->|No| WaitNextBlock[Wait for Next Block]
    WaitNextBlock --> EndBlocker1
    
    CheckTime -->|Yes| GetParent[Get Parent TWAP Placement]
    
    GetParent --> ParentExists{Parent\nFound?}
    
    ParentExists -->|No| Cancelled[Operation: parentTwapCancelled\nDelete Trigger Key]
    Cancelled --> EndBlocker1
    
    ParentExists -->|Yes| GenerateSub[GenerateSuborder]
    
    GenerateSub --> CalcPrice[Calculate Subticks:\nOracle ± Tolerance\nBuy +5% = oracle * 1.05\nSell +5% = oracle * 0.95]
    
    CalcPrice --> CalcSize[Calculate Quantums:\nremaining / legs\nCap at 3x original]
    
    CalcSize --> SetGTBT[Set GoodTilBlockTime:\nblockTime + 3 seconds]
    
    SetGTBT --> CheckComplete{RemainingLegs\n= 0?}
    
    CheckComplete -->|Yes| Completed[Operation: parentTwapCompleted\nDeleteTWAPOrderPlacement]
    Completed --> Done[TWAP Complete]
    
    CheckComplete -->|No| CreateSub[Operation: createSuborder]
    
    CreateSub --> DecrementLegs[DecrementTwapOrderRemainingLegs]
    DecrementLegs --> ScheduleNext[AddSuborderToTriggerStore\noffset = interval]
    ScheduleNext --> PlaceSub[safeHandleMsgPlaceOrder\nPlace Suborder]
    
    PlaceSub --> PlaceSuccess{Success?}
    
    PlaceSuccess -->|Yes| OnFill[Suborder on Orderbook]
    OnFill --> FillHappens{Suborder\nFilled?}
    FillHappens -->|Yes| UpdateQuantums[UpdateTWAPOrderRemainingQuantityOnFill\nRemainingQuantums -= filled]
    UpdateQuantums --> EndBlocker1
    FillHappens -->|No| EndBlocker1
    
    PlaceSuccess -->|No| HandleError[Delete TWAP Placement\nDelete Trigger Key\nEmit Removal Event]
    HandleError --> Done
    
    style Start fill:#3498DB,color:#fff
    style FirstTrigger fill:#E67E22,color:#fff
    style GenerateSub fill:#2ECC71,color:#fff
    style PlaceSub fill:#9B59B6,color:#fff
    style Done fill:#27AE60,color:#fff
    style HandleError fill:#E74C3C,color:#fff
```

---

## TWAP Trigger Store Mechanism

```mermaid
graph TB
    subgraph "TWAP Trigger Store"
        TriggerStore[(Trigger Store\nKey: [timestamp][suborderId]\nValue: empty)]
        
        subgraph "Scheduled Suborders"
            T0[T=0: First Suborder\nIMMEDIATE]
            T1[T=interval: Second Suborder]
            T2[T=2*interval: Third Suborder]
            T3[T=3*interval: Fourth Suborder]
        end
        
        TriggerStore --> T0
        TriggerStore --> T1
        TriggerStore --> T2
        TriggerStore --> T3
    end
    
    subgraph "EndBlocker Processing"
        EndBlocker[EndBlocker Called]
        Iterator[Iterate Trigger Store\nSorted by Timestamp]
        Process[Process Triggered\ntriggerTime ≤ blockTime]
        
        EndBlocker --> Iterator
        Iterator --> Process
    end
    
    T0 --> Process
    T1 -.->|Future| Wait[Wait for Block]
    T2 -.->|Future| Wait
    T3 -.->|Future| Wait
    
    Process --> Generate[Generate Suborder]
    Generate --> Place[Place on Orderbook]
    Place --> Schedule[Schedule Next\noffset = interval]
    Schedule --> TriggerStore
    
    style T0 fill:#27AE60,color:#fff
    style T1 fill:#F39C12,color:#fff
    style T2 fill:#F39C12,color:#fff
    style T3 fill:#F39C12,color:#fff
    style Process fill:#3498DB,color:#fff
```

---

## TWAP Price & Size Calculation

```mermaid
flowchart LR
    subgraph "Price Calculation"
        PriceStart[Suborder Price Needed]
        
        PriceStart --> HasSubticks{Parent TWAP\nhas subticks?}
        
        HasSubticks -->|Yes| UseParent[Use Parent Subticks]
        
        HasSubticks -->|No| GetOracle[Get Oracle Price]
        GetOracle --> GetTolerance[Get PriceTolerance PPM]
        GetTolerance --> CheckSide{Order Side?}
        
        CheckSide -->|Buy| AdjustUp[Adjustment = 1M + tolerance\nWilling to pay MORE]
        CheckSide -->|Sell| AdjustDown[Adjustment = 1M - tolerance\nWilling to accept LESS]
        
        AdjustUp --> ApplyAdj[adjustedPrice = oracle * adjustment / 1M]
        AdjustDown --> ApplyAdj
        
        ApplyAdj --> Round[Round to SubticksPerTick Multiple]
        
        Round --> PriceDone[Suborder Subticks]
        UseParent --> PriceDone
    end
    
    subgraph "Size Calculation"
        SizeStart[Suborder Size Needed]
        
        SizeStart --> CalcOriginal[originalQuantumsPerLeg =\noriginalQuantums / totalLegs]
        CalcOriginal --> CalcRemaining[remainingQuantumsPerLeg =\nremainingQuantums / remainingLegs]
        CalcRemaining --> CalcMax[maxSuborderSize =\noriginalQuantumsPerLeg * 3]
        CalcMax --> TakeMin[suborderQuantums =\nmin(remaining, max)]
        TakeMin --> RoundDown[Round down to\nStepBaseQuantums]
        RoundDown --> CheckZero{Result = 0?}
        CheckZero -->|Yes| NoOrder[Cannot place suborder]
        CheckZero -->|No| SizeDone[Suborder Quantums]
    end
    
    style AdjustUp fill:#2ECC71,color:#fff
    style AdjustDown fill:#E74C3C,color:#fff
    style CalcMax fill:#E67E22,color:#fff
    style PriceDone fill:#3498DB,color:#fff
    style SizeDone fill:#3498DB,color:#fff
```

---

## Conditional Order Complete Lifecycle

```mermaid
flowchart TD
    Start[User Places Conditional Order]
    
    Start --> SetLongTerm[SetLongTermOrderPlacement]
    SetLongTerm --> WriteUntriggered[Write to Untriggered State\nUntriggeredConditionalOrderKeyPrefix]
    
    WriteUntriggered --> EndBlocker[EndBlocker: Every Block]
    
    EndBlocker --> MaybeTrigger[MaybeTriggerConditionalOrders]
    
    MaybeTrigger --> Organize[OrganizeUntriggeredConditionalOrdersFromState]
    
    Organize --> ClassifyOrders[Classify Orders by Type]
    
    ClassifyOrders --> TPBuy[Take Profit BUY\n→ OrdersToTriggerWhenOraclePriceLTETriggerPrice]
    ClassifyOrders --> TPSell[Take Profit SELL\n→ OrdersToTriggerWhenOraclePriceGTETriggerPrice]
    ClassifyOrders --> SLBuy[Stop Loss BUY\n→ OrdersToTriggerWhenOraclePriceGTETriggerPrice]
    ClassifyOrders --> SLSell[Stop Loss SELL\n→ OrdersToTriggerWhenOraclePriceLTETriggerPrice]
    
    TPBuy --> ForEachPair[For Each ClobPairId]
    TPSell --> ForEachPair
    SLBuy --> ForEachPair
    SLSell --> ForEachPair
    
    ForEachPair --> GetOracle[Get Oracle Price]
    
    GetOracle --> TriggerOracle[TriggerOrdersWithPrice\nOracle Price]
    
    TriggerOracle --> PollOracle[PollTriggeredConditionalOrders]
    
    PollOracle --> PessimisticRound[Pessimistic Rounding:\nLTE: Round UP\nGTE: Round DOWN]
    
    PessimisticRound --> CheckTrigger{CanTrigger?}
    
    CheckTrigger -->|Yes| MoveToTriggered[MustTriggerConditionalOrder:\nUntriggered → Triggered State]
    CheckTrigger -->|No| StayUntriggered[Keep in Untriggered List]
    
    MoveToTriggered --> EmitEvent[Emit NewConditionalOrderTriggeredEvent]
    
    EmitEvent --> GetTradePrices[Get Clamped Trade Prices]
    
    GetTradePrices --> CalcRange[maxAllowedRange =\noracle * MinPriceChangePpm * TriggerMultiplier]
    
    CalcRange --> CalcBounds[upperBound = oracle + range\nlowerBound = oracle - range]
    
    CalcBounds --> ClampPrices[Clamp min/max trade prices\nto bounds]
    
    ClampPrices --> TriggerMin[TriggerOrdersWithPrice\nMin Trade Price]
    ClampPrices --> TriggerMax[TriggerOrdersWithPrice\nMax Trade Price]
    
    TriggerMin --> CollectTriggered[Collect All Triggered Order IDs]
    TriggerMax --> CollectTriggered
    
    CollectTriggered --> ReturnIDs[Return Triggered IDs]
    
    ReturnIDs --> PrepareCheckState[PrepareCheckState: Next Block]
    
    PrepareCheckState --> PlaceTriggered[PlaceConditionalOrdersTriggeredInLastBlock]
    
    PlaceTriggered --> AddToMemClob[AddPreexistingStatefulOrder\n→ MemClob]
    
    AddToMemClob --> OnOrderbook[Order Now on Orderbook\nCan Match!]
    
    StayUntriggered --> EndBlocker
    
    style Start fill:#9B59B6,color:#fff
    style WriteUntriggered fill:#E67E22,color:#fff
    style PessimisticRound fill:#3498DB,color:#fff
    style MoveToTriggered fill:#2ECC71,color:#fff
    style ClampPrices fill:#F39C12,color:#fff
    style OnOrderbook fill:#27AE60,color:#fff
```

---

## Conditional Order Triggering - Two-Array Structure

```mermaid
graph TB
    subgraph "UntriggeredConditionalOrders In-Memory Structure"
        UCO[UntriggeredConditionalOrders]
        
        subgraph "LTE Array (Price ≤ Trigger)"
            LTE[OrdersToTriggerWhenOraclePriceLTETriggerPrice]
            TPBuy2[Take Profit BUY\nBuy when price drops]
            SLSell2[Stop Loss SELL\nLimit loss on long]
            
            LTE --> TPBuy2
            LTE --> SLSell2
        end
        
        subgraph "GTE Array (Price ≥ Trigger)"
            GTE[OrdersToTriggerWhenOraclePriceGTETriggerPrice]
            TPSell2[Take Profit SELL\nSell when price rises]
            SLBuy2[Stop Loss BUY\nLimit loss on short]
            
            GTE --> TPSell2
            GTE --> SLBuy2
        end
        
        UCO --> LTE
        UCO --> GTE
    end
    
    subgraph "Triggering Logic"
        OraclePrice[Oracle Price Update]
        
        OraclePrice --> RoundLTE[Pessimistic LTE:\nRound UP]
        OraclePrice --> RoundGTE[Pessimistic GTE:\nRound DOWN]
        
        RoundLTE --> CheckLTE[Check LTE Array:\nIf oracle ≤ trigger → Trigger]
        RoundGTE --> CheckGTE[Check GTE Array:\nIf oracle ≥ trigger → Trigger]
        
        CheckLTE --> TriggeredOrders[Triggered Order IDs]
        CheckGTE --> TriggeredOrders
    end
    
    LTE -.-> CheckLTE
    GTE -.-> CheckGTE
    
    style UCO fill:#9B59B6,color:#fff
    style LTE fill:#E74C3C,color:#fff
    style GTE fill:#2ECC71,color:#fff
    style RoundLTE fill:#3498DB,color:#fff
    style RoundGTE fill:#3498DB,color:#fff
```

---

## Conditional Order State Transitions

```mermaid
stateDiagram-v2
    [*] --> Placed: User Places Conditional Order
    
    Placed --> Untriggered: SetLongTermOrderPlacement\nUntriggeredConditionalOrderKeyPrefix
    
    Untriggered --> Untriggered: EndBlocker:\nPrice Condition NOT Met
    
    Untriggered --> Triggered: EndBlocker:\nPrice Condition MET\nMustTriggerConditionalOrder
    
    Triggered --> OnOrderbook: PrepareCheckState:\nPlaceConditionalOrdersTriggeredInLastBlock\nAddPreexistingStatefulOrder
    
    OnOrderbook --> Matching: MemClob Matching
    
    Matching --> Filled: Order Matched
    Matching --> Cancelled: User Cancels
    Matching --> Expired: GoodTilBlockTime Reached
    
    Filled --> [*]
    Cancelled --> [*]
    Expired --> [*]
    
    note right of Untriggered
        NOT on orderbook
        Waiting for price condition
        Stored in state
    end note
    
    note right of Triggered
        NOT on orderbook yet
        Condition met
        Waiting for next block
    end note
    
    note right of OnOrderbook
        ON orderbook
        Can match
        In MemClob
    end note
```

---

## Three Price Sources for Conditional Triggering

```mermaid
flowchart TB
    subgraph "Price Sources"
        Oracle[Oracle Price\nPrimary Source]
        MinTrade[Min Trade Price\nActual Market Low]
        MaxTrade[Max Trade Price\nActual Market High]
    end
    
    subgraph "Clamping Logic"
        CalcRange[Calculate Allowed Range:\nmaxRange = oracle * MinPriceChangePpm * TriggerMultiplier]
        
        CalcRange --> Bounds[upperBound = oracle + maxRange\nlowerBound = oracle - maxRange]
        
        Bounds --> ClampMin[clampedMin = Clamp(minTrade, lower, upper)]
        Bounds --> ClampMax[clampedMax = Clamp(maxTrade, lower, upper)]
    end
    
    Oracle --> TriggerA[Trigger Attempt 1:\nOracle Price]
    MinTrade --> CalcRange
    MaxTrade --> CalcRange
    
    ClampMin --> TriggerB[Trigger Attempt 2:\nClamped Min Trade Price]
    ClampMax --> TriggerC[Trigger Attempt 3:\nClamped Max Trade Price]
    
    TriggerA --> Collect[Collect All Triggered Orders]
    TriggerB --> Collect
    TriggerC --> Collect
    
    Collect --> Result[All Triggered Order IDs]
    
    style Oracle fill:#3498DB,color:#fff
    style MinTrade fill:#2ECC71,color:#fff
    style MaxTrade fill:#E74C3C,color:#fff
    style Bounds fill:#F39C12,color:#fff
    style Result fill:#9B59B6,color:#fff
```

---

## Conflict Detection in Order Placement

```mermaid
flowchart TD
    Start[HandleMsgPlaceOrder]
    
    Start --> GetEvents[Get ProcessProposerMatchesEvents]
    GetEvents --> GetCancelled[Get DeliveredCancelledOrderIds]
    
    GetCancelled --> CheckCancelled{Order in\nCancelled List?}
    
    CheckCancelled -->|Yes| ErrorCancelled[Error:\nErrStatefulOrderPreviouslyCancelled]
    CheckCancelled -->|No| CheckRemoved{Order in\nRemoved List?}
    
    CheckRemoved -->|Yes| ErrorRemoved[Error:\nErrStatefulOrderPreviouslyRemoved]
    CheckRemoved -->|No| Proceed[Proceed with Placement]
    
    Proceed --> PlaceOrder[PlaceStatefulOrder]
    
    ErrorCancelled --> Return[Return Error]
    ErrorRemoved --> Return
    
    PlaceOrder --> Success[Success]
    
    style CheckCancelled fill:#E74C3C,color:#fff
    style CheckRemoved fill:#E67E22,color:#fff
    style Proceed fill:#2ECC71,color:#fff
    style Success fill:#27AE60,color:#fff
```

---

## Graceful Cancellation Error Handling

```mermaid
flowchart TD
    Start[HandleMsgCancelOrder]
    
    Start --> Cancel[CancelStatefulOrder]
    
    Cancel --> Success{Success?}
    
    Success -->|Yes| AddCancelled[AddDeliveredCancelledOrderId]
    AddCancelled --> EmitEvent[Emit Removal Event\nUSER_CANCELED]
    EmitEvent --> Done[Return Success]
    
    Success -->|No| CheckError{Error Type?}
    
    CheckError -->|ErrStatefulOrderDoesNotExist| CheckRemoved[Check ProcessProposerMatchesEvents\nRemovedStatefulOrderIds]
    
    CheckRemoved --> InRemoved{Order in\nRemoved List?}
    
    InRemoved -->|Yes| Expected[Expected Error:\nOrder Already Removed by Proposer]
    Expected --> EmitMetric[Emit Metric:\nStatefulOrderAlreadyRemoved]
    EmitMetric --> LogInfo[Log Info:\nCancel Order Expected Error]
    LogInfo --> ReturnGraceful[Return Gracefully\nErrStatefulOrderCancellationFailedForAlreadyRemovedOrder]
    
    InRemoved -->|No| Unexpected[Unexpected Error]
    CheckError -->|Other Error| Unexpected
    
    Unexpected --> LogError[Log Error:\nError cancelling order]
    LogError --> ReturnError[Return Error]
    
    style Expected fill:#F39C12,color:#fff
    style EmitMetric fill:#3498DB,color:#fff
    style ReturnGraceful fill:#2ECC71,color:#fff
    style Unexpected fill:#E74C3C,color:#fff
```

---

## Safe Execution Pattern (EndBlocker)

```mermaid
sequenceDiagram
    participant EndBlocker
    participant Safe as safeHandleMsgPlaceOrder
    participant Cache as abci.RunCached
    participant Handler as HandleMsgPlaceOrder
    participant State as State Changes
    
    EndBlocker->>Safe: Place TWAP Suborder
    Safe->>Cache: RunCached(ctx, func)
    
    Cache->>Cache: Create Cached Context
    Cache->>Handler: HandleMsgPlaceOrder(cachedCtx)
    
    alt Success
        Handler->>State: Apply State Changes
        State-->>Handler: Success
        Handler-->>Cache: nil
        Cache->>Cache: Commit Cached Changes
        Cache-->>Safe: nil
        Safe-->>EndBlocker: Success
    else Error
        Handler->>State: Attempt State Changes
        State-->>Handler: Error
        Handler-->>Cache: error
        Cache->>Cache: Discard Cached Changes
        Cache-->>Safe: error
        Safe->>Safe: Log Error (Don't Panic!)
        Safe-->>EndBlocker: error
    else Panic
        Handler->>Handler: PANIC!
        Cache->>Cache: Recover from Panic
        Cache->>Cache: Convert to Error
        Cache-->>Safe: error (panic recovered)
        Safe->>Safe: Log Error with Stack Trace
        Safe-->>EndBlocker: error
    end
    
    Note over EndBlocker,State: Chain Continues Running!
```

---

## Order Lifecycle Summary Table

| Order Type | Submission | Storage | Lifetime | On Orderbook | Triggering |
|------------|------------|---------|----------|--------------|------------|
| **Short-Term** | gRPC/WebSocket | MemClob only | Max 20 blocks | Immediate | N/A |
| **Long-Term** | MsgPlaceOrder | Persistent + MemClob | Up to 95 days | Immediate | N/A |
| **TWAP** | MsgPlaceOrder | Persistent (parent) | Until complete | Suborders only | Time-based (trigger store) |
| **Conditional** | MsgPlaceOrder | Persistent (untriggered) | Until triggered/expired | After trigger | Price-based (oracle + trade) |

---

## Key Design Patterns

### 1. Conflict Detection
```go
// Check if order was already cancelled or removed in this block
cancelledOrderIds := lib.UniqueSliceToSet(k.GetDeliveredCancelledOrderIds(ctx))
removedOrderIds := lib.UniqueSliceToSet(processProposerMatchesEvents.RemovedStatefulOrderIds)
```
- Prevents placing already-cancelled/removed orders
- Ensures consistency within a block
- Protects against race conditions

### 2. TWAP Trigger Store Scheduling
```go
// Key format: [timestamp][suborderId]
triggerKey := types.GetTWAPTriggerKey(triggerTime, suborderId)
triggerStore.Set(triggerKey, []byte{})
```
- Sorted by timestamp for efficient iteration
- Empty value (key contains all info)
- First suborder has offset=0 (immediate)

### 3. Pessimistic Rounding for Conditional Orders
```go
// Round UP for LTE conditions (conservative)
pessimisticLTESubticks := lib.BigRatRound(oraclePriceSubticksRat, true)

// Round DOWN for GTE conditions (conservative)
pessimisticGTESubticks := lib.BigRatRound(oraclePriceSubticksRat, false)
```
- Only trigger when absolutely sure
- Prevents premature triggering
- Protects users from unfair execution

### 4. Safe Execution in EndBlocker
```go
if err = abci.RunCached(ctx, func(ctx sdk.Context) error {
    return k.HandleMsgPlaceOrder(ctx, msg, isStateful)
}); err != nil {
    k.Logger(ctx).Error("failed to handle TWAP suborder placement (panic recovered)")
    return err
}
```
- Panic recovery prevents chain halts
- Cached context isolates state changes
- Graceful degradation on errors

---

## Critical Invariants

1. **Stateful-Only MsgServer**: Short-term orders never reach `msg_server_place_order.go`
2. **Conflict Prevention**: No order can be placed if cancelled/removed in same block
3. **TWAP Parent Never on Orderbook**: Only suborders are placed on MemClob
4. **Conditional Two-State Lifecycle**: Untriggered → Triggered → On Orderbook
5. **Pessimistic Triggering**: Only trigger when price condition is definitely met
6. **Three Price Sources**: Oracle + clamped min/max trade prices
7. **First TWAP Suborder Immediate**: Trigger offset = 0 for first execution
8. **Safe EndBlocker Execution**: Panics recovered, chain never halts
9. **Graceful Cancellation**: Already-removed orders handled without error
10. **TWAP Catchup Cap**: Suborders capped at 3x original size per leg

---

## Performance Considerations

1. **TWAP Trigger Store Iteration**
   - Sorted by timestamp (efficient range query)
   - Only process triggered orders (triggerTime ≤ blockTime)
   - Early break when future orders encountered

2. **Conditional Order Classification**
   - Two-array structure for efficient polling
   - Separate LTE and GTE conditions
   - No need to check all orders for every price update

3. **Conflict Detection**
   - Set-based lookups (O(1) average case)
   - Only checks current block's cancelled/removed orders
   - Minimal overhead

4. **Safe Execution Overhead**
   - Cached context for state isolation
   - Only used in EndBlocker (not hot path)
   - Panic recovery worth the cost

---

## Integration Points

### With Keeper (Day 2)
- `PlaceStatefulOrder()` - Validation and collateralization
- `CancelStatefulOrder()` - State and memstore removal
- Three-store architecture for state management

### With MemClob (Day 4 Preview)
- `AddPreexistingStatefulOrder()` - Place triggered conditional orders
- `PlaceOrder()` - Place TWAP suborders
- Order matching and execution

### With Indexer
- `NewConditionalOrderPlacementEvent`
- `NewTwapOrderPlacementEvent`
- `NewLongTermOrderPlacementEvent`
- `NewStatefulOrderRemovalEvent`
- `NewConditionalOrderTriggeredEvent`

---

## Questions for Day 4

1. How does MemClob actually match orders?
2. What is the orderbook data structure?
3. How are matches processed and persisted?
4. What is the operations queue?
5. How does proposer operation validation work?
