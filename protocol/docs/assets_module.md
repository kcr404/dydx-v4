# Assets Module

The Assets module is responsible for managing exchangeable assets within the dYdX v4 chain protocol. It defines the structure and properties of different assets that can be traded or held within the system.

## Overview

The Assets module maintains a registry of all supported assets in the protocol. Each asset is uniquely identified and contains metadata that defines its characteristics, such as symbol, denomination, and conversion factors. The module ensures that assets are properly validated and maintained consistently throughout the system.

## Concepts

### Asset Structure

Each asset in the protocol is represented by the `Asset` type with the following fields:

- `Id`: A unique, sequentially-generated identifier for the asset.
- `Symbol`: The human-readable symbol of the asset (e.g., "USDC", "ATOM"). Must be uppercase and unique.
- `Denom`: The name of the base denomination unit (e.g., "uatom", "ibc/xxxxx"). Must be unique and match the denomination used in the Cosmos SDK bank module.
- `DenomExponent`: The exponent for converting one unit of denomination to a full coin. For example, with `denom_exponent = -6`, then `1 udenom = 10^(-6) full_coin`.
- `HasMarket`: Boolean indicating whether this asset has a valid market ID.
- `MarketId`: The ID of the market associated with this asset, used for oracle pricing in collateral and margin calculations.
- `AtomicResolution`: The exponent for converting an atomic amount (1 quantum) to a full coin.

### Asset Conversion

The module provides functionality to convert between asset quantums and Cosmos SDK coins:

```
denom_amount = quantums * 10^(atomic_resolution - denom_exponent)
```

If the resulting denomination amount is not an integer, it is rounded down, and the converted quantums of equal value are returned.

### Genesis State

The genesis state for the assets module contains a list of initial assets. The first asset must always be USDC with ID 0. Assets are validated to ensure:

- No duplicate asset IDs or denominations
- Sequential asset IDs
- Valid market IDs (must be 0 if HasMarket is false)

## State

### Asset Storage

Assets are stored in the state using the following key format:

- AssetKeyPrefix + asset ID -> Asset object

### Keeper Methods

#### CreateAsset

Creates a new asset with the specified parameters. Validates that:

- The asset ID doesn't already exist
- USDC is always asset ID 0 with the correct denomination
- The denomination is unique among existing assets
- Market validation if the asset has a market

#### ModifyAsset

Modifies an existing asset's market-related properties.

#### GetAsset

Retrieves an asset by its ID.

#### GetAllAssets

Returns all assets in the system, sorted by ID.

#### ConvertAssetToCoin

Converts asset quantums to Cosmos SDK coins using the asset's resolution parameters.

#### IsPositionUpdatable

Checks if an asset's position is updatable (always true for existing assets).

## Parameters

The assets module does not have any governance-modifiable parameters. All configuration is handled through the asset definitions themselves.

## Messages

Currently, the assets module does not support direct user messages for asset creation or modification. Assets are managed through genesis state and governance proposals.

## Events

The module emits events for asset creation:

- `AssetEvent`: Emitted when a new asset is created, containing the asset's ID, symbol, market information, and atomic resolution.

## Integration with Other Modules

### Prices Module

The assets module integrates with the prices module to validate market IDs for assets that have markets. When an asset has a market, the module verifies that the market exists in the prices module.

### Bank Module

Assets are integrated with the Cosmos SDK bank module through their denomination field. The `ConvertAssetToCoin` function facilitates conversion between asset quantums and bank coins.

### Subaccounts Module

Assets are held in subaccounts as part of asset positions. The atomic resolution determines how quantums are converted to full coins for position sizing.
