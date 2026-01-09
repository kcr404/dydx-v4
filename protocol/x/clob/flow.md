# CLOB Module — Detailed Flow

This document describes the internal architecture, data model, and runtime flows for the `clob` module. It focuses on how transactions and proposer operations move through the system, how the in-memory orderbook (`MemClob`) and on-chain state interact, and where cross-module interactions occur.

**Key source files referenced**
- `module.go` — module wiring and lifecycle registration.
- `abci.go` — `PreBlocker`, `BeginBlocker`, `Precommit`, `PrepareCheckState`, `EndBlocker` hooks.
- `keeper/keeper.go` — keeper construction, in-memory init, streaming and staged-finalize support.
- `keeper/msg_server_place_order.go` — `MsgPlaceOrder` handling entrypoint.
- `keeper/process_operations.go` — proposer-operations persistence and stateful processing.
- `memclob/orderbook.go` — in-memory orderbook, levels, adds/removes and expirations.

Overview
- The CLOB implementation is split into:
  - Keeper: on-chain state access, validation, persistence, and wiring to other keepers (vault, subaccounts, prices, affiliates, etc.). See `keeper/keeper.go`.
  - MemClob: in-memory orderbooks and matching logic used by block proposers to generate match operations and by non-proposers to replay operations. See `memclob/`.
  - MsgServer: message server implementations that route `Msg*` into keeper methods (e.g., `PlaceOrder`). See `keeper/msg_server*.go`.
  - ABCI hooks: `PreBlock`, `BeginBlock`, `PrepareCheckState`, `Precommit`, `EndBlock`, and `Commit` boundary behavior coordinated in `abci.go`.

Data model and in-memory structures
- On-chain persisted pieces:
  - Stateful orders and long-term order placements (prefixed keys; `types.StatefulOrderKeyPrefix`).
  - Order fill amounts (used to detect fully filled long-term orders).
  - `ProcessProposerMatchesEvents` state object that records what was delivered/removed/expired/triggered in a block and is used across lifecycle hooks.
- In-memory `MemClob`:
  - `Orderbook` per `ClobPairId` with `Bids`, `Asks`, `BestBid`, `BestAsk`.
  - Price-level `LevelOrders` linked lists and `orderIdToLevelOrder` map for O(1) removal.
  - `blockExpirationsForOrders` for short-term order expirations.
  - Local validator `operations queue` (matches and short-term placements) used to replay local txs and to create proposer operations.
- Streaming & Indexer:
  - Offchain `OffchainUpdates` emitted by memclob and sent to the `FullNodeStreamingManager` for snapshots and streaming updates.
  - Indexer events are staged and produced via `indexerEventManager` (transaction/block events).

Typical message/transaction flows

1) PlaceOrder (stateful)
- CLI/gRPC -> `MsgPlaceOrder` -> `keeper.NewMsgServerImpl` -> `msgServer.PlaceOrder`.
- `msgServer.PlaceOrder` unwraps context and calls `Keeper.HandleMsgPlaceOrder`.
- `HandleMsgPlaceOrder` (in `keeper/msg_server_place_order.go`) does:
  - Check transactions-level constraints (previous cancellations in block, duplicate removals).
  - Ensure order is stateful (not a short-term mempool-only order).
  - Calls `Keeper.PlaceStatefulOrder` which:
    - Performs stateful validations (format, time-in-force, price ticks, reduce-only logic, leverage constraints).
    - Performs collateralization check by consulting `vault`/`subaccounts` through injected keepers.
    - Writes the order placement into on-chain state (long-term/conditional placements) and into the memstore (memory store) for fast access.
    - Updates memclob in-memory structures when appropriate (through `MemClob` APIs).
  - Adds indexer txn events via `indexerEventManager` (different event types for conditional/TWAP/long-term placements).

Notes:
- Short-term orders are handled via the mempool/ante flow and are included in the operations queue rather than as on-chain stateful placements.
- Conditional and TWAP orders have specialized handling (triggering, suborders) and are placed through similar keeper helpers.

2) CancelOrders / BatchCancel
- Cancel transactions route to appropriate message handlers (see `keeper/msg_server_cancel*`).
- Cancel logic validates the cancellation, updates memstore delivered-cancelled-ids, and the operations queue will ensure memclob removes or ignores canceled orders during `PrepareCheckState` replay.

3) Proposer-generated operations (matching and short-term placements)
- The block proposer runs a matching engine (memclob) and produces a proposed operations queue (an ordered list of `OperationRaw` objects) containing:
  - `Match` operations (order matches, liquidation matches, deleveragings)
  - `ShortTermOrderPlacement` operations
  - `OrderRemoval` operations
- These operations are included in the block (via the proposal flow outside this module) as a payload that validators will process in `PrepareCheckState` / `ProcessProposerOperations`.

Proposer operations persistence and validation
- On `DeliverTx` for proposer-included operations, `Keeper.ProcessProposerOperations` is invoked (see `keeper/process_operations.go`). High-level steps:
  - `ValidateAndTransformRawOperations` performs stateless validation and decodes operations into internal representations.
  - `ProcessInternalOperations` performs stateful validation and writes operations to state by delegating to functions like `PersistMatchToState`, `PersistOrderRemovalToState`.
  - When a long-term order is fully filled due to persisted matches, the keeper removes its state and cleans up order fill amounts.
  - The keeper sets `ProcessProposerMatchesEvents` to record order ids filled/removed/expired in this block for use in the next lifecycle phases.

Detailed match persistence steps
- `PersistMatchToState` dispatches match kinds:
  - `MatchOrders` -> `PersistMatchOrdersToState` (handles maker/taker transfers, subaccount updates, event emission, fees and revshare interactions)
  - `MatchPerpetualLiquidation` and `MatchPerpetualDeleveraging` -> specialized persistence paths that interact with liquidation and deleveraging logic.
