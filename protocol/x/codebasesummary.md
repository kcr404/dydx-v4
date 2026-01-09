# Protocol/x — Codebase Summary

This document summarizes the modules located in `protocol/x`, their primary responsibilities, key files, important types/keepers, and notable inter-module dependencies.

- **accountplus**: account-related enhancements. Key files: `module.go`, `keeper`, `types`. Exposes query/msg servers; no EndBlock logic. Used by modules that require enhanced account handling.
- **affiliates**: affiliate/referral program logic. Key files: `module.go`, `keeper`, `types`. Has EndBlocker logic; registers Msg & Query servers.
- **assets**: token/asset registry and metadata. Key files: `module.go`, `keeper`, `types`. Registers Msg & Query servers; used by market modules.
- **blocktime**: stores block timing and downtime info. Key files: `module.go`, `keeper`, `types`. Runs BeginBlock/EndBlock to track times.
- **bridge**: cross-chain bridging primitives. Key files: `module.go`, `keeper`, `types`. Registers Msg & Query servers.
- **clob**: central limit order book implementation. Key files: `module.go`, `keeper`, `types`, `client/cli`. Hooks into BeginBlock/Precommit/PreBlock/EndBlock — heavy lifecycle controller. Depends on `subaccounts`, `accountplus`, `bank` keepers.
- **delaymsg**: delayed message dispatching (queued messages). Key files: `module.go`, `keeper`, `types`. Provides Msg & Query and EndBlock processing for delayed dispatch.
- **epochs**: epoch management utilities. Key files: `module.go`, `keeper`, `types`. Executes epoch-related BeginBlock logic.
- **feetiers**: fee tiers configuration and lookup. Key files: `module.go`, `keeper`, `types`. Exposes Msg & Query servers; interacts with fee/revenue modules.
- **govplus**: governance extensions. Key files: `module.go`, `keeper`, `types`. Registers Msg & Query; EndBlock is noop.
- **listing**: market listing lifecycle (markets, market maps). Key files: `module.go`, `keeper`, `types`, `client/cli`. Depends on `prices`, `clob`, `perpetuals`, `vault` keepers.
- **perpetuals**: perpetual markets & funding logic. Key files: `module.go`, `keeper`, `types`. Executes EndBlocker for funding/settlement and exposes Msg/Query.
- **prices**: oracle / price ingestion and query. Key files: `module.go`, `keeper`, `types`. Registers Msg/Query; depends on `revshare`, `marketMap` and account/bank keepers.
- **ratelimit**: rate limiting for actions (capacities). Key files: `module.go`, `keeper`, `types`. Runs EndBlocker to update capacities.
- **revshare**: revenue-share accounting and configuration. Key files: `module.go`, `keeper`, `types`. Registers Msg/Query.
- **rewards**: block-level rewards processing. Key files: `module.go`, `keeper`, `types`. EndBlock computes and processes per-block rewards.
- **sending**: on-chain transfer helper logic. Key files: `module.go`, `keeper`, `types`. Depends on `accountplus`, `bank`, and `subaccounts` keepers.
- **stats**: block/event statistics aggregation. Key files: `module.go`, `keeper`, `types`. EndBlock processes and expires stats.
- **subaccounts**: subaccount management for users (e.g., margin accounts). Key files: `module.go`, `keeper`, `types`. Provides queries and init genesis.
- **vault**: collateral, margin, and vault bookkeeping. Key files: `module.go`, `keeper`, `types`. Hooks into BeginBlock/EndBlock for maintenance.
- **vest**: vesting schedules and processing. Key files: `module.go`, `keeper`, `types`. BeginBlock runs vesting processing.

Notes:
- Each module follows the Cosmos SDK module pattern: `AppModuleBasic` (codec/cli/query) + `AppModule` (keeper wiring, lifecycle hooks, service registration).
- Check each module's `types` and `keeper` packages for concrete message types (`Msg*`), keeper APIs, and store keys.
- Cross-module dependencies are declared in `NewAppModule` signatures (keepers injected). These are the primary integration points.

Where to look next:
- Per-module `keeper` and `types` directories for message definitions and business logic.
- Lifecycle functions: `BeginBlocker`, `EndBlocker`, `InitGenesis` in each module for runtime behaviour.
