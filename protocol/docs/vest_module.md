# `x/vest`

## Overview

The vest module manages token vesting schedules on the dYdX chain. It allows for the creation of vesting entries that define how tokens are transferred from a vester account to a treasury account over time. The module automatically processes vesting events in the BeginBlocker based on predefined schedules.

## Concepts

### Vest Entries

A VestEntry defines a vesting schedule that specifies how tokens are transferred from a vester account to a treasury account over time. Each vest entry contains:

- `VesterAccount`: The module account to vest tokens from
- `TreasuryAccount`: The module account to vest tokens to
- `Denom`: The denomination of the token to vest
- `StartTime`: The start time of vesting (before this time, no vest occurs)
- `EndTime`: The end time of vesting (at this time, all funds should be in the treasury account)

### Vesting Process

The vesting process runs automatically in the BeginBlocker. For each vest entry, the module:

1. Skips processing if `block_time <= vest_entry.start_time` (vesting has not started yet)
2. Skips processing if `prev_block_time >= vest_entry.end_time` (vesting has ended)
3. Transfers tokens based on the formula:

   ```go
   vest_amount = min((block_time - last_vest_time) / (end_time - last_vest_time), 1) * vester_account_balance
   ```

   where `last_vest_time = max(start_time, prev_block_time)`

## State

The vest module maintains vest entries in state using the following structure:

### VestEntry

Each vest entry is stored with the vester account as the key.

Key: `VestEntryKeyPrefix + vester_account`
Value: `VestEntry`

Structure:

```protobuf
message VestEntry {
  // The module account to vest tokens from.
  // This is also the key to this `VestEntry` in state.
  string vester_account = 1;
  // The module account to vest tokens to.
  string treasury_account = 2;
  // The denom of the token to vest.
  string denom = 3;
  // The start time of vest. Before this time, no vest will occur.
  google.protobuf.Timestamp start_time = 4;
  // The end time of vest. At this target date, all funds should be in the
  // Treasury Account and none left in the Vester Account.
  google.protobuf.Timestamp end_time = 5;
}
```

## Messages

### `MsgSetVestEntry`

Sets a VestEntry in state.

```protobuf
message MsgSetVestEntry {
  // authority is the address that controls the module.
  string authority = 1;
  // The vest entry to set.
  VestEntry entry = 2;
}
```

Fields:

- `authority`: The authority address (must be in the module's authority list)
- `entry`: The vest entry to set

### `MsgDeleteVestEntry`

Deletes a VestEntry from state.

```protobuf
message MsgDeleteVestEntry {
  // authority is the address that controls the module.
  string authority = 1;
  // The vester account of the vest entry to delete.
  string vester_account = 2;
}
```

Fields:

- `authority`: The authority address (must be in the module's authority list)
- `vester_account`: The vester account of the vest entry to delete

## Queries

### `VestEntry`

Queries a specific VestEntry by vester account.

```protobuf
message QueryVestEntryRequest {
  string vester_account = 1;
}
```

Response:

```protobuf
message QueryVestEntryResponse {
  VestEntry entry = 1;
}
```

## Client

### CLI

#### Query Commands

To query a vest entry:

```bash
dydxprotocold query vest vest-entry [vester-account]
```

## Events

The vest module emits telemetry metrics during the vesting process:

- `vest_amount`: Reports the amount of tokens vested for each vester account
- `balance_after_vest_event`: Reports the vester account balance after a vest event

## Params

The vest module does not have traditional parameters. Instead, vesting schedules are managed through individual VestEntry records that can be added or removed via governance proposals.

## Keeper Methods

### State Management

- `GetVestEntry(ctx sdk.Context, vesterAccount string) (VestEntry, error)`: Gets a vest entry by vester account
- `SetVestEntry(ctx sdk.Context, entry VestEntry) error`: Sets a vest entry in state
- `DeleteVestEntry(ctx sdk.Context, vesterAccount string) error`: Deletes a vest entry from state
- `GetAllVestEntries(ctx sdk.Context) []VestEntry`: Gets all vest entries

### Vesting Processing

- `ProcessVesting(ctx sdk.Context)`: Processes vesting for all vest entries (called in BeginBlocker)

## Genesis

The vest module's genesis state contains a list of initial vest entries:

```protobuf
message GenesisState {
  repeated VestEntry vest_entries = 1;
}
```

Default genesis includes vest entries for:

- Community vester to community treasury
- Rewards vester to rewards treasury

Both vesting schedules run from January 1, 2023 to January 1, 2025.
