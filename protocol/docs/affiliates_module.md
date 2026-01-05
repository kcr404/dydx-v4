# Affiliates Module

## Overview

The affiliates module manages the affiliate program for the dYdX v4 chain protocol. It enables users to register as affiliates and earn revenue share from the trading activity of referred users. The module calculates fee shares based on affiliate tiers determined by referred volume and staked tokens.

## Contents

- [Concepts](#concepts)
- [State](#state)
- [Keeper Methods](#keeper-methods)
- [Messages](#messages)
- [Genesis](#genesis)
- [Integration](#integration)

## Concepts

### Affiliate Program

The affiliates module implements a referral program where users can register as affiliates and earn a share of trading fees from users they refer. The program incentivizes community members to bring new traders to the platform.

### Affiliate Tiers

Affiliates are organized into tiers that determine their fee share percentage. Higher tiers offer greater revenue sharing but require meeting specific criteria:

1. Minimum referred trading volume (in USDC quote quantums)
2. Minimum staked native tokens (in whole coins)

The default tier structure is:

- Tier 0: 0 volume, 0 staked → 5% fee share
- Tier 1: 1M volume, 200 staked → 10% fee share
- Tier 2: 5M volume, 1K staked → 12.5% fee share
- Tier 3: 25M volume, 5K staked → 15% fee share
- Tier 4: 50M volume, 100M staked → 25% fee share

### Revenue Sharing Cap

To ensure protocol sustainability, the maximum fee share for affiliates is capped at 50% (500,000 ppm).

### Referee Benefits

Referred users automatically receive benefits based on affiliate program parameters:

- Minimum fee tier assignment (default: Tier 2)
- Volume attribution limits to prevent abuse

## State

### AffiliateTiers

Defines the tier structure for affiliates:

```protobuf
message AffiliateTiers {
  repeated AffiliateTiers_Tier tiers = 1;
}

message AffiliateTiers_Tier {
  uint64 req_referred_volume_quote_quantums = 1;
  uint32 req_staked_whole_coins = 2;
  uint32 taker_fee_share_ppm = 3;
}
```

### AffiliateParameters

Controls program parameters:

```protobuf
message AffiliateParameters {
  uint64 maximum_30d_attributable_volume_per_referred_user_quote_quantums = 1;
  uint32 referee_minimum_fee_tier_idx = 2;
  uint64 maximum_30d_affiliate_revenue_per_referred_user_quote_quantums = 3;
}
```

### AffiliateOverrides

Special whitelist for premium affiliates:

```protobuf
message AffiliateOverrides {
  repeated string addresses = 1;
}
```

### ReferredBy Mapping

Tracks referral relationships:

- Key: Referee address
- Value: Affiliate address

## Keeper Methods

### RegisterAffiliate

Registers an affiliate relationship between a referee and affiliate address.

```go
func (k Keeper) RegisterAffiliate(
    ctx sdk.Context,
    referee string,
    affiliateAddr string,
) error
```

Validations:

- Prevents self-referral
- Validates address formats
- Ensures referee isn't already registered
- Checks that affiliate tiers are configured

### GetReferredBy

Retrieves the affiliate address for a given referee.

```go
func (k Keeper) GetReferredBy(ctx sdk.Context, referee string) (string, bool)
```

### GetTierForAffiliate

Determines the tier level and fee share for an affiliate based on their performance metrics.

```go
func (k Keeper) GetTierForAffiliate(
    ctx sdk.Context,
    affiliateAddr string,
    affiliateOverrides map[string]bool,
) (tierLevel uint32, feeSharePpm uint32, err error)
```

The calculation considers:

1. Referred volume from the past 30 days (from stats module)
2. Currently staked native tokens
3. Override status for premium affiliates

### GetTakerFeeShare

Calculates the taker fee share for a user based on their affiliate relationship.

```go
func (k Keeper) GetTakerFeeShare(
    ctx sdk.Context,
    address string,
    affiliateOverrides map[string]bool,
) (affiliateAddress string, feeSharePpm uint32, exists bool, err error)
```

### UpdateAffiliateTiers

Updates the affiliate tier structure (typically via governance).

```go
func (k Keeper) UpdateAffiliateTiers(ctx sdk.Context, affiliateTiers types.AffiliateTiers) error
```

Validations:

- Fee shares cannot exceed the 50% cap
- Tier requirements must be strictly increasing

### UpdateAffiliateParameters

Updates program parameters (typically via governance).

```go
func (k Keeper) UpdateAffiliateParameters(
    ctx sdk.Context,
    msg *types.MsgUpdateAffiliateParameters,
) error
```

### AggregateAffiliateReferredVolumeForFills

Processes trading fills to update referred volume statistics at the end of each block.

```go
func (k Keeper) AggregateAffiliateReferredVolumeForFills(ctx sdk.Context) error
```

## Messages

### MsgRegisterAffiliate

Allows a user to register an affiliate relationship.

```protobuf
message MsgRegisterAffiliate {
  string referee = 1;
  string affiliate = 2;
}
```

### MsgUpdateAffiliateParameters

Updates affiliate program parameters (governance-only).

```protobuf
message MsgUpdateAffiliateParameters {
  string authority = 1;
  AffiliateParameters affiliate_parameters = 2;
}
```

## Genesis

The genesis state initializes the affiliate program with default tiers and parameters:

```protobuf
message GenesisState {
  AffiliateTiers affiliate_tiers = 1;
  AffiliateParameters affiliate_parameters = 2;
}
```

Default values:

- 5-tier structure with increasing requirements
- 100M USDC volume attribution limit per referred user
- Tier 2 as minimum for referees
- 10K USDC affiliate revenue cap per referred user

## Integration

### Dependencies

- **stats**: Retrieves referred volume and staking information
- **feetiers**: Sets minimum fee tiers for referees

### Integration Points

1. **CLOB Module**: Calls `AggregateAffiliateReferredVolumeForFills` at the end of each block to update statistics
2. **Fee Calculation**: Other modules call `GetTakerFeeShare` to determine fee distribution between protocol and affiliates
3. **Governance**: Parameters can be updated through governance proposals
4. **Indexer Events**: Emits registration events for off-chain tracking
