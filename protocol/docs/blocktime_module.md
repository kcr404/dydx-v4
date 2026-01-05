# Blocktime Module

## Overview

The blocktime module tracks block timing information and detects network downtime periods. It maintains information about when blocks were produced and identifies extended periods without blocks, which can be used by other modules to detect network issues or adjust their behavior accordingly.

## Contents

- [Concepts](#concepts)
- [State](#state)
- [Keeper Methods](#keeper-methods)
- [Genesis](#genesis)
- [ABCI Handlers](#abci-handlers)
- [Integration](#integration)

## Concepts

### Block Timing Tracking

The blocktime module tracks the timing of block production to monitor network health. It records information about each block including its height and timestamp, and calculates the time interval between consecutive blocks.

### Downtime Detection

The module monitors for extended periods without block production, which could indicate network issues. It tracks downtime for configurable time periods (default: 5 minutes and 30 minutes) and records when the most recent downtime of each duration occurred.

### Block Time Metrics

The module reports block time metrics for monitoring purposes, including:

- Instantaneous block time between consecutive blocks
- Block time distribution by proposer
- Downtime information for various time windows

## State

### BlockInfo

Stores information about a specific block:

```protobuf
message BlockInfo {
  uint32 height = 1;
  google.protobuf.Timestamp timestamp = 2;
}
```

### AllDowntimeInfo

Maintains downtime information for all tracked durations:

```protobuf
message AllDowntimeInfo {
  repeated AllDowntimeInfo_DowntimeInfo infos = 1;
}

message AllDowntimeInfo_DowntimeInfo {
  google.protobuf.Duration duration = 1;
  BlockInfo block_info = 2;
}
```

### PreviousBlockInfo

Stores information about the previous block for calculating time intervals.

### AllDowntimeInfoKey

Key used to store the AllDowntimeInfo in the state store.

### PreviousBlockInfoKey

Key used to store the previous block's information.

## Keeper Methods

### GetPreviousBlockInfo

Retrieves information about the previous block:

```go
func (k Keeper) GetPreviousBlockInfo(ctx sdk.Context) types.BlockInfo
```

### SetPreviousBlockInfo

Stores information about the previous block:

```go
func (k Keeper) SetPreviousBlockInfo(ctx sdk.Context, info *types.BlockInfo)
```

### GetTimeSinceLastBlock

Calculates the time elapsed since the last block:

```go
func (k Keeper) GetTimeSinceLastBlock(ctx sdk.Context) time.Duration
```

### GetAllDowntimeInfo

Retrieves all tracked downtime information:

```go
func (k Keeper) GetAllDowntimeInfo(ctx sdk.Context) *types.AllDowntimeInfo
```

### SetAllDowntimeInfo

Stores all downtime information:

```go
func (k Keeper) SetAllDowntimeInfo(ctx sdk.Context, info *types.AllDowntimeInfo)
```

### UpdateAllDowntimeInfo

Updates downtime information based on the time elapsed since the previous block:

```go
func (k Keeper) UpdateAllDowntimeInfo(ctx sdk.Context)
```

### GetDowntimeInfoFor

Retrieves downtime information for a specific duration:

```go
func (k Keeper) GetDowntimeInfoFor(ctx sdk.Context, duration time.Duration) types.AllDowntimeInfo_DowntimeInfo
```

## Genesis

The genesis state initializes the downtime parameters:

```protobuf
message GenesisState {
  DowntimeParams params = 1;
}

message DowntimeParams {
  repeated google.protobuf.Duration durations = 1;
}
```

Default values:

- 5 minute downtime tracking
- 30 minute downtime tracking

## ABCI Handlers

### BeginBlock

Executes at the beginning of each block:

- Updates all downtime information based on the time elapsed since the previous block

```go
func (am AppModule) BeginBlock(ctx context.Context) error
```

### EndBlock

Executes at the end of each block:

- Stores information about the current block for use in the next block

```go
func (am AppModule) EndBlock(ctx context.Context) error
```

## Integration

### Dependencies

The blocktime module has minimal dependencies as it primarily tracks its own state.

### Integration Points

1. **Epochs Module**: May use downtime information for epoch boundary calculations
2. **Monitoring Systems**: Consumes block time metrics for network health monitoring
3. **Governance**: Downtime parameters can be updated through governance proposals

### Metrics

The module reports the following metrics:

- Block time in milliseconds
- Block time distribution by proposer
  