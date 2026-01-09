# CLOB Module — Mermaid Diagrams

Below are several Mermaid diagrams that illustrate the `clob` module's architecture, message flows, proposer operations, and ABCI lifecycle interactions with other keepers.

## Component Diagram

```mermaid
flowchart LR
  subgraph Client
    U[User / CLI / gRPC]
  end

  subgraph Node
    Msg[MsgServer]
    Keeper[Keeper]
    MemClob[MemClob (in-memory orderbooks & matcher)]
    Store[(KV Store)]
    Stream[FullNodeStreaming]
    Indexer[IndexerManager]
  end

  subgraph OtherKeepers
    Subaccounts[subaccounts]
    Vault[vault]
    Prices[prices]
    Perps[perpetuals]
    Fees[feetiers]
    Aff[affiliates]
    Rev[revshare]
    Rewards[rewards]
    Stats[stats]
  end

  U -->|Tx MsgPlaceOrder| Msg
  Msg -->|Handle -> Keeper| Keeper
  Keeper -->|persist state| Store
  Keeper -->|hydrate/update| MemClob
  Keeper -->|stream updates| Stream
  Keeper -->|events| Indexer

  Keeper --> Subaccounts
  Keeper --> Vault
  Keeper --> Prices
  Keeper --> Perps
  Keeper --> Fees
  Keeper --> Aff
  Keeper --> Rev
  Keeper --> Rewards
  Keeper --> Stats

  MemClob -->|proposer ops| Keeper
  MemClob -->|offchain snapshots| Stream
```

## PlaceOrder Sequence (simplified)

```mermaid
sequenceDiagram
  participant U as User
  participant CLI as CLI/gRPC
  participant MS as MsgServer
  participant K as Keeper
  participant SA as subaccounts
  participant V as vault
  participant M as MemClob
  participant IDX as Indexer

  U->>CLI: submit MsgPlaceOrder
  CLI->>MS: send Msg
  MS->>K: HandleMsgPlaceOrder(ctx, msg)
  K->>SA: Check balances / positions
  SA-->>K: balances/positions
  K->>V: Lock collateral / adjust vault
  V-->>K: confirm
  K->>Store: write stateful placement
  K->>M: add order (mem book) / update in-memory structures
  K->>IDX: add txn indexer event
  K-->>MS: ack Tx
```

## Proposer Operations Flow

```mermaid
sequenceDiagram
  participant Proposer as Block Proposer (MemClob)
  participant Block as Proposed Block
  participant Validator as Validator Node
  participant K as Keeper

  Proposer->>Proposer: run matching engine -> produce OperationsQueue
  Proposer->>Block: include OperationsQueue in block txs
  Block->>Validator: broadcast block
  Validator->>K: DeliverTx(OperationRaw)
  K->>K: ValidateAndTransformRawOperations
  K->>K: ProcessInternalOperations (PersistMatchToState / PersistOrderRemovalToState)
  K->>Store: update fills, remove fully-filled orders
  K->>Indexer: emit block fill events
```

## ABCI Lifecycle Flow (CLOB-focused)

```mermaid
flowchart TD
  PreBlock[PreBlocker]
  BeginBlock[BeginBlocker]
  Deliver[DeliverTx (Msgs + ProposerOps)]
  EndBlock[EndBlocker]
  PrepareCheck[PrepareCheckState]
  Precommit[Precommit]
  Commit[Commit]

  PreBlock --> BeginBlock --> Deliver --> EndBlock --> PrepareCheck --> Precommit --> Commit

  subgraph notes
    note1[PreBlock: initialize memclob in-memory structures]
    note2[BeginBlock: reset ProcessProposerMatchesEvents, delivered order ids]
    note3[DeliverTx: Msg handlers (PlaceOrder) and proposer op processing (ProcessProposerOperations)]
    note4[EndBlock: expire orders, trigger conditional/TWAP suborders, stage finalize events]
    note5[PrepareCheckState: purge invalid mem state, place stateful orders, replay local ops, run liquidations/deleveraging]
    note6[Precommit: apply staged finalize-block side-effects, batch stream updates]
  end

  PreBlock --> note1
  BeginBlock --> note2
  Deliver --> note3
  EndBlock --> note4
  PrepareCheck --> note5
  Precommit --> note6
```

## Interactions Summary (short)

- `Keeper` validates and persists state, delegates high-throughput matching to `MemClob`.
- `MemClob` produces a deterministic operations queue for the proposer; operations are persisted by `Keeper` during DeliverTx on validators.
- Cross-keeper interactions: `subaccounts`, `vault`, `prices`, `perpetuals`, `feetiers`, `affiliates`, `revshare`, `rewards`, `stats`.

---

If you'd like, I can also generate a PlantUML sequence diagram, or export these Mermaid diagrams as standalone SVGs. Which format do you prefer? 
