# Perpetuals Module

The perpetuals module manages perpetual contracts on the dYdX v4 chain. Perpetual contracts are financial derivatives that track the price of an underlying asset without an expiration date. This module handles the creation, management, and funding calculations for perpetual contracts.

## Overview

The perpetuals module is responsible for:

1. Managing perpetual contract definitions and parameters
2. Handling liquidity tiers for risk management
3. Calculating and processing funding payments
4. Tracking open interest for each perpetual
5. Managing funding indices for position valuation

## Key Concepts

### Perpetual Contracts

A perpetual contract is a derivative instrument that tracks the price of an underlying asset without an expiration date. Each perpetual has the following key properties:

- **Ticker**: A human-readable identifier (e.g., BTC-USD)
- **Market ID**: References the oracle market for price data
- **Atomic Resolution**: Defines the smallest unit of the perpetual
- **Default Funding PPM**: Base funding rate in parts-per-million
- **Liquidity Tier**: Risk category that determines margin requirements
- **Market Type**: Either cross-margin or isolated-margin

### Market Types

There are two types of perpetual markets:

1. **Cross-Margin Markets**: Share a common insurance fund and risk pool
2. **Isolated-Margin Markets**: Have separate insurance funds and risk parameters

### Liquidity Tiers

Liquidity tiers define the risk profile and margin requirements for perpetual contracts:

- **Initial Margin PPM**: Minimum margin required to open a position
- **Maintenance Fraction PPM**: Percentage of initial margin for maintenance
- **Impact Notional**: Used for calculating impact bid/ask prices
- **Open Interest Caps**: Parameters for scaling margin requirements with open interest

### Funding Payments

Funding payments align perpetual contract prices with the underlying index price. The process involves:

1. **Premium Sampling**: Collecting premium votes from validators every minute
2. **Premium Calculation**: Computing median premium from votes
3. **Funding Rate**: Combining premium with default funding rate
4. **Funding Index**: Updating the cumulative funding index for position valuation

## State Management

### Perpetual Storage

Each perpetual is stored with its parameters and dynamic state:

```protobuf
message Perpetual {
  PerpetualParams params = 1;
  SerializableInt funding_index = 2;
  SerializableInt open_interest = 3;
}

message PerpetualParams {
  uint32 id = 1;
  string ticker = 2;
  uint32 market_id = 3;
  int32 atomic_resolution = 4;
  int32 default_funding_ppm = 5;
  uint32 liquidity_tier = 6;
  PerpetualMarketType market_type = 7;
}
```

### Liquidity Tier Storage

Liquidity tiers define risk parameters for groups of perpetuals:

```protobuf
message LiquidityTier {
  uint32 id = 1;
  string name = 2;
  uint32 initial_margin_ppm = 3;
  uint32 maintenance_fraction_ppm = 4;
  uint64 base_position_notional = 5 [deprecated = true];
  uint64 impact_notional = 6;
  uint64 open_interest_lower_cap = 7;
  uint64 open_interest_upper_cap = 8;
}
```

### Premium Storage

Premium data is stored separately for votes and samples:

```protobuf
message MarketPremiums {
  uint32 perpetual_id = 1;
  repeated int32 premiums = 2 [packed = true];
}

message PremiumStore {
  repeated MarketPremiums all_market_premiums = 1;
  uint32 num_premiums = 2;
}
```

## Funding Mechanism

The funding mechanism operates on two epoch types:

### Funding Sample Epoch (1 minute)

1. Validators submit premium votes for each perpetual
2. Votes are collected and stored in the PremiumVotes store
3. At epoch end, median premium is calculated for each perpetual
4. Premium samples are added to the PremiumSamples store

### Funding Tick Epoch (1 hour)

1. Premium samples from the last tick epoch are processed
2. Average premium is calculated after removing outliers
3. Funding rate is computed: `funding_rate = premium + default_funding`
4. Funding rate is clamped based on liquidity tier parameters
5. Funding index is updated for each perpetual

### Funding Index Calculation

The funding index delta is calculated as:

```
index_delta = funding_rate_ppm * (time_since_last_funding / 8_hours) * quote_quantums_per_base_quantum
```

## Key Functions

### Perpetual Management

- `CreatePerpetual`: Creates a new perpetual contract
- `ModifyPerpetual`: Updates perpetual parameters
- `GetPerpetual`: Retrieves a perpetual by ID
- `GetAllPerpetuals`: Lists all perpetuals

### Liquidity Tier Management

- `SetLiquidityTier`: Creates or updates a liquidity tier
- `GetLiquidityTier`: Retrieves a liquidity tier by ID
- `GetAllLiquidityTiers`: Lists all liquidity tiers

### Funding Operations

- `MaybeProcessNewFundingSampleEpoch`: Processes premium votes into samples
- `MaybeProcessNewFundingTickEpoch`: Calculates funding rates and updates indices
- `AddPremiumVotes`: Adds validator premium votes
- `AddPremiumSamples`: Adds premium samples

### Position Valuation

- `GetNetNotional`: Calculates notional value of a position
- `GetNetCollateral`: Calculates collateral value of a position
- `ModifyFundingIndex`: Updates the funding index for a perpetual
- `ModifyOpenInterest`: Updates open interest for a perpetual

## Parameters

The perpetuals module has the following parameters:

- `FundingRateClampFactorPpm`: Clamp factor for funding rates (default: 6,000,000)
- `PremiumVoteClampFactorPpm`: Clamp factor for premium votes (default: 60,000,000)
- `MinNumVotesPerSample`: Minimum votes required per sample (default: 15)

## Genesis State

The genesis state includes:

- Initial perpetual contracts
- Liquidity tier definitions
- Module parameters
- Empty premium stores

## Events

The module emits events for:

- Perpetual creation/modification
- Liquidity tier updates
- Funding rate calculations
- Premium sample collection

## Dependencies

The perpetuals module depends on:

- **Prices Module**: For oracle price data
- **Epochs Module**: For funding epoch management
- **CLOB Module**: For order book integration