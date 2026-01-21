# Megavault System in dYdX v4 Chain Protocol

## Overview

 The megavault acts as the main vault that aggregates funds from all sub-vaults and individual depositors, functioning as a liquidity pool for automated market making.

## Architecture

### Megavault Structure

The megavault system consists of:

1. **Megavault Main Account**: The central account that holds all deposited funds
2. **Sub-Vaults**: Individual vaults that operate specific trading strategies
3. **Share System**: A mechanism for tracking ownership and enabling withdrawals

### Key Components

#### 1. Megavault Main Account

```go
// Defined in x/vault/types/megavault.go
var (
    MegavaultMainAddress = authtypes.NewModuleAddress(MegavaultAccountName)
    // MegavaultMainSubaccount is subaccount 0 of the module account derived from string "megavault"
    MegavaultMainSubaccount = satypes.SubaccountId{
        Owner:  MegavaultMainAddress.String(),
        Number: 0,
    }
)
```

The megavault uses a single subaccount (`MegavaultMainSubaccount`) to hold all deposited funds from users. This is the central pool of liquidity that backs all vault operations.

#### 2. Sub-Vaults

Each sub-vault is identified by a `VaultId`:

```go
// Defined in x/vault/types/vault.pb.go
type VaultId struct {
    // Type of the vault
    Type VaultType `protobuf:"varint,1,opt,name=type,proto3,enum=dydxprotocol.vault.VaultType" json:"type,omitempty"`
    // Unique ID of the vault within above type
    Number uint32 `protobuf:"varint,2,opt,name=number,proto3" json:"number,omitempty"`
}

// Vault types
const (
    // Vault is associated with a CLOB pair
    VaultType_VAULT_TYPE_CLOB VaultType = 1
)
```

Currently, only CLOB vaults are supported, where each vault corresponds to a specific perpetual market (identified by the `Number` field which maps to a CLOB pair ID).

#### 3. Vault States

Vaults can be in different operational states:

```go
// Defined in x/vault/types/vault.pb.go
type VaultStatus int32

const (
    // Don't place orders. Does not count toward global vault balances.
    // A vault can only be set to this status if its equity is non-positive.
    VaultStatus_VAULT_STATUS_DEACTIVATED VaultStatus = 1
    
    // Don't place orders. Does count towards global vault balances.
    VaultStatus_VAULT_STATUS_STAND_BY VaultStatus = 2
    
    // Places orders on both sides of the book.
    VaultStatus_VAULT_STATUS_QUOTING VaultStatus = 3
    
    // Only place orders that close the position.
    VaultStatus_VAULT_STATUS_CLOSE_ONLY VaultStatus = 4
)
```

## Operation Flow

### 1. Deposit Process

Users deposit funds into the megavault through the `DepositToMegavault` function:

```go
// In x/vault/keeper/deposit.go
func (k Keeper) DepositToMegavault(
    ctx sdk.Context,
    fromSubaccount satypes.SubaccountId,
    quoteQuantums *big.Int,
) (mintedShares *big.Int, err error) {
    // Mint shares for the depositor
    mintedShares, err = k.MintShares(
        ctx,
        fromSubaccount.Owner,
        quoteQuantums,
    )
    if err != nil {
        return nil, err
    }

    // Transfer funds from user to megavault
    err = k.sendingKeeper.ProcessTransfer(
        ctx,
        &sendingtypes.Transfer{
            Sender:    fromSubaccount,
            Recipient: types.MegavaultMainSubaccount,
            AssetId:   assettypes.AssetUsdc.Id,
            Amount:    quoteQuantums.Uint64(),
        },
    )
    // ...
}
```

When a user deposits funds:

1. Shares are minted based on the deposit amount and current vault equity
2. Funds are transferred from the user's subaccount to the megavault main subaccount
3. The user's share balance is updated in the state

### 2. Share Management

The megavault uses a share-based system to track ownership:

```go
// In x/vault/keeper/shares.go
func (k Keeper) MintShares(
    ctx sdk.Context,
    owner string,
    quantumsToDeposit *big.Int,
) (mintedShares *big.Int, err error) {
    // Get existing TotalShares of the vault
    existingTotalShares := k.GetTotalShares(ctx).NumShares.BigInt()
    
    var sharesToMint *big.Int
    if existingTotalShares.Sign() <= 0 {
        // First deposit - mint equal number of shares
        sharesToMint = new(big.Int).Set(quantumsToDeposit)
    } else {
        // Get megavault equity
        equity, err := k.GetMegavaultEquity(ctx)
        // Mint proportional shares based on deposit amount and current equity
        sharesToMint = new(big.Int).Set(quantumsToDeposit)
        sharesToMint = sharesToMint.Mul(sharesToMint, existingTotalShares)
        sharesToMint = sharesToMint.Quo(sharesToMint, equity)
    }
    // ...
}
```

The share system ensures fair distribution of profits and losses among depositors based on their proportional contribution to the vault.

### 3. Sub-Vault Allocation

The megavault can allocate funds to sub-vaults:

```go
// In x/vault/keeper/vault.go
func (k Keeper) AllocateToVault(
    ctx sdk.Context,
    vaultId types.VaultId,
    quantums *big.Int,
) error {
    // Transfer from main vault to the specified vault
    if err := k.sendingKeeper.ProcessTransfer(
        ctx,
        &sendingtypes.Transfer{
            Sender:    types.MegavaultMainSubaccount,
            Recipient: *vaultId.ToSubaccountId(),
            AssetId:   assettypes.AssetUsdc.Id,
            Amount:    quantums.Uint64(),
        },
    ); err != nil {
        return err
    }
    return nil
}
```

This allows the megavault to distribute capital to different trading strategies while maintaining centralized control of all funds.

