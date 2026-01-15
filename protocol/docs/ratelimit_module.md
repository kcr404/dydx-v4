# Rate Limit Module

## Overview

The Rate Limit module implements token withdrawal rate limiting for the dYdX v4 chain protocol. It prevents excessive outbound transfers of specific token denominations by tracking withdrawal capacity over time and limiting transfers when capacity thresholds are exceeded. The module primarily focuses on IBC transfers and integrates with the IBC middleware to monitor and control token flows between chains.

## Contents

- [Rate Limit Module](#rate-limit-module)
  - [Overview](#overview)
  - [Contents](#contents)
  - [Concepts](#concepts)
    - [Rate Limiting](#rate-limiting)
    - [Capacity Tracking](#capacity-tracking)
    - [Baseline Calculation](#baseline-calculation)
  - [State](#state)
    - [LimitParams](#limitparams)
    - [DenomCapacity](#denomcapacity)
    - [PendingSendPacket](#pendingsendpacket)
  - [Messages](#messages)
    - [MsgSetLimitParams](#msgsetlimitparams)
  - [Queries](#queries)
    - [ListLimitParams](#listlimitparams)
    - [CapacityByDenom](#capacitybydenom)
    - [AllPendingSendPackets](#allpendingsendpackets)
  - [Events](#events)
  - [Params](#params)
  - [Functions](#functions)
    - [Core Keeper Functions](#core-keeper-functions)
      - [ProcessWithdrawal](#processwithdrawal)
      - [UndoWithdrawal](#undowithdrawal)
      - [IncrementCapacitiesForDenom](#incrementcapacitiesfordenom)
      - [SetLimitParams](#setlimitparams)
      - [UpdateAllCapacitiesEndBlocker](#updateallcapacitiesendblocker)
  - [Integration with Other Modules](#integration-with-other-modules)
    - [IBC Transfer Module](#ibc-transfer-module)
    - [Bank Module](#bank-module)

## Concepts

### Rate Limiting

The rate limit module controls outbound token transfers by maintaining capacity limits for specific denominations. When a transfer is initiated, the module checks if sufficient capacity exists. If not, the transfer is blocked. Capacity recovers over time toward a baseline value, allowing for controlled token outflows.

### Capacity Tracking

Each rate-limited denomination maintains a capacity list that tracks available withdrawal capacity for each configured limiter. When tokens are withdrawn, capacity decreases. When tokens are deposited or time passes, capacity increases toward baseline values.

### Baseline Calculation

The baseline represents the target capacity level for a denomination, calculated as the maximum of:

1. A fixed minimum baseline value
2. A percentage of the total token supply (in parts per million)

This ensures that capacity scales with the total token supply while maintaining a minimum threshold.

## State

### LimitParams

Defines the rate limit parameters for a specific token denomination, including multiple limiters with different time periods and baseline calculations.

```protobuf
message LimitParams {
  string denom = 1;
  repeated Limiter limiters = 2;
}

message Limiter {
  google.protobuf.Duration period = 1;
  bytes baseline_minimum = 2;
  uint32 baseline_tvl_ppm = 3;
}
```

### DenomCapacity

Tracks the current available capacity for withdrawals of a specific denomination across all configured limiters.

```protobuf
message DenomCapacity {
  string denom = 1;
  repeated github_com_dydxprotocol_v4_chain_protocol_dtypes.SerializableInt capacity_list = 2;
}
```

### PendingSendPacket

Tracks IBC packet sequences that are pending acknowledgment or timeout, allowing the module to revert capacity changes if transfers fail.

```protobuf
message PendingSendPacket {
  string channel_id = 1;
  uint64 sequence = 2;
}
```

## Messages

### MsgSetLimitParams

Sets or updates the rate limit parameters for a specific denomination. This message can only be executed by authorized accounts.

```protobuf
rpc SetLimitParams(MsgSetLimitParams) returns (MsgSetLimitParamsResponse);
```

## Queries

### ListLimitParams

Returns all configured rate limit parameters.

```protobuf
rpc ListLimitParams(ListLimitParamsRequest) returns (ListLimitParamsResponse);
```

### CapacityByDenom

Returns the current capacity information for a specific denomination.

```protobuf
rpc CapacityByDenom(QueryCapacityByDenomRequest) returns (QueryCapacityByDenomResponse);
```

### AllPendingSendPackets

Returns all pending IBC send packets that are being tracked by the rate limit module.

```protobuf
rpc AllPendingSendPackets(QueryAllPendingSendPacketsRequest) returns (QueryAllPendingSendPacketsResponse);
```

## Events

The rate limit module does not emit any specific events.

## Params

The rate limit module does not have any governance-modifiable parameters beyond the limit parameters set via messages.

```protobuf
message Params {
  // No parameters defined
}
```

## Functions

### Core Keeper Functions

#### ProcessWithdrawal

Processes an outbound IBC transfer by checking and decreasing the capacity for the transferred denomination. Returns an error if insufficient capacity exists.

```go
func (k Keeper) ProcessWithdrawal(ctx sdk.Context, denom string, amount *big.Int) error
```

#### UndoWithdrawal

Reverts a previously processed withdrawal by increasing the capacity for the denomination. Used when IBC transfers fail or timeout.

```go
func (k Keeper) UndoWithdrawal(ctx sdk.Context, denom string, amount *big.Int)
```

#### IncrementCapacitiesForDenom

Processes an inbound IBC transfer by increasing the capacity for the received denomination.

```go
func (k Keeper) IncrementCapacitiesForDenom(ctx sdk.Context, denom string, amount *big.Int)
```

#### SetLimitParams

Sets or updates the rate limit parameters for a specific denomination, initializing capacity values based on current token supply.

```go
func (k Keeper) SetLimitParams(ctx sdk.Context, limitParams types.LimitParams) (err error)
```

#### UpdateAllCapacitiesEndBlocker

Called at the end of each block to update all capacity values toward their baseline levels based on elapsed time.

```go
func (k Keeper) UpdateAllCapacitiesEndBlocker(ctx sdk.Context)
```

## Integration with Other Modules

### IBC Transfer Module

The rate limit module integrates with the IBC transfer module through middleware to intercept and control IBC packet transfers. It monitors outgoing transfers to enforce capacity limits and incoming transfers to increase capacity.

### Bank Module

The rate limit module queries the bank module to determine current token supplies for baseline calculations and to validate token denominations.
