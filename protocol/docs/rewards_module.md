# Rewards Module

## Overview

The Rewards module manages the distribution of trading rewards to users based on their trading activity. It calculates reward shares for makers and takers based on fees paid and distributes rewards from a treasury account at the end of each block. The module integrates with the CLOB module to track trading activity and with the prices module to determine reward token values.

## Contents

- [Rewards Module](#rewards-module)
  - [Overview](#overview)
  - [Contents](#contents)
  - [Concepts](#concepts)
    - [Reward Distribution](#reward-distribution)
    - [Reward Shares](#reward-shares)
    - [Fee Multiplier](#fee-multiplier)
  - [State](#state)
    - [RewardShare](#rewardshare)
    - [Params](#params)
  - [Messages](#messages)
    - [MsgUpdateParams](#msgupdateparams)
  - [Queries](#queries)
    - [Params](#params-1)
  - [Events](#events)
    - [TradingRewardsEvent](#tradingrewardsevent)
  - [Params](#params-2)
  - [Functions](#functions)
    - [Core Keeper Functions](#core-keeper-functions)
      - [ProcessRewardsForBlock](#processrewardsforblock)
      - [AddRewardSharesForFill](#addrewardsharesforfill)
      - [GetRewardShare](#getrewardshare)
  - [Integration with Other Modules](#integration-with-other-modules)
    - [CLOB](#clob)
    - [Prices](#prices)
    - [Bank](#bank)
    - [FeeTiers](#feetiers)

## Concepts

### Reward Distribution

The rewards module distributes tokens from a treasury account to traders based on their trading activity. At the end of each block, the module calculates the total reward weight from all traders and distributes rewards proportionally based on individual weights. The amount of rewards distributed is determined by the formula:

```bash
A = min(F, T)
```

Where:

- `A` is the amount of reward tokens to be distributed
- `F` = fee_multiplier *(total_positive_maker_fees + total_taker_fees - maximum_possible_maker_rebate* total_taker_volume) / reward_token_price
- `T` is the amount of available reward tokens in the treasury account

### Reward Shares

Each trader accumulates reward shares based on their trading activity. For each fill:

- Makers receive reward shares based on positive maker fees adjusted for revenue sharing
- Takers receive reward shares based on their net fees after deducting maximum possible rebates and affiliate fees

The reward share score for each address is calculated as:

```bash
reward_share_score = total_taker_fees_paid - max_possible_taker_fee_rev_share
  - max_possible_maker_rebate * taker_volume + total_positive_maker_fees - total_rev_shared_maker_fee
```

### Fee Multiplier

The fee multiplier parameter determines what percentage of collected fees are eligible for rewards. For example, with a fee multiplier of 0.99 (990,000 ppm), 99% of fees are eligible for rewards distribution.

## State

### RewardShare

Stores the relative weight of rewards that each address is entitled to.

```protobuf
message RewardShare {
  string address = 1;
  SerializableInt weight = 2;
}
```

### Params

Defines the parameters for the rewards module.

```protobuf
message Params {
  // The module account to distribute rewards from.
  string treasury_account = 1;
  
  // The denom of the rewards token.
  string denom = 2;
  
  // The exponent of converting one unit of `denom` to a full coin.
  // For example, `denom=uatom, denom_exponent=-6` defines that
  // `1 uatom = 10^(-6) ATOM`. This conversion is needed since the
  // `market_id` retrieves the price of a full coin of the reward token.
  int32 denom_exponent = 3;
  
  // The id of the market that has the price of the rewards token.
  uint32 market_id = 4;
  
  // The amount (in ppm) that fees are multiplied by to get
  // the maximum rewards amount.
  uint32 fee_multiplier_ppm = 5;
}
```

## Messages

### MsgUpdateParams

Updates the module parameters. Only authorized accounts can execute this message.

```protobuf
rpc UpdateParams(MsgUpdateParams) returns (MsgUpdateParamsResponse);
```

```protobuf
message MsgUpdateParams {
  string authority = 1;
  Params params = 2;
}
```

## Queries

### Params

Retrieves the current module parameters.

```protobuf
rpc Params(QueryParamsRequest) returns (QueryParamsResponse);
```

```protobuf
message QueryParamsRequest {}

message QueryParamsResponse {
  Params params = 1;
}
```

## Events

### TradingRewardsEvent

Emitted at the end of each block when rewards are distributed to traders.

```protobuf
message TradingRewardsEventV1 {
  repeated AddressTradingReward trading_rewards = 1;
}

message AddressTradingReward {
  string owner = 1;
  SerializableInt denom_amount = 2;
}
```

## Params

The rewards module has the following parameters:

| Key | Type | Example | Description |
| ----- | ------ | --------- | ------------- |
| treasury_account | string | "rewards_treasury" | The module account to distribute rewards from |
| denom | string | "dv4tnt" | The denomination of the rewards token |
| denom_exponent | int32 | -18 | The exponent for converting denom units to full coins |
| market_id | uint32 | 1 | The ID of the market used to price the rewards token |
| fee_multiplier_ppm | uint32 | 990000 | The percentage (in ppm) of fees eligible for rewards |

## Functions

### Core Keeper Functions

#### ProcessRewardsForBlock

Processes rewards distribution for all fills that happened in a block. Called at the end of each block.

```go
func (k Keeper) ProcessRewardsForBlock(ctx sdk.Context) error
```

#### AddRewardSharesForFill

Adds reward shares for the maker and taker of a fill. Called by the CLOB module when a fill is persisted.

```go
func (k Keeper) AddRewardSharesForFill(
  ctx sdk.Context,
  fill clobtypes.FillForProcess,
  revSharesForFill revsharetypes.RevSharesForFill,
)
```

#### GetRewardShare

Gets the reward share for a given address. Returns a default reward share with 0 weight if none exists.

```go
func (k Keeper) GetRewardShare(ctx sdk.Context, address string) (val types.RewardShare)
```

## Integration with Other Modules

### CLOB

The rewards module integrates with the CLOB module to track trading activity and calculate reward shares for fills. The CLOB module calls `AddRewardSharesForFill` when fills are processed.

### Prices

The rewards module uses the prices module to get the market price of the reward token, which is needed to convert fee amounts to reward token amounts.

### Bank

The rewards module uses the bank module to transfer reward tokens from the treasury account to trader accounts.

### FeeTiers

The rewards module uses the fee tiers module to get the lowest maker fee, which is used in calculating maximum possible maker rebates.
