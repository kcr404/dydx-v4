# Epochs Module

## Overview

The epochs module provides a time-based scheduling system for periodic operations in the dYdX v4 chain protocol. It manages epoch timers that trigger at regular intervals, enabling modules to perform scheduled tasks such as funding calculations, statistics aggregation, and reward distributions.

## Contents

- [Concepts](#concepts)
- [State](#state)
- [Keeper Methods](#keeper-methods)
- [Genesis](#genesis)
- [ABCI Handlers](#abci-handlers)
- [Integration](#integration)

## Concepts

### Epochs

An epoch is a recurring time interval that triggers specific actions in the protocol. Each epoch has a defined duration and tracks when the next occurrence will happen. Epochs are used throughout the protocol for time-based operations.

### Epoch Initialization

Epochs are initialized when the blockchain reaches a specific time threshold. During initialization, the epoch's next tick time is calculated based on its duration and fast-forward settings. This ensures epochs align properly with wall-clock time.

### Fast Forwarding

Epochs can be configured to fast-forward their next tick time to align with the current block time. This is useful for ensuring epochs start at appropriate times relative to real-world time rather than genesis time.

### Predefined Epochs

The protocol includes several predefined epochs:

- **Funding Tick**: Hourly epoch for perpetual funding calculations
- **Funding Sample**: Minute-level epoch for sampling funding rates
- **Stats Epoch**: Hourly epoch for statistics aggregation

## State

### EpochInfo

Stores metadata for an epoch timer:

```protobuf
message EpochInfo {
  string name = 1;
  uint32 next_tick = 2;
  uint32 duration = 3;
  uint32 current_epoch = 4;
  uint32 current_epoch_start_block = 5;
  bool is_initialized = 6;
  bool fast_forward_next_tick = 7;
}
```

Fields:

- `name`: Unique identifier for the epoch
- `next_tick`: Unix timestamp (seconds) when the next epoch starts
- `duration`: Duration of the epoch in seconds
- `current_epoch`: Number of the current epoch (0 if not yet started)
- `current_epoch_start_block`: Block height when the current epoch started
- `is_initialized`: Whether the epoch has been initialized
- `fast_forward_next_tick`: Whether to fast-forward next_tick during initialization

## Keeper Methods

### MaybeStartNextEpoch

Initializes and/or advances an epoch if conditions are met:

```go
func (k Keeper) MaybeStartNextEpoch(ctx sdk.Context, id types.EpochInfoName) (nextEpochStarted bool, err error)
```

This method:

1. Initializes epochs that meet initialization criteria
2. Advances epochs whose next tick time has been reached
3. Emits events when epochs start
4. Updates metrics for epoch tracking

### CreateEpochInfo

Creates a new epoch:

```go
func (k Keeper) CreateEpochInfo(ctx sdk.Context, epochInfo types.EpochInfo) error
```

Validates and stores a new epoch, ensuring no duplicates exist.

### GetEpochInfo

Retrieves an epoch by name:

```go
func (k Keeper) GetEpochInfo(ctx sdk.Context, id types.EpochInfoName) (val types.EpochInfo, found bool)
```

### GetAllEpochInfo

Retrieves all epochs:

```go
func (k Keeper) GetAllEpochInfo(ctx sdk.Context) (list []types.EpochInfo)
```

### NumBlocksSinceEpochStart

Calculates the number of blocks since an epoch started:

```go
func (k Keeper) NumBlocksSinceEpochStart(ctx sdk.Context, id types.EpochInfoName) (uint32, error)
```

Helper methods for specific epochs:

- `MustGetFundingTickEpochInfo`: Retrieves the funding tick epoch
- `MustGetFundingSampleEpochInfo`: Retrieves the funding sample epoch
- `MustGetStatsEpochInfo`: Retrieves the stats epoch

## Genesis

The genesis state initializes predefined epochs:

```protobuf
message GenesisState {
  repeated EpochInfo epoch_info_list = 1;
}
```

Default epochs:

1. **Funding Tick**:
   - Name: "funding-tick"
   - Duration: 3600 seconds (1 hour)
   - Fast forwards to align with hourly boundaries

2. **Funding Sample**:
   - Name: "funding-sample"
   - Duration: 60 seconds (1 minute)
   - Next tick: 30 seconds past the minute
   - Fast forwards to align with minute boundaries

3. **Stats Epoch**:
   - Name: "stats-epoch"
   - Duration: 3600 seconds (1 hour)
   - Fast forwards to align with hourly boundaries

## ABCI Handlers

### BeginBlock

Executes at the beginning of each block:

- Checks all epochs to see if any need to be initialized or advanced
- Calls `MaybeStartNextEpoch` for each epoch

```go
func BeginBlocker(ctx sdk.Context, keeper keeper.Keeper)
```

## Integration

### Dependencies

The epochs module has minimal dependencies as it primarily manages its own state.

### Integration Points

1. **Perpetuals Module**:
   - Uses funding tick and sample epochs for funding rate calculations

2. **Stats Module**:
   - Uses stats epoch for periodic statistics aggregation

3. **Rewards Module**:
   - Uses epochs for reward distribution timing

4. **Vault Module**:
   - Uses epochs for vault operation timing

5. **Vest Module**:
   - Uses epochs for vesting schedule calculations

### Events

The module emits events when epochs start:

- `EventTypeNewEpoch`: Indicates a new epoch has begun
- Contains attributes for epoch name and number

### Metrics

The module reports metrics:

- Current epoch number for each epoch type
