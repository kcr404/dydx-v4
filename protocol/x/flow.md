# Protocol/x — High-level Flow

This file describes the high-level runtime and message flow between modules under `protocol/x`.

1) External entry points
- Users submit transactions containing `Msg*` types (module-specific messages) via CLI/REST/gRPC.
- Each module exposes `MsgServer` implementations (registered in `module.go`) which validate and call keeper methods.

2) Message handling
- Msg -> Handler (MsgServer) -> Keeper
- Keeper performs state updates in the module KV store, may emit events, and may call other module keepers (injected in `NewAppModule`).

3) Cross-module interactions (typical examples)
- Trading/listing: `listing` registers markets and depends on `prices`, `clob`, `perpetuals`, and `vault` keepers to create and maintain markets.
- Order execution: `clob` processes orders, interacts with `subaccounts`/`accountplus` for balances, and with `vault` for collateral adjustments.
- Pricing: `prices` (oracle) updates feeds; `perpetuals` and `clob` read prices for margin/funding calculations.
- Fees & revenue: `feetiers` and `revshare` determine fee amounts and distribution; `rewards` may consume derived data to process block rewards.
- Delayed actions: `delaymsg` queues messages for later execution via EndBlocker processing.

4) Block lifecycle hooks
- BeginBlock: run periodic checks/maintenance (modules: `epochs`, `blocktime`, `vest`, `vault`, `clob` pre-block logic).
- EndBlock: finalize per-block state, scheduled tasks, and capacity/limits (modules: `ratelimit`, `delaymsg`, `rewards`, `stats`, `perpetuals`, `rewards`).

5) Events, Queries and CLI
- Modules emit events during message processing for indexing and subscriptions.
- Each module exposes a `QueryServer` (registered in `module.go`) and a CLI under `client/cli`.

6) Where to inspect flows in code
- Message definitions and handlers: `x/<module>/types` and `x/<module>/keeper`.
- Lifecycle implementations: `x/<module>/module.go` (wiring) and `x/<module>/*blocker.go` (Begin/End/Precommit implementations).

Sequence snapshot (simplified):
- User Tx -> `MsgCreateOrder` (clob) -> clob MsgServer -> keeper.PlaceOrder()
- keeper.PlaceOrder() -> check subaccount balances via `subaccounts` keeper -> lock funds in `vault` keeper -> emit events
- At block end -> `perpetuals` EndBlocker runs funding settlement -> `rewards` processes block rewards -> `stats` aggregates metrics

This document is intentionally brief — for exact call paths, inspect each module's `keeper` and `msg_server.go` / `handler.go` implementations.
