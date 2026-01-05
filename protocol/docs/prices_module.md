# Prices Module

## Overview

The Prices module is responsible for managing market prices and parameters within the protocol. It maintains a registry of all supported markets, their configuration parameters, and current price values. The module serves as the central price oracle for the protocol, integrating external price feeds and providing validated price updates for other modules.

## Purpose

The primary purpose of the Prices module is to:

- Register and maintain a registry of all supported markets
- Define market parameters including trading pairs, minimum price changes, and validation rules
- Store and update current market prices from external sources
- Provide validated price updates for use by other modules
- Ensure price consistency and prevent manipulation through smoothing algorithms
- Integrate with external price feed systems

## Key Features

### Market Registration

- Sequential market ID assignment
- Unique market pair enforcement (e.g., BTC-USD, ETH-USD)
- Market parameter validation
- Integration with market map for decentralized market configuration

### Price Management

- Storage of current market prices
- Price update validation and processing
- Minimum price change requirements (in parts per million)
- Price smoothing to prevent sudden price jumps

### Oracle Integration

- Integration with external price feeds via daemon systems
- Median price calculation from multiple exchanges
- Price validation against minimum change thresholds
- Index price caching for efficient retrieval

### Market Parameters

- **ID**: Unique, sequentially-generated identifier
- **Pair**: Human-readable market pair (e.g., BTC-USD)
- **MinPriceChangePpm**: Minimum price change in parts per million
- **Exponent**: Price exponent (deprecated, now sourced from market map)

### Price Validation

- Minimum price change requirements
- Price smoothing algorithms
- Cross-validation with index prices
- Proposal logic for price updates

## Data Structures

### MarketParam

```protobuf
// MarketParam represents the x/prices configuration for markets, including
// representing price values, resolving markets on individual exchanges, and
// generating price updates. This configuration is specific to the quote
// currency.
message MarketParam {
  // Unique, sequentially-generated value.
  uint32 id = 1;
  
  // The human-readable name of the market pair (e.g. `BTC-USD`).
  string pair = 2;
  
  // Static value. The exponent of the price.
  // For example if `Exponent == -5` then a `Value` of `1,000,000,000`
  // represents "$10,000". Therefore `10 ^ Exponent` represents the smallest
  // price step (in dollars) that can be recorded.
  //
  // Deprecated since v8.x. This value is now determined from the marketmap.
  sint32 exponent = 3 [deprecated = true];
  
  // The minimum number of exchanges that should be reporting a live price for
  // a price update to be considered valid.
  //
  // Deprecated since v8.x. This value is now determined from the marketmap.
  uint32 min_exchanges = 4 [deprecated = true];
  
  // The minimum allowable change in `price` value that would cause a price
  // update on the network. Measured as `1e-6` (parts per million).
  uint32 min_price_change_ppm = 5;
  
  // A string of json that encodes the configuration for resolving the price
  // of this market on various exchanges.
  //
  // Deprecated since v8.x. This is now determined from the marketmap.
  string exchange_config_json = 6 [deprecated = true];
}
```

### MarketPrice

```protobuf
// MarketPrice is used by the application to store/retrieve oracle price.
message MarketPrice {
  // Unique, sequentially-generated value that matches `MarketParam`.
  uint32 id = 1;
  
  // Static value. The exponent of the price. See the comment on the duplicate
  // MarketParam field for more information.
  //
  // As of v7.1.x, this value is determined from the marketmap instead of
  // needing to match the MarketParam field.
  sint32 exponent = 2;
  
  // The variable value that is updated by oracle price updates. `0` if it has
  // never been updated, `>0` otherwise.
  uint64 price = 3;
}
```

## Core Concepts

### Price Updates

The prices module receives price updates from external sources through daemon processes. These updates undergo validation before being accepted:

1. **Index Price Calculation**: Median price from multiple exchanges
2. **Validation**: Check against minimum price change requirements
3. **Smoothing**: Apply smoothing algorithms to prevent manipulation
4. **Proposal**: Generate price update proposals for the network

### Minimum Price Change

Each market has a `MinPriceChangePpm` parameter that defines the minimum percentage change required for a price update to be accepted. This prevents unnecessary updates and reduces network spam.

### Market Map Integration

As of version 8.x, market parameters are sourced from the market map module rather than being stored directly in the prices module. This enables decentralized market configuration.

### Price Exponent

The price exponent determines the precision of price values. For example, with an exponent of -5, a price value of 1,000,000,000 represents $10,000.

## State Management

### Storage

Market parameters and prices are stored in the KVStore with the following key structure:

- Market Parameters: Prefix + Market ID
- Market Prices: Prefix + Market ID

### Genesis Initialization

The genesis state includes predefined market parameters and initial prices for major cryptocurrencies like BTC-USD and ETH-USD.

## Queries

### AllMarketParams

Retrieves all registered market parameters with pagination support.

### MarketParam-

Retrieves a specific market parameter by its ID.

### AllMarketPrices

Retrieves all current market prices with pagination support.

### MarketPrice-

Retrieves a specific market price by its ID.

## Transactions

The prices module processes price updates through the `MsgUpdateMarketPrices` message, which is typically submitted by validators based on external price feeds.

### MsgUpdateMarketPrices

Updates multiple market prices in a single transaction. Each price update includes:

- Market ID
- New price value

## Integration Points

### Dependencies

- **MarketMap Module**: For decentralized market configuration
- **Daemon Processes**: For external price feed integration
- **RevShare Module**: For market-specific revenue sharing

### Used By

- **CLOB Module**: For order pricing and validation
- **Perpetuals Module**: For funding rate calculations
- **Subaccounts Module**: For position valuation and margin calculations
- **Assets Module**: For asset valuation

## Constants

- **MinPriceChangePpm**: Minimum price change in parts per million (1000 = 0.1%)
- **Default Markets**: BTC-USD and ETH-USD with initial prices

## Error Handling

The module defines several specific error types:

- `ErrMarketParamDoesNotExist`: When referencing a non-existent market parameter
- `ErrMarketParamAlreadyExists`: When attempting to create a duplicate market parameter
- `ErrMarketParamPairAlreadyExists`: When attempting to create a market with an existing pair
- `ErrInvalidInput`: When input parameters fail validation
- `ErrMarketPricesAndParamsDontMatch`: When market parameters and prices are inconsistent
- `ErrIndexPriceNotAvailable`: When index price is not available for a market
- `ErrInvalidMarketPrice`: When market price fails validation

## Implementation Details

### Keeper Interface

The keeper provides the following methods:

- `CreateMarket`: Register a new market with parameters and initial price
- `GetMarketParam`: Retrieve a market parameter by ID
- `GetMarketPrice`: Retrieve a market price by ID
- `GetAllMarketParams`: Retrieve all market parameters
- `GetAllMarketPrices`: Retrieve all market prices
- `GetAllMarketParamPrices`: Retrieve all market parameters and prices as pairs
- `GetValidMarketPriceUpdates`: Generate validated price update proposals
- `ModifyMarketParam`: Update an existing market parameter

### Price Update Logic

The price update process involves:

1. Retrieving all market parameters and current prices
2. Getting index prices from the in-memory cache
3. Validating each potential price update against minimum change requirements
4. Generating a list of valid price updates
5. Sorting updates by market ID

### Validation Process

Price updates are validated against:

- Minimum price change requirements (ppm)
- Index price availability
- Price consistency checks

## Future Considerations

- Enhanced price smoothing algorithms
- More sophisticated price validation mechanisms
- Improved integration with decentralized oracle networks
- Support for more complex market types and derivatives
- Advanced analytics and monitoring of price behavior
