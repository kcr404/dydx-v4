# Day 4 Architecture Diagrams - MemClob & Matching Engine

## 1. MemClob Overall Architecture

```mermaid
graph TB
    subgraph "MemClobPriceTimePriority"
        MC[MemClob Core]
        OB_MAP["orderbooks<br/>map[ClobPairId]*Orderbook"]
        OPS["operationsToPropose<br/>OperationsToPropose"]
        KEEPER["clobKeeper<br/>MemClobKeeper"]
        
        MC --> OB_MAP
        MC --> OPS
        MC --> KEEPER
    end
    
    subgraph "Orderbook (per ClobPairId)"
        BIDS["Bids<br/>map[Subticks]*Level"]
        ASKS["Asks<br/>map[Subticks]*Level"]
        BEST["BestBid / BestAsk<br/>(cached)"]
        ORDER_MAP["orderIdToLevelOrder<br/>map[OrderId]*LevelOrder"]
        SUBACCT["SubaccountOpenClobOrders<br/>(nested maps)"]
        EXPIRE["blockExpirationsForOrders<br/>map[BlockHeight]OrderIds"]
    end
    
    OB_MAP --> BIDS
    OB_MAP --> ASKS
    OB_MAP --> BEST
    OB_MAP --> ORDER_MAP
    OB_MAP --> SUBACCT
    OB_MAP --> EXPIRE
    
    style MC fill:#e1f5ff
    style OB_MAP fill:#fff4e1
    style OPS fill:#ffe1e1
    style KEEPER fill:#e1ffe1
```

## 2. Orderbook Data Structure Detail

```mermaid
graph LR
    subgraph "Price Level Map (Bids/Asks)"
        MAP["map[Subticks]*Level"]
    end
    
    subgraph "Level at Price $100.50"
        LEVEL["Level"]
        LIST["LevelOrders<br/>(Linked List)"]
        LEVEL --> LIST
    end
    
    subgraph "Linked List (FIFO)"
        O1["Order A<br/>10 units<br/>Time: 10:00:01"]
        O2["Order B<br/>5 units<br/>Time: 10:00:02"]
        O3["Order C<br/>20 units<br/>Time: 10:00:03"]
        
        O1 --> O2
        O2 --> O3
    end
    
    MAP -->|"Subticks: 100500"| LEVEL
    LIST --> O1
    
    subgraph "Order ID Lookup"
        ID_MAP["orderIdToLevelOrder<br/>map[OrderId]*LevelOrder"]
        ID_MAP -->|"OrderId_A"| O1
        ID_MAP -->|"OrderId_B"| O2
        ID_MAP -->|"OrderId_C"| O3
    end
    
    style MAP fill:#e1f5ff
    style LEVEL fill:#fff4e1
    style LIST fill:#ffe1ff
    style ID_MAP fill:#e1ffe1
```

## 3. Matching Engine Flow

```mermaid
sequenceDiagram
    participant User
    participant PlaceOrder
    participant matchOrder
    participant mustPerformTakerOrderMatching as Matching Loop
    participant ProcessSingleMatch
    participant mustUpdateMemclobState as Update State
    participant Orderbook
    
    User->>PlaceOrder: Place taker order
    PlaceOrder->>PlaceOrder: Validate order
    PlaceOrder->>matchOrder: Match against book
    
    matchOrder->>matchOrder: Branch state<br/>(CacheContext)
    
    matchOrder->>Matching Loop: Find matches
    
    loop For each potential maker
        Matching Loop->>Orderbook: Get best/next maker
        Orderbook-->>Matching Loop: Maker order
        
        Matching Loop->>Matching Loop: Check if crossed
        
        alt Not crossed
            Matching Loop-->>matchOrder: Stop matching
        end
        
        Matching Loop->>Matching Loop: Check self-trade
        
        alt Self-trade detected
            Matching Loop->>Matching Loop: Mark maker for removal
            Note over Matching Loop: Continue to next maker
        end
        
        Matching Loop->>Matching Loop: Calculate match amount<br/>(min of taker/maker remaining)
        
        Matching Loop->>Matching Loop: Handle reduce-only<br/>(resize if needed)
        
        Matching Loop->>ProcessSingleMatch: Check collateralization
        ProcessSingleMatch-->>Matching Loop: Success/Failure
        
        alt Maker failed collat
            Matching Loop->>Matching Loop: Mark maker for removal
            Note over Matching Loop: Continue to next maker
        end
        
        alt Taker failed collat
            Matching Loop-->>matchOrder: Stop matching
        end
        
        Matching Loop->>Matching Loop: Record fill
        Matching Loop->>Matching Loop: Update taker remaining
        
        alt Taker fully matched
            Matching Loop-->>matchOrder: Stop matching
        end
    end
    
    Matching Loop-->>matchOrder: Return fills & removals
    
    matchOrder->>matchOrder: Remove failed makers
    
    alt Valid matches exist
        matchOrder->>Update State: Update memclob state
        Update State->>Orderbook: Update filled amounts
        Update State->>Orderbook: Remove fully filled
        Update State->>Update State: Add to operations queue
        matchOrder->>matchOrder: Commit branched state<br/>(writeCache)
    else No valid matches
        matchOrder->>matchOrder: Discard branched state
    end
    
    matchOrder-->>PlaceOrder: Return status
    PlaceOrder-->>User: Order placed/matched
```