### 4. Order Generation

Each sub-vault generates orders based on its strategy:

```go
// In x/vault/keeper/orders.go
func (k Keeper) GetVaultClobOrders(
    ctx sdk.Context,
    vaultId types.VaultId,
) (orders []*clobtypes.Order, err error) {
    // Get market data
    clobPair, perpetual, marketParam, marketPrice, err := k.GetVaultClobPerpAndMarket(ctx, vaultId)
    
    // Get vault leverage and equity
    leverage, equity, err := k.GetVaultLeverageAndEquity(ctx, vaultId, &perpetual, &marketPrice)
    
    // Calculate order parameters
    quotingParams := k.GetDefaultQuotingParams(ctx)
    
    // Calculate order size
    orderSizePctPpm := lib.BigU(quotingParams.OrderSizePctPpm)
    orderSize := lib.QuoteToBaseQuantums(
        new(big.Int).Mul(equity, orderSizePctPpm),
        perpetual.Params.AtomicResolution,
        marketPrice.Price,
        marketPrice.Exponent,
    )
    
    // Generate orders for multiple layers
    for i := uint32(0); i < quotingParams.Layers; i++ {
        // Construct ask at this layer
        orders[2*i] = constructOrder(clobtypes.Order_SIDE_SELL, i, orderIds[2*i])
        
        // Construct bid at this layer
        orders[2*i+1] = constructOrder(clobtypes.Order_SIDE_BUY, i, orderIds[2*i+1])
    }
    // ...
}
```

The order generation algorithm considers:

- Current market price
- Vault's leverage and equity
- Quoting parameters (spread, skew, order size)
- Multiple layers of orders for better liquidity provision

### 5. Order Management

Vault orders are managed through a refresh cycle:

```go
// In x/vault/keeper/orders.go
func (k Keeper) RefreshVaultClobOrders(ctx sdk.Context, vaultId types.VaultId) (err error) {
    // Get client IDs of most recently placed orders
    mostRecentClientIds := k.GetMostRecentClientIds(ctx, vaultId)
    
    // Get orders to place
    ordersToPlace, err := k.GetVaultClobOrders(ctx, vaultId)
    
    for i, orderToPlace := range ordersToPlace {
        if i >= len(mostRecentClientIds) {
            // Place new order
            err = k.PlaceVaultClobOrder(ctx, vaultId, orderToPlace)
        } else {
            oldClientId := mostRecentClientIds[i]
            oldOrderId := vaultId.GetClobOrderId(oldClientId)
            oldOrderPlacement, exists := k.clobKeeper.GetLongTermOrderPlacement(ctx, *oldOrderId)
            
            if !exists {
                // Order expired or filled - place new order with flipped client ID
                orderToPlace.OrderId.ClientId = oldClientId ^ 1
                err = k.PlaceVaultClobOrder(ctx, vaultId, orderToPlace)
            } else if oldOrderPlacement.Order.Quantums != orderToPlace.Quantums ||
                oldOrderPlacement.Order.Subticks != orderToPlace.Subticks ||
                oldOrderPlacement.Order.Side != orderToPlace.Side {
                // Replace order with updated parameters
                orderToPlace.OrderId.ClientId = oldClientId ^ 1
                err = k.ReplaceVaultClobOrder(ctx, vaultId, oldOrderId, orderToPlace)
            }
        }
        // ...
    }
}
```

This ensures that vault orders are continuously updated to reflect current market conditions.

### 6. Withdrawal Process

Users can withdraw their funds with slippage calculations:

```go
// In x/vault/keeper/withdraw.go
func (k Keeper) WithdrawFromMegavault(
    ctx sdk.Context,
    toSubaccount satypes.SubaccountId,
    sharesToWithdraw *big.Int,
    minQuoteQuantums *big.Int,
) (redeemedQuoteQuantums *big.Int, err error) {
    // Check shares availability
    // ...
    
    // Redeem from main and sub vaults
    redeemedQuoteQuantums, megavaultEquity, totalShares, err :=
        k.RedeemFromMainAndSubVaults(ctx, sharesToWithdraw, false)
    
    // Transfer funds to user
    err = k.sendingKeeper.ProcessTransfer(
        ctx,
        &sendingtypes.Transfer{
            Sender:    types.MegavaultMainSubaccount,
            Recipient: toSubaccount,
            AssetId:   assetstypes.AssetUsdc.Id,
            Amount:    redeemedQuoteQuantums.Uint64(),
        },
    )
    
    // Update share balances
    // ...
}
```

The withdrawal process accounts for potential slippage from sub-vault positions:

```go
// In x/vault/keeper/withdraw.go
func (k Keeper) GetVaultWithdrawalSlippage(...) (*big.Rat, error) {
    // Slippage calculation considers:
    // - Simple slippage = leverage * initial_margin
    // - Estimated slippage = spread * (1 + average_skew) * leverage
    // Returns min(simple_slippage, estimated_slippage)
}
```

## Integration with Order Matching

The vault system integrates with the CLOB order matching engine:

1. **Order Placement**: Vault orders are placed as long-term orders in the CLOB
2. **Matching**: Vault orders participate in regular order matching with user orders
3. **Position Management**: Vault positions are updated based on filled orders
4. **Continuous Updates**: Vault orders are refreshed every block to maintain liquidity

## Benefits of the Megavault System

1. **Capital Efficiency**: Centralized liquidity pool allows for better capital utilization
2. **Risk Distribution**: Losses and gains are distributed among all depositors
3. **Automated Market Making**: Vaults provide continuous liquidity with algorithmic pricing
4. **Flexible Strategies**: Different sub-vaults can implement different trading strategies
5. **User Protection**: Share-based system protects users from negative equity scenarios

## Conclusion
