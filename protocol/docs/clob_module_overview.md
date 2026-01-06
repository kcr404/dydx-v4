# 📚 Key Functions of the **`x/clob`** Module

Below is a concise reference of the most important functions that drive the CLOB (Central Limit Order Book) logic. Each function name is a clickable link that jumps to its definition (file + line number).

| Area | Function | Description |
| ------ | ---------- | ------------- |
| **ABCI entry‑points** | [`PreBlocker()`](x/clob/abci.go:20) | Executes the **Pre‑Block** logic – initializes the mem‑clob for the upcoming block. |
| | [`BeginBlocker()`](x/clob/abci.go:28) | Sets up per‑block state, clears previous proposer‑match events and resets delivered order IDs. |
| | [`EndBlocker()`](x/clob/abci.go:66) | Handles **End‑Block** duties: pruning fills, expiring stateful orders, triggering TWAP sub‑orders, conditional orders, and sending off‑chain updates. |
| | [`PrepareCheckState()`](x/clob/abci.go:136) | Runs the **Prepare‑Check‑State** phase – re‑plays validator‑local operations, purges invalid mem‑clob state, places stateful & conditional orders, and performs liquidation/deleveraging. |
| **Keeper – high‑level helpers** | [`GetOperations()`](x/clob/keeper/keeper.go:26) | Returns the raw `MsgProposedOperations` queue for the next block (used by the consensus engine). |
| | [`BatchCancelShortTermOrder()`](x/clob/keeper/keeper.go:51) | Batch‑cancels a set of short‑term orders; updates mem‑clob and records successes / failures. |
| | [`CancelShortTermOrder()`](x/clob/keeper/keeper.go:121) | Cancels a single short‑term order, validates GTB, updates mem‑clob and emits off‑chain messages. |
| | [`PlaceShortTermOrder()`](x/clob/keeper/keeper.go:175) | Places a short‑term order (checks, validates, runs matching, emits off‑chain updates). |
| | [`CancelStatefulOrder()`](x/clob/keeper/keeper.go:239) | Validates and removes a **stateful** (long‑term / conditional / TWAP) order from state and the mem‑store. |
| | [`PlaceStatefulOrder()`](x/clob/keeper/keeper.go:320) | Validates, checks equity‑tier limits, runs collateral checks, writes the order to state (or uncommitted state) and emits off‑chain updates. |
| | [`ReplayPlaceOrder()`](x/clob/keeper/keeper.go:447) | Re‑plays a previously‑validated order onto the mem‑clob during `PrepareCheckState`. |
| | [`InitStatefulOrders()`](x/clob/keeper/keeper.go:1228) | Hydrates the mem‑clob with all **stateful** orders that exist in state at genesis or after a restart. |
| | [`PerformStatefulOrderValidation()`](x/clob/keeper/keeper.go:828) | Core validation for any order (clob‑pair existence, subticks/quantums multiples, GTB/GTBT windows, cancellation conflicts, etc.). |
| | [`PerformOrderCancellationStatefulValidation()`](x/clob/keeper/keeper.go:653) | Validates cancellation parameters for both short‑term and stateful orders (GTB/GTBT windows, existing cancellations, etc.). |
| | [`SendOffchainMessages()`](x/clob/keeper/keeper.go:1312) | Sends all generated off‑chain `Indexer` messages (order placements, removals, fills, etc.) with optional headers. |
| **Mem‑Clob – core matching engine** | [`PlaceOrder()`](x/clob/memclob/memclob.go:446) | Inserts an order into the in‑memory orderbook, runs matching, updates stateful structures, and produces off‑chain updates. |
| | [`CancelOrder()`](x/clob/memclob/memclob.go:92) | Removes a short‑term order from the mem‑clob and records a cancel expiration. |
| | [`mustAddOrderToOrderbook()`](x/clob/memclob/orderbook.go:326) | Low‑level routine that adds a validated order to the appropriate price level, updates best bid/ask, and bookkeeping. |
| | [`mustRemoveOrder()`](x/clob/memclob/orderbook.go:406) | Low‑level routine that fully removes an order (including best‑price updates, cancel structures, and reduce‑only bookkeeping). |
| | [`GetMidPrice()`](x/clob/memclob/orderbook.go:63) | Returns the mid‑price of a given orderbook (used for price‑premium calculations). |

---

## 🗺️ Mermaid Flowcharts

### 1️⃣ Order Placement Flow

```mermaid
flowchart TD
    A[MsgPlaceOrder received] --> B[ValidateBasic (types/message_place_order.go)]
    B --> C[PerformStatefulOrderValidation (keeper.go:828)]
    C -->|valid| D[PlaceOrder on MemClob (memclob.go:446)]
    D --> E{Matching required?}
    E -->|Yes| F[MatchOrder (memclob.go:1528)]
    F --> G[Update orderbook & fills]
    E -->|No| G
    G --> H[Generate Off‑chain Updates]
    H --> I[sendOffchainMessagesWithTxHash (keeper.go:1587)]
    I --> J[Order placed & persisted (if DeliverTx)]
```

### 2️⃣ Order Cancellation Flow

```mermaid
flowchart TD
    A[MsgCancelOrder received] --> B[ValidateBasic (types/message_cancel_order.go)]
    B --> C{Order type}
    C -->|Short‑Term| D[PerformOrderCancellationStatefulValidation (keeper.go:653)]
    C -->|Stateful| D
    D --> E[CancelShortTermOrder (keeper.go:121) / CancelStatefulOrder (keeper.go:239)]
    E --> F[MemClob.CancelOrder (memclob.go:92) or state removal]
    F --> G[Generate Off‑chain Cancel Updates]
    G --> H[sendOffchainMessagesWithTxHash (keeper.go:1587)]
    H --> I[Cancellation persisted (if DeliverTx)]
```

### 3️⃣ Block Lifecycle (ABCI)

```mermaid
flowchart LR
    subgraph ABCI
        P[PreBlocker] --> B[BeginBlocker] --> C[DeliverTx (user msgs)]
        C --> D[EndBlocker] --> E[PrepareCheckState] --> P
    end

    P -->|Init mem‑clob| M[MemClob.Initialize]
    B -->|Reset events| R[ResetAllDeliveredOrderIds]
    D -->|Prune fills & expirations| X[PruneStateFillAmounts / RemoveExpiredStatefulOrders]
    D -->|Trigger TWAP / Conditional| Y[GenerateAndPlaceTriggeredTwapSuborders / MaybeTriggerConditionalOrders]
    E -->|Replay local ops| Z[MemClob.ReplayOperations]
    E -->|Place stateful & conditional orders| W[PlaceStatefulOrdersFromLastBlock / PlaceConditionalOrdersTriggeredInLastBlock]
    E -->|Liquidation & Deleveraging| L[LiquidateSubaccountsAgainstOrderbook / DeleverageSubaccounts]
```

---

### How to Use This Document

* Click any function name to jump directly to its source line.
* The flowcharts give a high‑level visual of the **order lifecycle** (placement, cancellation, and block processing).
* For deeper details, explore the linked source files – they contain the full validation, matching, and state‑management logic.