## 4. Price-Time Priority Visualization

```mermaid
graph TD
    subgraph "Orderbook State"
        subgraph "Bids (Buy Orders)"
            B1["$100.50: A(10), B(5), C(20)"]
            B2["$100.25: D(15), E(8)"]
            B3["$100.00: F(30)"]
        end
        
        subgraph "Asks (Sell Orders)"
            A1["$100.75: G(12), H(7)"]
            A2["$101.00: I(25)"]
            A3["$101.25: J(18), K(9)"]
        end
    end
    
    TAKER["Taker SELL<br/>@ $100.25<br/>40 units"]
    
    TAKER -->|"Match 1<br/>10 @ $100.50"| B1
    TAKER -->|"Match 2<br/>5 @ $100.50"| B1
    TAKER -->|"Match 3<br/>20 @ $100.50"| B1
    TAKER -->|"Match 4<br/>5 @ $100.25"| B2
    
    RESULT["Fully Matched<br/>40 units filled<br/>0 remaining"]
    
    B2 --> RESULT
    
    style TAKER fill:#ffe1e1
    style B1 fill:#e1ffe1
    style B2 fill:#e1ffe1
    style RESULT fill:#e1f5ff
```

## 5. Matching Loop Decision Tree

```mermaid
graph TD
    START["Start Matching Loop"]
    
    FIND["Find next best maker order"]
    FOUND{"Maker<br/>found?"}
    CROSSED{"Orderbook<br/>crossed?"}
    SELF{"Self-<br/>trade?"}
    REPLACE{"Replacement<br/>order?"}
    AUTH{"Auth<br/>valid?"}
    CALC["Calculate match amount"]
    REDUCE{"Reduce-<br/>only?"}
    RESIZE["Resize match amount"]
    COLLAT["Check collateralization"]
    COLLAT_OK{"Both<br/>pass?"}
    MAKER_OK{"Maker<br/>OK?"}
    TAKER_OK{"Taker<br/>OK?"}
    POST{"Post-<br/>only?"}
    RECORD["Record fill"]
    UPDATE["Update taker remaining"]
    FULL{"Taker<br/>full?"}
    
    START --> FIND
    FIND --> FOUND
    
    FOUND -->|No| STOP1["Stop: No more makers"]
    FOUND -->|Yes| CROSSED
    
    CROSSED -->|No| STOP2["Stop: Not crossed"]
    CROSSED -->|Yes| REPLACE
    
    REPLACE -->|Yes| FIND
    REPLACE -->|No| SELF
    
    SELF -->|Yes| REMOVE1["Mark maker for removal"]
    REMOVE1 --> FIND
    SELF -->|No| AUTH
    
    AUTH -->|Invalid| REMOVE2["Mark maker for removal"]
    REMOVE2 --> FIND
    AUTH -->|Valid| CALC
    
    CALC --> REDUCE
    
    REDUCE -->|Yes| RESIZE
    REDUCE -->|No| COLLAT
    RESIZE --> COLLAT
    
    COLLAT --> COLLAT_OK
    
    COLLAT_OK -->|No| MAKER_OK
    COLLAT_OK -->|Yes| POST
    
    MAKER_OK -->|No| REMOVE3["Mark maker for removal"]
    REMOVE3 --> TAKER_OK
    
    TAKER_OK -->|No| STOP3["Stop: Taker failed"]
    TAKER_OK -->|Yes| FIND
    
    POST -->|Yes| STOP4["Stop: Post-only would cross"]
    POST -->|No| RECORD
    
    RECORD --> UPDATE
    UPDATE --> FULL
    
    FULL -->|Yes| STOP5["Stop: Taker fully matched"]
    FULL -->|No| FIND
    
    style START fill:#e1f5ff
    style STOP1 fill:#ffe1e1
    style STOP2 fill:#ffe1e1
    style STOP3 fill:#ffe1e1
    style STOP4 fill:#ffe1e1
    style STOP5 fill:#e1ffe1
    style RECORD fill:#e1ffe1
```

## 6. State Branching Pattern

