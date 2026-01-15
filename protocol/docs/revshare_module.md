# Revshare Module

## Overview

The revshare module manages revenue sharing mechanisms within the dYdX protocol. It enables different types of revenue distribution including market mapper revenue shares, unconditional revenue shares, and order router revenue shares. This module ensures that various stakeholders in the ecosystem can receive a portion of the trading fees generated on the platform.

## Contents

1. [Concepts](#concepts)
2. [State](#state)
3. [Messages](#messages)
4. [Queries](#queries)
5. [Params](#params)

## Concepts

### Revenue Sharing Types

The revshare module supports three primary types of revenue sharing:

1. **Market Mapper Revenue Share**: Allows market creators to receive a percentage of trading fees for markets they've created. This incentivizes liquidity provision and market creation.

2. **Unconditional Revenue Share**: Distributes a fixed percentage of protocol revenue to predetermined recipients regardless of trading activity.

3. **Order Router Revenue Share**: Provides revenue sharing with entities that route orders to the protocol, encouraging integrations and partnerships.

### Parts Per Million (PPM)

All revenue share percentages are represented in parts per million (PPM), where 1,000,000 PPM equals 100%. This provides high precision for percentage calculations.

### Revenue Share Safety

The module includes safety mechanisms to prevent excessive revenue sharing that could deplete protocol funds. It validates that:

1. Total unconditional and market mapper revenue shares remain below 100%
2. Fee structures maintain sufficient margins for protocol sustainability

## State

### MarketMapperRevenueShareParams

Stores the default parameters for market mapper revenue sharing.

```protobuf
message MarketMapperRevenueShareParams {
  // The address which will receive the revenue share
  string address = 1;
  
  // The percentage of revenue to be shared, in parts-per-million
  uint32 revenue_share_ppm = 2;
  
  // The duration in days for which the revenue share is valid
  uint32 valid_days = 3;
}
```

### MarketMapperRevShareDetails

Stores expiration details for individual market revenue shares.

```protobuf
message MarketMapperRevShareDetails {
  // Unix timestamp recorded when the market revenue share expires
  uint64 expiration_ts = 1;
}
```

### UnconditionalRevShareConfig

Configures unconditional revenue sharing recipients.

```protobuf
message UnconditionalRevShareConfig {
  // Configs for each recipient
  repeated RecipientConfig configs = 1;
  
  message RecipientConfig {
    // Address of the recipient
    string address = 1;
    
    // Percentage of net revenue to share with recipient, in parts-per-million
    uint32 share_ppm = 2;
  }
}
```

### OrderRouterRevShare

Defines revenue sharing for order routers.

```protobuf
message OrderRouterRevShare {
  // The address of the order router
  string address = 1;
  
  // The share of the revenue to be paid to the order router
  uint32 share_ppm = 2;
}
```

## Messages

### MsgSetMarketMapperRevenueShare

Sets the default revenue share parameters for market mappers.

```protobuf
message MsgSetMarketMapperRevenueShare {
  string authority = 1;
  MarketMapperRevenueShareParams params = 2;
}

message MsgSetMarketMapperRevenueShareResponse {}
```

### MsgSetMarketMapperRevShareDetailsForMarket

Sets specific revenue share details for a particular market.

```protobuf
message MsgSetMarketMapperRevShareDetailsForMarket {
  string authority = 1;
  uint32 market_id = 2;
  MarketMapperRevShareDetails params = 3;
}

message MsgSetMarketMapperRevShareDetailsForMarketResponse {}
```

### MsgUpdateUnconditionalRevShareConfig

Updates the unconditional revenue share configuration.

```protobuf
message MsgUpdateUnconditionalRevShareConfig {
  string authority = 1;
  UnconditionalRevShareConfig config = 2;
}

message MsgUpdateUnconditionalRevShareConfigResponse {}
```

### MsgSetOrderRouterRevShare

Sets the revenue share for an order router.

```protobuf
message MsgSetOrderRouterRevShare {
  string authority = 1;
  OrderRouterRevShare order_router_rev_share = 2;
}

message MsgSetOrderRouterRevShareResponse {}
```

## Queries

### MarketMapperRevenueShareParams

Retrieves the default market mapper revenue share parameters.

```protobuf
message QueryMarketMapperRevenueShareParams {}

message QueryMarketMapperRevenueShareParamsResponse {
  MarketMapperRevenueShareParams params = 1;
}
```

CLI Command:

```bash
dydxprotocold query revshare revshare-params
```

### MarketMapperRevShareDetails

Retrieves revenue share details for a specific market.

```protobuf
message QueryMarketMapperRevShareDetails {
  uint32 market_id = 1;
}

message QueryMarketMapperRevShareDetailsResponse {
  MarketMapperRevShareDetails details = 1;
}
```

CLI Command:

```bash
dydxprotocold query revshare revshare-details-for-market [market-id]
```

### UnconditionalRevShareConfig

Retrieves the unconditional revenue share configuration.

```protobuf
message QueryUnconditionalRevShareConfig {}

message QueryUnconditionalRevShareConfigResponse {
  UnconditionalRevShareConfig config = 1;
}
```

CLI Command:

```bash
dydxprotocold query revshare unconditional-revshare-config
```

### OrderRouterRevShare

Retrieves the revenue share for a specific order router.

```protobuf
message QueryOrderRouterRevShare {
  string address = 1;
}

message QueryOrderRouterRevShareResponse {
  OrderRouterRevShare order_router_rev_share = 1;
}
```

CLI Command:

```bash
dydxprotocold query revshare order-router-rev-share [address]
```

## Params

The revshare module doesn't have traditional governance parameters, but relies on the following configurable values:

1. **MarketMapperRevenueShareParams**
   - `address`: The recipient address for market mapper revenue shares
   - `revenue_share_ppm`: Percentage of revenue shared with market mappers (in PPM)
   - `valid_days`: Duration for which revenue shares are valid

2. **UnconditionalRevShareConfig**
   - `configs`: List of recipient configurations with their respective share percentages

3. **OrderRouterRevShare**
   - `address`: The order router address
   - `share_ppm`: Percentage of revenue shared with the order router (in PPM)