- Persistence updates: subaccount balances (via `bank`/`accountplus`), vault collateral adjustments, stats and rewards keeper calls, and indexer events for fills.

Lifecycle / ABCI hook sequencing and responsibilities
- PreBlock (abci.PreBlocker): initialize in-memory structures (`keeper.Initialize`) if not already hydrated.
- BeginBlock (abci.BeginBlocker): clear `ProcessProposerMatchesEvents` and reset delivered order ids for the new block.
- (During block) DeliverTx handlers process messages; also proposer-included operations are processed by `ProcessProposerOperations` when their txs are executed.
- EndBlock (abci.EndBlocker):
  - Prune state fill amounts for expired short-term orders.
  - Remove expired stateful orders and record `ExpiredStatefulOrderIds` in `ProcessProposerMatchesEvents`.
  - Generate & place TWAP suborders due this block.
  - Trigger conditional orders and record triggered conditional IDs to `ProcessProposerMatchesEvents`.
  - Write `ProcessProposerMatchesEvents` into state (so PrepareCheckState can see what happened this block).
- PrepareCheckState (abci.PrepareCheckState): executed while preparing the next block's check state; main responsibilities:
  - Remove local validator operations queue entries from memclob and purge invalid memclob state using the filled/expired/removed IDs from the previous block.
  - Place stateful orders that were included in the last block (post-only pass first, then full pass).
  - Replay local operations queue (short-term ops and local validator ops) onto memclob to update in-memory book for the upcoming proposer role.
  - Attempt liquidations/deleveraging for any subaccounts flagged by the daemon.
  - Gate withdrawals if negative TNCs remain.
  - Send offchain indexer and streaming updates (orderbook snapshots, fills, taker status updates).
- Precommit (abci.Precommit): process staged finalize-block events which perform side-effects that cannot be done in FinalizeBlock (e.g., creating memclob orderbooks). Also streams batch updates if streaming enabled.

Operations queue lifecycle and replay
- Each validator maintains a local operations queue of short-term placements and matches it wants to replay onto its memclob.
- `MemClob.GetOperationsToReplay` + `MemClob.RemoveAndClearOperationsQueue` are used to clear/replay during `PrepareCheckState`.
- Replays return `OffchainUpdates` that are sent to full-node streaming managers for watchers and used for indexer messages.

Inter-module interactions (keepers referenced by `clob` keeper)
- `subaccountsKeeper` — subaccount balances, open positions, insurance fund.
- `bankKeeper` / `accountPlusKeeper` — transfers and account operations.
- `perpetualsKeeper` and `pricesKeeper` — pricing, funding, and final settlement markets.
- `feeTiersKeeper`, `affiliatesKeeper`, `revshareKeeper`, `rewardsKeeper` — fees, affiliate overrides, revenue share and block-level rewards.
- `statsKeeper` — emit and aggregate statistical metrics about fills and order activity.

Rate limiting, authorization and ante checks
- The CLOB module uses a rate limiter for `Place`/`Cancel` flows (`placeCancelOrderRateLimiter`) and separate limiters for certain admin updates.
- The `Keeper` exposes an AnteHandler setter; `ProcessProposerOperations` uses the configured `antehandler` and `txDecoder` for stateless validation of raw operations.

Special features & edge cases
- Long-term orders: supported natively and persisted as stateful placements; fills tracked by per-order fill amounts stored on-chain.
- TWAP: long-term TWAP orders are split and placed over time by `GenerateAndPlaceTriggeredTwapSuborders`.
- Conditional orders: stored on-chain as untriggered; when triggered they are placed and included in `ProcessProposerMatchesEvents`.
- Liquidations/Deleveraging: processed in `PrepareCheckState` using daemon-provided lists and dedicated `PersistMatchLiquidationToState` handling.
- Finalize-block staging: creation of new `ClobPair` orderbooks or other side-effects are staged during block processing and applied in `Precommit` via `finalizeBlockEventStager` to avoid memclob visibility problems during consensus.

Testing hooks and recommended inspection points
- Unit & integration test locations in repo:
  - `x/clob/keeper/*_test.go` — validation of keeper persistence, matching, liquidations.
  - `x/clob/memclob/*_test.go` — memclob matching logic and orderbook behaviors.
  - `x/clob/e2e/*` — end-to-end scenarios that validate proposer operations, order matching and streaming.
- To trace a specific user flow locally follow these files in order:
  1. `client/cli/tx_place_order.go` (CLI entry)
  2. `keeper/msg_server_place_order.go` (Msg server handler)
  3. `keeper.PlaceStatefulOrder` (validation + state write)
  4. `keeper.InitMemClobOrderbooks` / `memclob.Orderbook` (in-memory placement)
  5. `memclob` proposer logic (produce operations queue) → proposer includes operations in block
  6. `keeper.ProcessProposerOperations` (persist matches/operations in DeliverTx)
  7. `abci.PrepareCheckState` (replay operations + place stateful order placements for next block)

Concluding notes
- The `clob` module uses a hybrid on-chain + in-memory design: long-lived orders and critical state are persisted, while the high-throughput matching and short-term orders are handled in-memory and propagated via an operations queue captured in the block. The keeper coordinates validation, cross-keeper interactions (vault/subaccounts/prices), event emission, and streaming.

If you want, I can:
- Produce a sequence diagram (PlantUML) for `PlaceOrder` → match → `ProcessProposerOperations` → `PrepareCheckState`.
- Extract concrete function call chains for `PersistMatchOrdersToState` or `PlaceStatefulOrder` with exact file/line references.