```mermaid
graph TB
    subgraph "Parent Context"
        PARENT["Parent SDK Context<br/>(Current State)"]
    end
    
    subgraph "matchOrder Function"
        BRANCH["Create Branched Context<br/>ctx.CacheContext()"]
        MATCH["Perform Matching<br/>(in branched context)"]
        REMOVE["Remove Failed Makers<br/>(in branched context)"]
        CHECK{"Valid<br/>matches?"}
        UPDATE["Update MemClob State<br/>(in branched context)"]
        COMMIT["Commit: writeCache()"]
        DISCARD["Discard: do nothing"]
    end
    
    PARENT --> BRANCH
    BRANCH --> MATCH
    MATCH --> REMOVE
    REMOVE --> CHECK
    
    CHECK -->|Yes| UPDATE
    UPDATE --> COMMIT
    COMMIT --> PARENT_UPDATED["Parent Context<br/>(Updated State)"]
    
    CHECK -->|No| DISCARD
    DISCARD --> PARENT_UNCHANGED["Parent Context<br/>(Unchanged State)"]
    
    style PARENT fill:#e1f5ff
    style BRANCH fill:#fff4e1
    style COMMIT fill:#e1ffe1
    style DISCARD fill:#ffe1e1
    style PARENT_UPDATED fill:#e1ffe1
    style PARENT_UNCHANGED fill:#e1f5ff
```

## 7. Operations Queue Integration

```mermaid
graph LR
    subgraph "Matching Process"
        MATCH["Match Orders"]
        FILLS["Generate Fills"]
    end
    
    subgraph "Operations Queue"
        OPS["operationsToPropose"]
        
        subgraph "Order Placements"
            PLACE_ST["Short-Term Order<br/>Placements"]
            PLACE_LT["Long-Term Order<br/>Placements"]
        end
        
        subgraph "Matches"
            MATCHES["Match Operations<br/>(Taker + Maker Fills)"]
        end
        
        subgraph "Removals"
            REMOVALS["Order Removals<br/>(Undercollateralized,<br/>Self-Trade, etc.)"]
        end
        
        OPS --> PLACE_ST
        OPS --> PLACE_LT
        OPS --> MATCHES
        OPS --> REMOVALS
    end
    
    subgraph "Next Block"
        PROPOSE["MsgProposedOperations<br/>(Proposer)"]
        PROCESS["ProcessProposerMatches<br/>(All Validators)"]
    end
    
    MATCH --> FILLS
    FILLS --> MATCHES
    MATCH --> REMOVALS
    
    OPS --> PROPOSE
    PROPOSE --> PROCESS
    
    style MATCH fill:#e1f5ff
    style OPS fill:#fff4e1
    style PROPOSE fill:#ffe1ff
    style PROCESS fill:#e1ffe1
```

## 8. Complete Order Lifecycle (Day 4 Focus)

```mermaid
stateDiagram-v2
    [*] --> Received: User places order
    
    Received --> Validating: PlaceOrder()
    Validating --> Matching: Validation passed
    Validating --> Rejected: Validation failed
    
    Matching --> CheckCrossed: matchOrder()
    CheckCrossed --> NotCrossed: No overlap
    CheckCrossed --> FindMaker: Orderbook crossed
    
    FindMaker --> MakerFound: getBestOrderOnSide()
    FindMaker --> NoMakers: No makers available
    
    MakerFound --> CheckSelfTrade
    CheckSelfTrade --> RemoveMaker: Self-trade detected
    CheckSelfTrade --> CalcAmount: Valid match
    
    CalcAmount --> Collateralization: ProcessSingleMatch()
    
    Collateralization --> BothPass: Both OK
    Collateralization --> MakerFails: Maker undercollateralized
    Collateralization --> TakerFails: Taker undercollateralized
    
    BothPass --> RecordFill: Record match
    MakerFails --> RemoveMaker
    TakerFails --> PartiallyFilled
    
    RecordFill --> CheckRemaining
    CheckRemaining --> FullyMatched: Remaining = 0
    CheckRemaining --> FindMaker: Remaining > 0
    
    RemoveMaker --> FindMaker: Continue matching
    
    NotCrossed --> AddToBook: Has remaining size
    NoMakers --> AddToBook: Has remaining size
    FullyMatched --> Complete: All filled
    PartiallyFilled --> AddToBook: Has remaining size
    
    AddToBook --> OnBook: Resting on orderbook
    
    OnBook --> [*]: Order lifecycle complete
    Complete --> [*]: Order lifecycle complete
    Rejected --> [*]: Order lifecycle complete
    
    note right of Matching
        State branching:
        - CacheContext()
        - Atomic rollback
    end note
    
    note right of RecordFill
        Updates:
        - Taker remaining
        - Matched amounts
        - Operations queue
    end note
```

---

## Key Insights from Diagrams

### 1. **Three-Layer Architecture**
- **MemClob**: Orchestrates multiple orderbooks
- **Orderbook**: Manages price levels and orders
- **Level**: Maintains FIFO order within price

### 2. **Hybrid Indexing**
- Price-level map for fast price lookup
- Linked lists for time priority
- Order ID map for O(1) removal

### 3. **State Branching Safety**
- All matching in isolated context
- Only commit if successful
- Automatic rollback on failure

### 4. **Deferred Maker Removal**
- Failed makers marked, not removed immediately
- Allows taker to continue matching
- Batch removal after matching completes

### 5. **Operations Queue Bridge**
- Matching generates operations
- Operations proposed in next block
- All validators process same operations
- Deterministic consensus achieved
