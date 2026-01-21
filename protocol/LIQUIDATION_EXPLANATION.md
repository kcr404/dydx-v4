# Liquidation System in dYdX v4 Chain Protocol

## Overview

The dYdX v4 chain implements a sophisticated liquidation system to manage risk in perpetual futures trading. This system identifies and processes undercollateralized subaccounts to protect the protocol and other traders from potential losses. The liquidation system consists of several key components:

1. **Liquidation Daemon**: A background service that continuously monitors subaccounts for liquidation eligibility
2. **Risk Calculation**: Methods for determining if a subaccount is undercollateralized
3. **Liquidation Orders**: Special orders that can only be placed for liquidatable subaccounts
4. **Deleveraging**: A fallback mechanism when liquidations alone aren't sufficient
5. **Insurance Fund**: A reserve that covers losses when deleveraging isn't possible

## Core Components

### 1. Liquidation Daemon

The liquidation system is primarily driven by a daemon service located in [`daemons/liquidation/client`](daemons/liquidation/client). This daemon runs periodically to:

1. Fetch all subaccounts and their positions
2. Calculate the risk profile for each subaccount with open positions
3. Identify subaccounts that are liquidatable or have negative total net collateral (TNC)
4. Report these subaccounts to the application for processing

Key files:

- [`client.go`](daemons/liquidation/client/client.go): Main daemon client implementation
- [`sub_task_runner.go`](daemons/liquidation/client/sub_task_runner.go): Logic for running liquidation checks

The daemon follows this process:

1. Query the application state at the last committed block height
2. Fetch all subaccounts, perpetuals, market prices, and liquidity tiers
3. Check collateralization status for each subaccount with open positions
4. Send lists of liquidatable subaccounts and negative TNC subaccounts to the application

### 2. Risk Calculation for Liquidation

The determination of whether a subaccount is liquidatable relies on the Risk struct defined in [`lib/margin/risk.go`](lib/margin/risk.go):

```go
type Risk struct {
    MMR *big.Int // Maintenance Margin Requirement
    IMR *big.Int // Initial Margin Requirement
    NC  *big.Int // Net Collateral
}
```

A subaccount is considered liquidatable when:

- Maintenance Margin Requirement (MMR) is greater than zero
- Net Collateral (NC) is less than Maintenance Margin Requirement (MMR)

This is implemented in the `IsLiquidatable()` method:

```go
func (a *Risk) IsLiquidatable() bool {
    return a.MMR.Sign() > 0 && a.MMR.Cmp(a.NC) > 0
}
```

The risk calculation is performed in [`x/subaccounts/lib/updates.go`](x/subaccounts/lib/updates.go) through the `GetRiskForSubaccount` function, which:

1. Calculates net collateral and margin requirements for all asset positions
2. Calculates net collateral and margin requirements for all perpetual positions
3. Sums these values to get the total risk for the subaccount

### 3. Liquidation Order Processing

When the application receives a list of liquidatable subaccounts from the daemon, it can place liquidation orders. These orders are processed differently from regular orders:

1. **Validation**: In [`x/clob/keeper/process_single_match.go`](x/clob/keeper/process_single_match.go), liquidation orders go through special validation in the `validateMatchedLiquidation` function
2. **Fee Structure**: Liquidation orders don't pay standard trading fees; instead, they pay a liquidation fee that goes to the insurance fund
3. **Collateralization Check**: Even though the subaccount was identified as liquidatable by the daemon, a final collateralization check is performed during matching

During the matching process:

1. Liquidation fees are calculated instead of standard taker fees
2. Insurance fund payments are computed and transferred
3. Subaccount updates are applied with special handling for liquidation-specific values

### 4. Deleveraging Mechanism

When a liquidation order cannot fully close a position (either because there aren't enough opposite positions on the order book or because the insurance fund would be depleted), the protocol employs deleveraging:

1. Deleveraging is triggered when liquidation orders alone cannot restore proper collateralization
2. The system attempts to match the liquidated position with other traders' positions at the bankruptcy price
3. This process bypasses the order book entirely and directly transfers positions between traders
4. Deleveraging is implemented in separate modules from the core matching engine

### 5. Insurance Fund Protection

The insurance fund serves as a last resort to cover losses when liquidations and deleveraging aren't sufficient:

1. Liquidation fees are paid into the insurance fund
2. When a subaccount has negative equity, the insurance fund covers the deficit
3. The insurance fund balance is tracked per perpetual market
4. If the insurance fund is depleted for a market, deleveraging becomes the only option

Functions for managing the insurance fund are found in [`x/subaccounts/keeper/subaccount.go`](x/subaccounts/keeper/subaccount.go):

- `GetInsuranceFundBalance`: Gets the balance for a specific perpetual's insurance fund
- `GetCrossInsuranceFundBalance`: Gets the balance for the cross-margin insurance fund

### 6. Negative TNC Subaccount Handling

Subaccounts with negative Total Net Collateral (TNC) are treated specially:

1. Identified by the liquidation daemon alongside liquidatable subaccounts
2. Trigger temporary blocks on withdrawals and transfers for all users
3. This prevents good-faith users from extracting value from the protocol when there are bad-debt situations

The blocking mechanism is implemented in `internalCanUpdateSubaccountsWithLeverage` in [`x/subaccounts/keeper/subaccount.go`](x/subaccounts/keeper/subaccount.go):

- Blocks withdrawals and transfers for a fixed number of blocks after a negative TNC subaccount is seen
- Also blocks during chain outages of sufficient duration

## Key Implementation Details

### Liquidation Eligibility Flow

1. **Daemon Monitoring**: The liquidation daemon runs on a configurable interval
2. **Risk Assessment**: For each subaccount with positions:
   - Calculate current risk (NC, IMR, MMR)
   - Check if MMR > 0 and MMR > NC (liquidatable condition)
   - Check if NC < 0 (negative TNC condition)
3. **Reporting**: Send lists of liquidatable and negative TNC subaccounts to application

### Liquidation Order Execution

1. **Order Placement**: Application places liquidation orders for identified subaccounts
2. **Matching**: Liquidation orders are matched against the order book like regular orders but with special fee handling
3. **Validation**: Additional checks ensure the subaccount is still liquidatable at match time
4. **Insurance Fund Interaction**: Liquidation fees and potential deficit coverage involve the insurance fund

### State Transitions

The system carefully manages state transitions for undercollateralized accounts through `IsValidStateTransitionForUndercollateralizedSubaccount` in [`x/subaccounts/lib/updates.go`](x/subaccounts/lib/updates.go):

- Ensures that undercollateralized accounts only transition to "less-or-equally-risky" states
- Prevents malicious actors from worsening the risk profile of undercollateralized accounts

## Conclusion

The dYdX v4 liquidation system provides a multi-layered approach to risk management:

1. Continuous monitoring by the liquidation daemon
2. Precise risk calculations using the Risk struct
3. Special handling of liquidation orders with insurance fund interactions
4. Deleveraging as a fallback mechanism
5. Temporary transaction blocks when negative TNC accounts are detected

This comprehensive system protects the protocol from losses while ensuring fair treatment of all participants.
