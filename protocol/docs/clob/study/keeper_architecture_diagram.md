# Keeper Architecture Diagram

## Overview

The Keeper is the **central orchestrator** of the CLOB module, coordinating state management across 11 different modules with a sophisticated three-store architecture.

---

## Component Architecture

```mermaid
graph TB
    subgraph "Execution Modes"
        CheckTx[CheckTx Mode<br/>Mempool Validation]
        DeliverTx[DeliverTx Mode<br/>Block Execution]
    end
    
    subgraph "Keeper Core"
        Keeper[Keeper<br/>State Orchestrator]
        
        subgraph "Three-Store Architecture"
            PersistentStore[(Persistent Store<br/>Long-term State<br/>Survives Restarts)]
            MemStore[(Memory Store<br/>Fast Access Cache<br/>Per-Block)]
            TransientStore[(Transient Store<br/>CheckTx Validation<br/>Cleared After Commit)]
        end
        
        Keeper --> PersistentStore
        Keeper --> MemStore
        Keeper --> TransientStore
    end
    
    subgraph "In-Memory Matching"
        MemClob[MemClob<br/>Orderbook Engine]
    end
    
    CheckTx --> Keeper
    DeliverTx --> Keeper
    Keeper <--> MemClob
    
    style Keeper fill:#4A90E2,color:#fff
    style PersistentStore fill:#2ECC71,color:#fff
    style MemStore fill:#F39C12,color:#fff
    style TransientStore fill:#E74C3C,color:#fff
    style MemClob fill:#9B59B6,color:#fff
```

---

## Cross-Module Dependencies (11 Modules)

```mermaid
graph LR
    Keeper[Keeper<br/>Central Orchestrator]
    
    subgraph "Financial Modules"
        Subaccounts[Subaccounts<br/>Balances & Positions]
        Assets[Assets<br/>Asset Definitions]
        Bank[Bank<br/>Token Transfers]
        Vault[Vault<br/>Collateral Management]
    end
    
    subgraph "Market Data"
        Perpetuals[Perpetuals<br/>Market Config]
        Prices[Prices<br/>Oracle Feeds]
        BlockTime[BlockTime<br/>Timestamps]
    end
    
    subgraph "Economics"
        FeeTiers[FeeTiers<br/>Fee Calculation]
        Affiliates[Affiliates<br/>Referral Program]
        RevShare[RevShare<br/>Revenue Sharing]
        Rewards[Rewards<br/>Incentives]
    end
    
    subgraph "Infrastructure"
        Stats[Stats<br/>Metrics]
        AccountPlus[AccountPlus<br/>Account Ops]
    end
    
    Keeper --> Subaccounts
    Keeper --> Assets
    Keeper --> Bank
    Keeper --> Vault
    Keeper --> Perpetuals
    Keeper --> Prices
    Keeper --> BlockTime
    Keeper --> FeeTiers
    Keeper --> Affiliates
    Keeper --> RevShare
    Keeper --> Rewards
    Keeper --> Stats
    Keeper --> AccountPlus
    
    style Keeper fill:#4A90E2,color:#fff
```

---

## Event Management & Streaming

```mermaid
graph TB
    Keeper[Keeper]
    
    subgraph "Event Systems"
        IndexerMgr[Indexer Event Manager<br/>On-chain Events]
        StreamMgr[Streaming Manager<br/>Full Node Streaming]
        FinalizeStager[Finalize Block Stager<br/>Staged Side Effects]
    end
    
    Keeper --> IndexerMgr
    Keeper --> StreamMgr
    Keeper --> FinalizeStager
    
    IndexerMgr --> Indexer[Indexer Service]
    StreamMgr --> FullNodes[Full Node Clients]
    FinalizeStager --> Precommit[Precommit Hook]
    
    style Keeper fill:#4A90E2,color:#fff
    style IndexerMgr fill:#3498DB,color:#fff
    style StreamMgr fill:#1ABC9C,color:#fff
    style FinalizeStager fill:#E67E22,color:#fff
```

---

## Data Flow: Order Placement

```mermaid
sequenceDiagram
    participant User
    participant CheckTx as CheckTx Mode
    participant Keeper
    participant TransientStore as Transient Store
    participant MemClob
    participant DeliverTx as DeliverTx Mode
    participant PersistentStore as Persistent Store
    
    User->>CheckTx: Submit Order
    CheckTx->>Keeper: PlaceStatefulOrder()
    Keeper->>Keeper: Validate Order
    Keeper->>Keeper: Check Collateralization
    Keeper->>TransientStore: Write Uncommitted State
    Keeper-->>CheckTx: Success
    
    Note over CheckTx,DeliverTx: Block Proposed & Committed
    
    DeliverTx->>Keeper: PlaceStatefulOrder()
    Keeper->>Keeper: Validate Order
    Keeper->>PersistentStore: Write Committed State
    Keeper->>MemClob: Notify Order Placement
    Keeper-->>DeliverTx: Success
```

---

## Initialization Flow

