# Fee Tiers Module

## Overview

The Fee Tiers module manages trading fee structures for the dYdX v4 chain protocol. It implements a tiered fee system where users can qualify for lower fees based on their trading volume and staking activity. The module also supports market-specific fee discounts and integrates with the staking system to provide additional fee reductions for users who stake tokens.

## Contents

- [Fee Tiers Module](#fee-tiers-module)
  - [Overview](#overview)
  - [Contents](#contents)
  - [Concepts](#concepts)
    - [Fee Tiers](#fee-tiers)
    - [Per-Market Fee Discounts](#per-market-fee-discounts)
    - [Staking-Based Fee Discounts](#staking-based-fee-discounts)
  - [State](#state)
    - [PerpetualFeeParams](#perpetualfeeparams)
    - [PerpetualFeeTier](#perpetualfeetier)
    - [PerMarketFeeDiscountParams](#permarketfeediscountparams)
    - [StakingTier](#stakingtier)
    - [StakingLevel](#stakinglevel)
  - [Messages](#messages)
    - [MsgUpdatePerpetualFeeParams](#msgupdateperpetualfeeparams)
    - [MsgSetMarketFeeDiscountParams](#msgsetmarketfeediscountparams)
    - [MsgSetStakingTiers](#msgsetstakingtiers)
  - [Queries](#queries)
    - [PerpetualFeeParams (Query)](#perpetualfeeparams-query)
    - [UserFeeTier](#userfeetier)
    - [PerMarketFeeDiscountParams (Query)](#permarketfeediscountparams-query)
    - [AllMarketFeeDiscountParams](#allmarketfeediscountparams)
    - [StakingTiers (Query)](#stakingtiers-query)
    - [UserStakingTier](#userstakingtier)
  - [Events](#events)
  - [Functions](#functions)
    - [Core Keeper Functions](#core-keeper-functions)
      - [GetPerpetualFeePpm](#getperpetualfeeppm)
      - [GetUserFeeTier](#getuserfeetier)
      - [GetStakingDiscountPpm](#getstakingdiscountppm)
      - [GetDiscountedPpm](#getdiscountedppm)
  - [CLI Commands](#cli-commands)
    - [Query Commands](#query-commands)
      - [`get-perpetual-fee-params`](#get-perpetual-fee-params)
      - [`get-user-fee-tier [address]`](#get-user-fee-tier-address)
      - [`get-market-fee-discount-params [clob_pair_id]`](#get-market-fee-discount-params-clob_pair_id)
      - [`staking-tiers`](#staking-tiers)
      - [`user-staking-tier [address]`](#user-staking-tier-address)
    - [Transaction Commands](#transaction-commands)
  - [Integration with Other Modules](#integration-with-other-modules)
    - [CLOB](#clob)
    - [Stats](#stats)
    - [Vault](#vault)
    - [Affiliates](#affiliates)

## Concepts

### Fee Tiers

The Fee Tiers module implements a progressive fee structure where users advance through different fee tiers based on their trading volume. Each tier has specific requirements for absolute trading volume and share of total platform volume. Higher tiers offer better (lower) maker and taker fees.

Users advance through tiers based on:

- Absolute volume traded (maker + taker)
- Share of total platform volume
- Share of maker volume specifically

Vaults are automatically placed in the highest tier regardless of their trading volume.

### Per-Market Fee Discounts

The module supports temporary fee discounts for specific markets/CLOB pairs. These discounts can be scheduled with start and end times, and define a percentage of the normal fee to charge during the discount period. This allows the protocol to offer promotions or reduce fees for specific markets as needed.

### Staking-Based Fee Discounts

In addition to volume-based fee tiers, users can receive additional fee discounts based on their staking activity. Each fee tier can have associated staking requirements, where users who stake more tokens receive higher percentage discounts on their fees. This creates an incentive for users to stake tokens while providing additional fee reductions for active participants.

## State

### PerpetualFeeParams

The primary parameters governing the fee tier system.

```protobuf
message PerpetualFeeParams {
  repeated PerpetualFeeTier tiers = 1;
}
```

### PerpetualFeeTier

Defines a single fee tier with its requirements and fee rates.

```protobuf
message PerpetualFeeTier {
  string name = 1;
  uint64 absolute_volume_requirement = 2;
  uint32 total_volume_share_requirement_ppm = 3;
  uint32 maker_volume_share_requirement_ppm = 4;
  int32 maker_fee_ppm = 5;
  int32 taker_fee_ppm = 6;
}
```

Fields:

- `name`: Human-readable name for the tier
- `absolute_volume_requirement`: Minimum total volume (maker+taker) in quote quantums
- `total_volume_share_requirement_ppm`: Minimum share of total platform volume (in parts per million)
- `maker_volume_share_requirement_ppm`: Minimum share of total maker volume (in parts per million)
- `maker_fee_ppm`: Maker fee rate (in parts per million, can be negative for rebates)
- `taker_fee_ppm`: Taker fee rate (in parts per million)

### PerMarketFeeDiscountParams

Defines fee discount parameters for a specific market/CLOB pair.

```protobuf
message PerMarketFeeDiscountParams {
  uint32 clob_pair_id = 1;
  google.protobuf.Timestamp start_time = 2;
  google.protobuf.Timestamp end_time = 3;
  uint32 charge_ppm = 4;
}
```

Fields:

- `clob_pair_id`: The CLOB pair ID this discount applies to
- `start_time`: When the discount period begins
- `end_time`: When the discount period ends
- `charge_ppm`: Percentage of normal fee to charge during the period (in parts per million)
  - 0 = completely free (100% discount)
  - 500,000 = charge 50% of normal fee (50% discount)
  - 1,000,000 = charge 100% of normal fee (no discount)

### StakingTier

Defines staking-based fee discounts for a specific fee tier.

```protobuf
message StakingTier {
  string fee_tier_name = 1;
  repeated StakingLevel levels = 2;
}
```

Fields:

- `fee_tier_name`: Name of the fee tier this staking tier corresponds to
- `levels`: List of staking levels with increasing discount percentages

### StakingLevel

Defines a specific staking level with its requirements and discount.

```protobuf
message StakingLevel {
  github_com_dydxprotocol_v4_chain_protocol_dtypes.SerializableInt min_staked_base_tokens = 1;
  uint32 fee_discount_ppm = 2;
}
```

Fields:

- `min_staked_base_tokens`: Minimum amount of staked tokens required for this level
- `fee_discount_ppm`: Fee discount percentage at this level (in parts per million)

## Messages

### MsgUpdatePerpetualFeeParams

Updates the perpetual fee parameters, including all fee tiers.

```protobuf
rpc UpdatePerpetualFeeParams(MsgUpdatePerpetualFeeParams) returns (MsgUpdatePerpetualFeeParamsResponse);
```

Fields:

- `authority`: The address authorized to make this change (typically governance)
- `params`: The new perpetual fee parameters

### MsgSetMarketFeeDiscountParams

Sets or updates fee discount parameters for specific CLOB pairs.

```protobuf
rpc SetMarketFeeDiscountParams(MsgSetMarketFeeDiscountParams) returns (MsgSetMarketFeeDiscountParamsResponse);
```

Fields:

- `authority`: The address authorized to make this change (typically governance)
- `params`: List of per-market fee discount parameters to set/update

### MsgSetStakingTiers

Sets the staking tiers in state.

```protobuf
rpc SetStakingTiers(MsgSetStakingTiers) returns (MsgSetStakingTiersResponse);
```

Fields:

- `authority`: The address authorized to make this change (typically governance)
- `staking_tiers`: List of staking tiers to set

## Queries

### PerpetualFeeParams (Query)

Retrieves the current perpetual fee parameters.

```protobuf
rpc PerpetualFeeParams(QueryPerpetualFeeParamsRequest) returns (QueryPerpetualFeeParamsResponse);
```

### UserFeeTier

Retrieves a user's current fee tier based on their trading volume.

```protobuf
rpc UserFeeTier(QueryUserFeeTierRequest) returns (QueryUserFeeTierResponse);
```

Request Fields:

- `user`: The user's address

Response Fields:

- `index`: Index of the fee tier in the list queried from PerpetualFeeParams
- `tier`: The actual fee tier object

### PerMarketFeeDiscountParams (Query)

Queries fee discount parameters for a specific market/CLOB pair.

```protobuf
rpc PerMarketFeeDiscountParams(QueryPerMarketFeeDiscountParamsRequest) returns (QueryPerMarketFeeDiscountParamsResponse);
```

Request Fields:

- `clob_pair_id`: The CLOB pair ID to query

### AllMarketFeeDiscountParams

Queries all per-market fee discount parameters.

```protobuf
rpc AllMarketFeeDiscountParams(QueryAllMarketFeeDiscountParamsRequest) returns (QueryAllMarketFeeDiscountParamsResponse);
```

### StakingTiers (Query)

Gets all staking tiers.

```protobuf
rpc StakingTiers(QueryStakingTiersRequest) returns (QueryStakingTiersResponse);
```

### UserStakingTier

Gets a user's current staked amount and staking tier.

```protobuf
rpc UserStakingTier(QueryUserStakingTierRequest) returns (QueryUserStakingTierResponse);
```

Request Fields:

- `address`: The user's address

Response Fields:

- `fee_tier_name`: The user's current fee tier name
- `staked_base_tokens`: Amount of tokens staked by the user (in base units)
- `discount_ppm`: The discount percentage in ppm that user qualifies for

## Events

The Fee Tiers module does not emit any events directly. Fee-related events are emitted by other modules such as CLOB when trades occur.

## Functions

### Core Keeper Functions

#### GetPerpetualFeePpm

Calculates the fee PPM (parts per million) for a user based on their fee tier, staking status, and any applicable market discounts.

```go
func (k Keeper) GetPerpetualFeePpm(
  ctx sdk.Context,
  address string,
  isTaker bool,
  feeTierOverrideIdx uint32,
  clobPairId uint32,
) int32
```

#### GetUserFeeTier

Determines a user's fee tier based on their trading volume statistics.

```go
func (k Keeper) getUserFeeTier(
  ctx sdk.Context,
  address string,
  feeTierOverrideIdx uint32,
) (uint32, *types.PerpetualFeeTier)
```

#### GetStakingDiscountPpm

Returns the maximum discount (in PPM) that a given amount of staked tokens qualifies for in the specified fee tier.

```go
func (k Keeper) GetStakingDiscountPpm(ctx sdk.Context, feeTierName string, stakedBaseTokens *big.Int) uint32
```

#### GetDiscountedPpm

Returns the charge PPM (parts per million) for a CLOB pair, applying any active fee discounts.

```go
func (k Keeper) GetDiscountedPpm(
  ctx sdk.Context,
  clobPairId uint32,
) uint32
```

## CLI Commands

### Query Commands

#### `get-perpetual-fee-params`

Get the PerpetualFeeParams.

Usage:

```bash
dydxprotocold query feetiers get-perpetual-fee-params
```

#### `get-user-fee-tier [address]`

Get the fee tier of a User.

Usage:

```bash
dydxprotocold query feetiers get-user-fee-tier tradeview1...
```

#### `get-market-fee-discount-params [clob_pair_id]`

Get the fee discount parameters for all markets or a specific CLOB pair.

Usage:

```bash
dydxprotocold query feetiers get-market-fee-discount-params
dydxprotocold query feetiers get-market-fee-discount-params 1
```

#### `staking-tiers`

Get all staking tiers.

Usage:

```bash
dydxprotocold query feetiers staking-tiers
```

#### `user-staking-tier [address]`

Get the staking tier and discount of a user.

Usage:

```bash
dydxprotocold query feetiers user-staking-tier tradeview1...
```

### Transaction Commands

The Fee Tiers module does not currently expose any CLI transaction commands. Fee parameter updates are performed through governance proposals.

## Integration with Other Modules

### CLOB

The Fee Tiers module integrates with the CLOB module to calculate fees for trades. When orders are filled, the CLOB module queries the Fee Tiers module to determine the appropriate fee rate for each user based on their tier, staking status, and any applicable market discounts.

### Stats

The Fee Tiers module relies on the Stats module to track user trading volumes. It queries user and global statistics to determine which fee tier a user qualifies for based on their trading activity.

### Vault

The Fee Tiers module recognizes vault addresses and automatically places them in the highest fee tier, ensuring vaults always receive the best available rates.

### Affiliates

The Fee Tiers module integrates with the Affiliates module to provide special fee treatment for referees. Referees may qualify for fee tier overrides based on their referral status.
