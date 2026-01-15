# Leverage Module

## Overview

The Leverage module manages leverage settings for users on the dYdX v4 chain protocol. It allows users to set their desired leverage levels within protocol-defined bounds, which affects their position sizing and risk exposure in perpetual futures trading. The module maintains user leverage preferences and ensures they remain within safe parameters defined by governance.

## Contents

- [Leverage Module](#leverage-module)
  - [Overview](#overview)
  - [Contents](#contents)
  - [Concepts](#concepts)
    - [User Leverage Settings](#user-leverage-settings)
    - [Leverage Bounds](#leverage-bounds)
  - [State](#state)
    - [LeverageParams](#leverageparams)
    - [LeverageInfo](#leverageinfo)
  - [Messages](#messages)
    - [MsgUpdateLeverage](#msgupdateleverage)
  - [Queries](#queries)
    - [Params](#params)
    - [Leverage](#leverage)
    - [AllLeverage](#allleverage)
  - [Events](#events)
  - [Functions](#functions)
  - [Integration with Other Modules](#integration-with-other-modules)
    - [CLOB](#clob)
    - [Perpetuals](#perpetuals)

## Concepts

### User Leverage Settings

Users can set their preferred leverage level which determines the size of their positions relative to their collateral. Higher leverage allows for larger positions with less capital but increases risk of liquidation. The leverage setting is stored per user and applied when they place trades.

### Leverage Bounds

Governance sets minimum and maximum leverage bounds to ensure user safety and protocol stability. Users can only set leverage values within these bounds. This prevents users from taking on excessive risk that could lead to systemic issues.

## State

### LeverageParams

Defines the global leverage parameters set by governance.

```protobuf
message LeverageParams {
  uint32 max_leverage = 1;
  uint32 min_leverage = 2;
}
```

Fields:

- `max_leverage`: Maximum leverage a user can set
- `min_leverage`: Minimum leverage a user can set

### LeverageInfo

Stores leverage information for a specific user.

```protobuf
message LeverageInfo {
  string user_address = 1;
  uint32 leverage = 2;
  int64 last_updated_block = 3;
}
```

Fields:

- `user_address`: Address of the user
- `leverage`: Leverage value set by the user
- `last_updated_block`: Block height when leverage was last updated

## Messages

### MsgUpdateLeverage

Allows a user to update their leverage setting.

```protobuf
rpc UpdateLeverage(MsgUpdateLeverage) returns (MsgUpdateLeverageResponse);
```

Fields:

- `authority`: Address of the user requesting the leverage update
- `leverage`: New leverage value to set for the user

## Queries

### Params

Retrieves the leverage module parameters.

```protobuf
rpc Params(QueryParamsRequest) returns (QueryParamsResponse);
```

Response Fields:

- `params`: Current leverage parameters including min/max bounds

### Leverage

Retrieves leverage information for a specific user.

```protobuf
rpc Leverage(QueryLeverageRequest) returns (QueryLeverageResponse);
```

Request Fields:

- `user_address`: Address of the user to query

Response Fields:

- `leverage_info`: Leverage information for the requested user

### AllLeverage

Retrieves leverage information for all users with pagination support.

```protobuf
rpc AllLeverage(QueryAllLeverageRequest) returns (QueryAllLeverageResponse);
```

Request Fields:

- `pagination`: Pagination parameters

Response Fields:

- `leverage_infos`: List of leverage information for all users
- `pagination`: Pagination response

## Events

The Leverage module does not emit any events directly. Events related to leverage changes would be emitted by other modules that utilize leverage settings.

## Functions

The Leverage module does not expose public keeper functions beyond the standard state operations. Other modules query the leverage settings when needed for position sizing calculations.

## Integration with Other Modules

### CLOB

The Leverage module integrates with the CLOB module to provide user leverage settings for position sizing when placing orders. When users place orders, the CLOB module queries the leverage module to determine appropriate position sizes based on user preferences and collateral.

### Perpetuals

The Leverage module works with the Perpetuals module to ensure leverage settings are appropriate for specific perpetual markets. Different markets may have different risk characteristics that affect how leverage is applied.