```mermaid
flowchart TD
    Start[PreBlock: Initialize Called]
    
    Start --> CheckInit{Already<br/>Initialized?}
    
    CheckInit -->|Yes| Skip[Skip Initialization]
    CheckInit -->|No| Phase1[Phase 1: InitMemStore]
    
    Phase1 --> CopyOrders[Copy Stateful Orders<br/>Persistent → Memory]
    CopyOrders --> SetFlag[Set Memstore Flag]
    SetFlag --> Phase2[Phase 2: Hydrate In-Memory]
    
    Phase2 --> BranchCtx[Branch Context<br/>CacheContext]
    BranchCtx --> InitBooks[InitMemClobOrderbooks<br/>Create Orderbooks]
    InitBooks --> InitOrders[InitStatefulOrders<br/>Load Existing Orders]
    InitOrders --> HydrateMap[HydrateClobPairMapping<br/>Build Perpetual Map]
    HydrateMap --> SetAtomic[Set Atomic Flag<br/>inMemStructuresInitialized]
    SetAtomic --> Done[Initialization Complete]
    
    Skip --> Done
    
    style Start fill:#3498DB,color:#fff
    style Phase1 fill:#2ECC71,color:#fff
    style Phase2 fill:#E67E22,color:#fff
    style Done fill:#27AE60,color:#fff
```

---

## Three-Store Architecture Details

### Persistent Store
- **Type**: On-disk KV store
- **Lifetime**: Permanent (survives restarts)
- **Contents**:
  - Long-term order placements
  - TWAP order placements
  - Conditional order placements (triggered/untriggered)
  - Order fill amounts
  - CLOB pair configurations
  - Order expiration indices

### Memory Store
- **Type**: In-memory KV store
- **Lifetime**: Per-block (rebuilt on restart)
- **Contents**:
  - Cached stateful orders (copied from persistent)
  - Stateful order count
  - Memstore initialized flag
- **Purpose**: Fast read access without disk I/O

### Transient Store
- **Type**: Temporary KV store
- **Lifetime**: Cleared after commit
- **Contents**:
  - Uncommitted stateful order placements (CheckTx)
  - Uncommitted stateful order cancellations (CheckTx)
  - Staged finalize block events
- **Purpose**: Validation without state pollution

---

## CheckTx vs DeliverTx Pattern

```mermaid
flowchart LR
    subgraph "CheckTx Flow"
        CT_Start[Order Received]
        CT_Validate[Validate Order]
        CT_Write[Write to<br/>Transient Store]
        CT_Return[Return Success]
        
        CT_Start --> CT_Validate
        CT_Validate --> CT_Write
        CT_Write --> CT_Return
    end
    
    subgraph "DeliverTx Flow"
        DT_Start[Order in Block]
        DT_Validate[Validate Order]
        DT_Write[Write to<br/>Persistent Store]
        DT_Memstore[Update<br/>Memory Store]
        DT_Return[Return Success]
        
        DT_Start --> DT_Validate
        DT_Validate --> DT_Write
        DT_Write --> DT_Memstore
        DT_Memstore --> DT_Return
    end
    
    CT_Return -.->|Block Proposed| DT_Start
    
    style CT_Write fill:#E74C3C,color:#fff
    style DT_Write fill:#2ECC71,color:#fff
    style DT_Memstore fill:#F39C12,color:#fff
```

---

## Keeper Responsibilities Summary

| Responsibility | Description |
|----------------|-------------|
| **State Management** | Coordinate reads/writes across 3 stores |
| **Order Validation** | Stateful validation for all order types |
| **Collateralization** | Check account solvency before order placement |
| **Cross-Module Coordination** | Interact with 11 different modules |
| **Event Emission** | Generate indexer and streaming events |
| **Rate Limiting** | Prevent spam with rate limiters |
| **Initialization** | Hydrate in-memory structures on startup |
| **Side Effect Staging** | Stage finalize-block side effects |

---

## Key Design Patterns

### 1. Atomic Initialization
```go
inMemStructuresInitialized *atomic.Bool
```
- Thread-safe initialization flag
- Ensures single initialization across goroutines
- `Swap(true)` returns old value atomically

### 2. Context Branching
```go
checkCtx, _ := ctx.CacheContext()
checkCtx = checkCtx.WithIsCheckTx(true)
```
- Hydration without state pollution
- Operations queue updated, state changes discarded
- Prevents consensus-breaking writes in PreBlock

### 3. Conditional State Writes
```go
if lib.IsDeliverTxMode(ctx) {
    // Write to persistent store
} else {
    // Write to transient store
}
```
- Separates validation from execution
- Mempool validation doesn't pollute committed state
- Enables optimistic order checking

### 4. Staged Side Effects
```go
k.finalizeBlockEventStager.StageEvent(ctx, event)
// Later in Precommit:
k.ProcessStagedFinalizeBlockEvents(ctx)
```
- Defer in-memory side effects until after commit
- Prevents consensus issues with MemClob modifications
- Applied in Precommit hook

---

## Performance Optimizations

1. **Memory Store Caching**
   - Stateful orders cached in memory
   - Avoids repeated disk reads
   - Rebuilt from persistent on restart

2. **Transient Store for Validation**
   - CheckTx doesn't touch persistent store
   - Fast mempool validation
   - Cleared after each commit

3. **Atomic Operations**
   - Lock-free initialization check
   - Thread-safe state management
   - No mutex overhead

4. **Batched Event Processing**
   - Staged events processed in batch
   - Reduces overhead in Precommit
   - Efficient side effect application

---

## Critical Invariants

1. **Single Initialization**: `inMemStructuresInitialized` ensures one-time hydration
2. **Store Consistency**: Memstore always reflects subset of persistent store
3. **Transient Isolation**: CheckTx state never leaks to DeliverTx
4. **Event Ordering**: Staged events processed in FIFO order
5. **Cross-Module Sync**: All 11 modules remain consistent with keeper state
