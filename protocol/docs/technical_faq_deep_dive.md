# dYdX v4 Technical Deep Dive & FAQ

This document answers common technical questions about dYdX v4's core mechanics, including Funding, Margin, Liquidation, and Architecture. It includes direct references to the codebase for further inspection.

---

## 1. Funding Mechanics

### Q: What is the Funding Interval?
dYdX v4 uses **epoch-based** funding updates, but the rate is annualized over an **8-hour period**.
*   **Funding Ticks**: Premium votes are collected periodically.
*   **Realization Period**: The divisor in the formula is hardcoded to 8 hours.

**Search Terms**: `GetFundingIndexDelta`, `NextFundingTick`
**Code Reference**: `protocol/x/perpetuals/funding/funding.go`
```go
// Line 44: Result divided by 8 hours (in seconds)
result.Quo(result, big.NewInt(60*60*8))
```

### Q: What is the Exact Funding Formula?
The formula calculates the change in the Funding Index (in PPM).
$$ \Delta \text{Index} = \text{Funding Rate} \times \frac{\text{Time Delta}}{8 \text{ Hours}} \times \text{Oracle Price} $$

**Code Reference**: `GetFundingIndexDelta` in `protocol/x/perpetuals/funding/funding.go`

### Q: Which Price is used for Notional?
The **Index Price** (Oracle Price) is used to calculate position notional for funding and margin checks.
**Code Reference**: `GetNetNotional` in `protocol/x/perpetuals/keeper/perpetual.go` calls `GetPerpetualAndMarketPrice`.

### Q: Who Pays Who?
*   **Positive Rate**: Longs pay Shorts.
*   **Negative Rate**: Shorts pay Longs.
*   **Logic**: The `IndexDelta` is added to the market's global `FundingIndex`.
    *   Longs *pay* `Position Size * (CurrentIndex - EntryIndex)`. If Index went up (Positive Rate), they pay.
    *   Shorts *receive* `Position Size * (CurrentIndex - EntryIndex)`.

### Q: Smoothing & Caps (What prevents massive spikes?)
Funding rates are clamped to prevent manipulation or extreme volatility.
*   **Clamp Formula**: $|Rate| \le \text{ClampFactor} \times (\text{Initial Margin} - \text{Maintenance Margin})$
*   **Default Factors**:
    *   `FundingRateClampFactorPpm`: 600% (6,000,000 PPM)
    *   `PremiumVoteClampFactorPpm`: 6000% (60,000,000 PPM)

**Code Reference**: `GetMaxAbsFundingClampPpm` in `protocol/x/perpetuals/types/liquidity_tier.go`.

---

## 2. Margin & Liquidation

### Q: Maintenance Margin Parameters
Margin requirements are defined by **Liquidity Tiers**.
*   **Initial Margin (IMF)**: Base requirement to open a position.
*   **Maintenance Margin (MM)**: Requirement to keep a position open.
*   **Formulas**:
    *   `MM_PPM = IMF_PPM * MaintenanceFraction_PPM`
    *   **OIMF Scaling**: IMF increases linearly as Open Interest increases (to manage risk).

**Code Reference**: `GetMaintenanceMarginPpm` and `GetAdjustedInitialMarginPpm` in `protocol/x/perpetuals/types/liquidity_tier.go`.

### Q: Liquidation Logic (How does it work?)
1.  **Selection**: The protocol pseudo-randomly selects subaccounts to check in `EndBlocker`.
2.  **Check**: `IsLiquidatable` checks if `Total Collateral < Total Maintenance Margin`.
3.  **Order**: A `LiquidationOrder` is generated.
4.  **Fill**: The order is placed against the orderbook (IOC).
5.  **Insurance**: If the fill price is worse than bankruptcy, the Insurance Fund covers the deficit.

**Code Reference**: `LiquidateSubaccountsAgainstOrderbook` in `protocol/x/clob/keeper/liquidations.go`.

### Q: What is ABR and Fillable Price?
Liquidation orders are priced to be attractive but fair.
*   **ABR (Asset Balance Ratio)**: A ratio representing how "healthy" the account is.
*   **Fillable Price**: Calculated to ensure the liquidator gets a discount (incentive) without exceeding the bankruptcy price.
    $$ \text{Fillable Price} = \frac{\text{PNNV} - \text{ABR} \times \text{SMMR} \times \text{PMMR}}{\text{Position Size}} $$

**Code Reference**: `GetFillablePrice` in `protocol/x/clob/keeper/liquidations.go`.

### Q: When does Bankruptcy happen?
Bankruptcy occurs when specific position closing would result in **Total Value < 0**.
*   Mathematically: `Liquidation Proceeds + Collateral < Debt`.
*   The **Insurance Fund** steps in to cover this "Bad Debt".

---

## 3. Architecture & Testing

### Q: Subaccount / Cross vs Isolated
*   **Subaccounts**: A single user (Wallet) can have multiple Subaccounts (Perp accounts).
*   **Cross Margin**: The default. All positions in a subaccount share collateral.
*   **Isolated Margin**: A market can be flagged as `IsIsolated`. Positions in this market generally require their own distinct backing (implementation detail: usually separated by subaccount logic or specific flags).

**Comparison**: `IsIsolatedPerpetual` in `protocol/x/perpetuals/keeper/perpetual.go`.

### Q: How to simulate Funding locally?
You can verify funding logic by writing a Go unit test using the `keepertest` helpers.
1.  **Set Up**: Use `keepertest.PerpetualsKeepers(t)`.
2.  **Mock Prices**: Use `mockPriceKeeper.On("GetMarketPrice", ...).Return(...)`.
3.  **Run Epoch**: Call `perpetualsKeeper.MaybeProcessNewFundingTickEpoch(ctx)`.
4.  **Check State**: Verify `GetFundingIndex` matches your manual calculation.

**Search Terms**: `mock oracle`, `keepertest`, `genesis`
**Code Reference**: `protocol/x/perpetuals/funding/funding_test.go`
