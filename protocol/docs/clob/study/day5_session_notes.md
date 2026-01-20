# Day 5 Session Notes - Advanced Features (Liquidations & MEV)

**Date**: January 16, 2026  
**Focus**: Liquidation mechanics, MEV mitigation, and operations queue for deterministic consensus

---

## 🎯 Session Goals

1. ✅ Understand liquidation mechanics and pricing
2. ✅ Study liquidation configuration and safety limits
3. ✅ Analyze MEV measurement and mitigation strategies
4. ✅ Deep dive into operations queue for deterministic consensus

---

## 📚 Study Notes

### 1. Liquidation Order Structure (`types/liquidation_order.go`)

#### A. LiquidationOrder Type (Lines 12-24)

```go
type LiquidationOrder struct {
    // Information about this liquidation order.
    perpetualLiquidationInfo PerpetualLiquidationInfo
    // CLOB pair ID of the CLOB pair the liquidation order will be matched against.
    clobPairId ClobPairId
    // True if this is a buy order liquidating a short position, false if vice versa.
    isBuy bool
    // The number of base quantums for this liquidation order.
    quantums satypes.BaseQuantums
    // The subticks this order will be submitted at.
    subticks Subticks
}
```

**Key Characteristics**:
- **IOC (Immediate-Or-Cancel)**: Liquidation orders never rest on the book
- **No underlying Order**: Liquidations are protocol-generated, not user-submitted
- **Implements MatchableOrder**: Can be matched like regular orders
- **Always taker**: Liquidations take liquidity from the orderbook

#### B. Liquidation Direction Logic

```
Liquidating a LONG position → SELL order (isBuy = false)
Liquidating a SHORT position → BUY order (isBuy = true)
```

**Why?**
- To close a long position, you must sell
- To close a short position, you must buy

---

### 2. Liquidation Configuration (`types/liquidations_config.go`)

#### A. LiquidationsConfig Structure

From the protobuf definition, the config includes:

```go
type LiquidationsConfig struct {
    // Maximum liquidation fee in PPM (parts per million)
    MaxLiquidationFeePpm uint32
    
    // Fillable price configuration
    FillablePriceConfig FillablePriceConfig
    
    // Position block limits
    PositionBlockLimits PositionBlockLimits
    
    // Subaccount block limits
    SubaccountBlockLimits SubaccountBlockLimits
}
```

#### B. Fillable Price Config

**Purpose**: Determines the price at which liquidations can be filled

```go
type FillablePriceConfig struct {
    // Bankruptcy adjustment in PPM (must be >= 1,000,000)
    BankruptcyAdjustmentPpm uint32
    
    // Spread to maintenance margin ratio in PPM (must be > 0)
    SpreadToMaintenanceMarginRatioPpm uint32
}
```

**Default Values** (from tests):
- `BankruptcyAdjustmentPpm`: 1,000,000 (100%)
- `SpreadToMaintenanceMarginRatioPpm`: 100,000 (10%)

#### C. Position Block Limits

**Purpose**: Limits how much of a single position can be liquidated per block

```go
type PositionBlockLimits struct {
    // Minimum notional value that must be liquidated
    MinPositionNotionalLiquidated uint64
    
    // Maximum portion of position that can be liquidated (PPM, must be > 0 and <= 1,000,000)
    MaxPositionPortionLiquidatedPpm uint32
}
```

**Default Values**:
- `MinPositionNotionalLiquidated`: 1,000 (quote quantums)
- `MaxPositionPortionLiquidatedPpm`: 1,000,000 (100%)

**Why these limits?**
- **Min**: Prevents dust liquidations (gas inefficient)
- **Max**: Prevents liquidating entire position in one block (gives time to add collateral)

#### D. Subaccount Block Limits

**Purpose**: Limits total liquidation activity per subaccount per block

```go
type SubaccountBlockLimits struct {
    // Maximum notional that can be liquidated for a subaccount per block
    MaxNotionalLiquidated uint64
    
    // Maximum insurance fund payout per subaccount per block
    MaxQuantumsInsuranceLost uint64
}
```

**Default Values**:
- `MaxNotionalLiquidated`: 100,000,000,000,000 (100 trillion quote quantums)
- `MaxQuantumsInsuranceLost`: 100,000,000,000,000 (100 trillion quote quantums)

**Why these limits?**
- Prevents draining insurance fund in single block
- Limits systemic risk from cascading liquidations
- Allows time for governance intervention if needed

---

### 3. Liquidation Pricing (`keeper/liquidations.go`)

#### A. Fillable Price Calculation (Lines 498-636)

**The Fillable Price Formula**:

```
fillablePrice = (PNNV - ABR * SMMR * PMMR) / PS
```

Where:
- **PNNV**: Position Net Notional Value
- **ABR**: Adjusted Bankruptcy Rating = `BA * (1 - TNC/TMMR)`, clamped to [0, 1]
- **BA**: Bankruptcy Adjustment PPM (from config)
- **SMMR**: Spread to Maintenance Margin Ratio PPM (from config)
- **PMMR**: Position Maintenance Margin Requirement
- **TNC**: Total Net Collateral
- **TMMR**: Total Maintenance Margin Requirement
- **PS**: Position Size

**Step-by-Step Calculation**:

```go
// 1. Calculate ABR (Adjusted Bankruptcy Rating)
tncDivTmmrRat := TNC / TMMR
unboundedAbrRat := (1 - tncDivTmmrRat) * BA
abrRat := Clamp(unboundedAbrRat, 0, 1)

// 2. Calculate maximum liquidation spread
maxLiquidationSpreadQuoteQuantumsRat := PMMR * SMMR

// 3. Calculate fillable price oracle delta
fillablePriceOracleDeltaQuoteQuantumsRat := abrRat * maxLiquidationSpreadQuoteQuantumsRat

// 4. Calculate fillable price in quote quantums
fillablePriceQuoteQuantumsRat := PNNV - fillablePriceOracleDeltaQuoteQuantumsRat

// 5. Calculate final fillable price
fillablePrice := fillablePriceQuoteQuantumsRat / PS
```

**Example**:

```
Scenario: Liquidating a LONG position
- Position Size: 100 BTC
- Oracle Price: $50,000
- PNNV: $5,000,000 (100 * $50,000)
- PMMR: $250,000 (5% of notional)
- TNC: -$10,000 (underwater)
- TMMR: $250,000
- BA: 1,000,000 PPM (100%)
- SMMR: 100,000 PPM (10%)

Step 1: ABR = (1 - (-10,000 / 250,000)) * 1.0 = (1 + 0.04) * 1.0 = 1.04 → clamped to 1.0
Step 2: Max Spread = $250,000 * 0.10 = $25,000
Step 3: Oracle Delta = 1.0 * $25,000 = $25,000
Step 4: Fillable Price QQ = $5,000,000 - $25,000 = $4,975,000
Step 5: Fillable Price = $4,975,000 / 100 = $49,750 per BTC

Result: Liquidation SELL order at $49,750 (0.5% below oracle price)
```

**Key Insights**:
- **More underwater → larger discount**: ABR increases as TNC becomes more negative
- **Higher maintenance margin → larger spread**: Riskier positions get worse prices
- **Bounded by bankruptcy price**: ABR clamped to [0, 1] ensures reasonable pricing
- **Longs get sold below oracle**: Fillable price < oracle price for longs
- **Shorts get bought above oracle**: Fillable price > oracle price for shorts

#### B. Bankruptcy Price Calculation (Lines 389-496)

**The Bankruptcy Price Formula**:

```
bankruptcyPriceQuoteQuantums = -DNNV - (TNC * abs(DMMR) / TMMR)
```

Where:
- **DNNV**: Delta Net Notional Value (change from closing position)
- **DMMR**: Delta Maintenance Margin Requirement (change from closing position)
- **TNC**: Total Net Collateral
- **TMMR**: Total Maintenance Margin Requirement

**Purpose**: The price at which closing the position leaves the subaccount with exactly $0 equity

**Rounding**: Always rounds towards positive infinity to ensure no insurance fund payment needed

**Example**:

```
Scenario: Closing a 100 BTC long position
- Current Position: 100 BTC
- Oracle Price: $50,000
- TNC: -$10,000 (underwater)
- TMMR: $250,000
- PNNV (old): $5,000,000
- PMMR (old): $250,000
- PNNV (new, PS=0): $0
- PMMR (new, PS=0): $0

DNNV = $0 - $5,000,000 = -$5,000,000
DMMR = $0 - $250,000 = -$250,000

bankruptcyPrice = -(-$5,000,000) - (-$10,000 * 250,000 / $250,000)
                = $5,000,000 - (-$10,000)
                = $5,000,000 + $10,000
                = $5,010,000

bankruptcyPrice per BTC = $5,010,000 / 100 = $50,100

Result: If position closes at $50,100 per BTC, subaccount has exactly $0 equity
```

**Why this matters**:
- **Insurance fund delta** = `filledPrice - bankruptcyPrice`
- If `filledPrice > bankruptcyPrice`: Subaccount pays fee to insurance fund
- If `filledPrice < bankruptcyPrice`: Insurance fund covers losses

---

### 4. Liquidation Process Flow (`keeper/liquidations.go`)

#### A. High-Level Liquidation Flow

```
PrepareCheckState (CheckTx):
  ↓
LiquidateSubaccountsAgainstOrderbook()
  ├─ Get liquidatable subaccounts from daemon
  ├─ Pseudo-randomly select up to MaxLiquidationAttemptsPerBlock
  ├─ For each subaccount:
  │   ├─ MaybeGetLiquidationOrder()
  │   │   ├─ EnsureIsLiquidatable() → Check TNC < MMR
  │   │   ├─ GetPerpetualPositionToLiquidate() → Select position
  │   │   ├─ GetLiquidatablePositionSizeDelta() → Calculate size
  │   │   └─ GetFillablePrice() → Calculate price
  │   └─ PlacePerpetualLiquidation()
  │       ├─ MemClob.PlacePerpetualLiquidation()
  │       └─ MustUpdateSubaccountPerpetualLiquidated()
  └─ Return subaccounts requiring deleveraging (unfilled liquidations)
```

#### B. Liquidation Order Generation (Lines 161-241)

**Function**: `MaybeGetLiquidationOrder()`

**Steps**:
1. **Check liquidatable**: `EnsureIsLiquidatable()` - Verify `TNC < MMR`
2. **Select position**: `GetPerpetualPositionToLiquidate()` - Pseudo-random selection
3. **Calculate size**: `GetLiquidatablePositionSizeDelta()` - Respect block limits
4. **Calculate price**: `GetFillablePrice()` - Use fillable price formula
5. **Convert to subticks**: `ConvertFillablePriceToSubticks()` - Round appropriately
6. **Create order**: `NewLiquidationOrder()` - Build liquidation order object

#### C. Pseudo-Random Selection (Lines 64-90)

**Why pseudo-random?**
- Prevents validators from gaming liquidation order
- Ensures fair distribution of liquidation opportunities
- Uses block hash as entropy source

```go
pseudoRand := k.GetPseudoRand(ctx)
numLiqOrders := Min(numSubaccounts, MaxLiquidationAttemptsPerBlock)
indexOffset := pseudoRand.Intn(numSubaccounts)

for i := 0; i < numLiqOrders; i++ {
    index := (i + indexOffset) % numSubaccounts
    subaccountId := subaccountIds[index]
    // Process liquidation...
}
```

#### D. Liquidation Sorting (Lines 1203-1234)

**Sorting Priority**:
1. **Abs percentage diff from oracle price** (descending) - Most underwater first
2. **Order quote quantums** (descending) - Larger positions first
3. **Order hash** (ascending) - Deterministic tiebreaker

**Why this order?**
- **Most underwater first**: Highest risk to system
- **Larger first**: More efficient use of block space
- **Deterministic**: All validators agree on order

```go
func (k Keeper) SortLiquidationOrders(ctx sdk.Context, liquidationOrders []types.LiquidationOrder) {
    sort.Slice(liquidationOrders, func(i, j int) bool {
        x, y := liquidationOrders[i], liquidationOrders[j]
        
        // 1. Sort by abs percentage diff from oracle price (descending)
        xAbsPercentageDiff := k.getAbsPercentageDiffFromOraclePrice(ctx, x)
        yAbsPercentageDiff := k.getAbsPercentageDiffFromOraclePrice(ctx, y)
        if xAbsPercentageDiff.Cmp(yAbsPercentageDiff) != 0 {
            return xAbsPercentageDiff.Cmp(yAbsPercentageDiff) == 1
        }
        
        // 2. Sort by order quote quantums (descending)
        xQuoteQuantums := k.getQuoteQuantumsForLiquidationOrder(ctx, x)
        yQuoteQuantums := k.getQuoteQuantumsForLiquidationOrder(ctx, y)
        if xQuoteQuantums.Cmp(yQuoteQuantums) != 0 {
            return xQuoteQuantums.Cmp(yQuoteQuantums) == 1
        }
        
        // 3. Sort by order hash (ascending) - deterministic tiebreaker
        xHash := x.GetOrderHash()
        yHash := y.GetOrderHash()
        return bytes.Compare(xHash[:], yHash[:]) == -1
    })
}
```

---

### 5. Liquidation Validation (`keeper/liquidations.go`)

#### A. Insurance Fund Validation (Lines 1078-1130)

**Function**: `validateMatchedLiquidation()`

**Checks**:
1. **Calculate insurance fund delta**: `GetLiquidationInsuranceFundDelta()`
2. **Validate insurance fund balance**: `IsValidInsuranceFundDelta()`
3. **Validate subaccount block limits**: `validateLiquidationAgainstSubaccountBlockLimits()`

**Insurance Fund Delta Calculation** (Lines 638-718):

```go
// 1. Calculate delta quantums and delta quote quantums
deltaQuantums := fillAmount (negated if sell)
deltaQuoteQuantums := FillAmountToQuoteQuantums(subticks, fillAmount, quantumConversionExponent)

// 2. Get bankruptcy price
bankruptcyPriceQuoteQuantums := GetBankruptcyPriceInQuoteQuantums(...)

// 3. Calculate insurance fund delta
insuranceFundDelta := deltaQuoteQuantums - bankruptcyPriceQuoteQuantums

// 4. If positive, cap at max liquidation fee
if insuranceFundDelta > 0 {
    maxLiquidationFee := abs(deltaQuoteQuantums) * MaxLiquidationFeePpm
    insuranceFundDelta = Min(maxLiquidationFee, insuranceFundDelta)
}
```

**Possible Outcomes**:
- **Positive delta**: Subaccount pays fee to insurance fund (capped at max fee)
- **Zero delta**: Filled exactly at bankruptcy price
- **Negative delta**: Insurance fund covers losses

#### B. Subaccount Block Limits Validation (Lines 1132-1201)

**Function**: `validateLiquidationAgainstSubaccountBlockLimits()`

**Checks**:
1. **Subaccount + perpetual not previously liquidated in same block**
2. **Total notional liquidated ≤ MaxNotionalLiquidated**
3. **Total insurance lost ≤ MaxQuantumsInsuranceLost** (if insurance fund pays)

**Why these checks?**
- Prevents liquidating same position multiple times per block
- Limits systemic risk from single subaccount
- Protects insurance fund from depletion

---

### 6. MEV (Maximal Extractable Value) Measurement (`keeper/mev.go`)

#### A. What is MEV in dYdX?

**Definition**: The difference in PnL between the block proposer's operations queue and the validator's operations queue

**Formula**:
```
MEV = BlockProposerPnL - ValidatorPnL
```

**Why measure MEV?**
- **Transparency**: Quantify proposer advantage
- **Validator monitoring**: Detect malicious behavior
- **Protocol improvement**: Identify MEV extraction vectors

#### B. MEV Calculation Flow (Lines 64-347)

**Function**: `RecordMevMetrics()`

**Steps**:
1. **Get CLOB metadata**: Mid prices, oracle prices, best bid/ask for all pairs
2. **Initialize cumulative PnLs**: For block proposer and validator
3. **Extract MEV data from operations**:
   - Block proposer's operations: `msgProposedOperations.GetOperationsQueue()`
   - Validator's operations: `k.GetOperations(ctx).GetOperationsQueue()`
4. **Calculate PnL for each**:
   - Regular matches: `CalculateSubaccountPnLForMevMatches()`
   - Liquidation matches: Include insurance fund delta
5. **Calculate MEV per market**: `blockProposerPnL - validatorPnL`
6. **Emit metrics and telemetry**

#### C. Mid Price Calculation with Fallback (Lines 349-402)

**Function**: `GetClobMetadata()`

**Logic**:
```go
midPriceSubticks, bestBid, bestAsk, exist := k.MemClob.GetMidPrice(ctx, clobPairId)
oraclePriceSubticks := k.GetOraclePriceSubticksRat(ctx, clobPair)

// Use oracle price if:
// 1. Mid price doesn't exist, OR
// 2. Spread >= 1% (MAX_SPREAD_BEFORE_FALLING_BACK_TO_ORACLE)
if !exist || (bestAsk - bestBid) / bestBid >= 0.01 {
    midPriceSubticks = oraclePriceSubticks
}
```

**Why fallback to oracle?**
- **Wide spreads**: Indicate illiquid market, mid price unreliable
- **No orders**: Can't calculate mid price
- **MEV accuracy**: Oracle price more stable for PnL calculations

#### D. PnL Calculation for Trades (Lines 792-850)

**Function**: `AddPnLForTradeWithFilledSubticks()`

**Formula**:
```
tradePnL = (isBuy ? -1 : 1) * filledQuoteQuantums - feeQuoteQuantums
```

Where:
```
filledQuoteQuantums = FillAmountToQuoteQuantums(filledSubticks, filledQuantums, quantumConversionExponent)
feeQuoteQuantums = filledQuoteQuantums * feePpm / 1,000,000
```

**Example**:
```
Buy 10 BTC @ $50,000 with 0.05% taker fee:
- filledQuoteQuantums = 10 * $50,000 = $500,000
- feeQuoteQuantums = $500,000 * 500 / 1,000,000 = $250
- tradePnL = -$500,000 - $250 = -$500,250

Sell 10 BTC @ $50,000 with 0.02% maker fee:
- filledQuoteQuantums = 10 * $50,000 = $500,000
- feeQuoteQuantums = $500,000 * 200 / 1,000,000 = $100
- tradePnL = $500,000 - $100 = $499,900
```

---

### 7. Operations Queue & Deterministic Consensus (`keeper/process_operations.go`)

#### A. Why Operations Queue?

**Problem**: Different validators might match orders differently due to:
- Race conditions in mempool
- Different order arrival times
- Non-deterministic matching logic

**Solution**: Block proposer creates **operations queue** with all matches, which all validators replay

**Benefits**:
- **Deterministic**: All validators reach same state
- **Consensus**: Operations queue is part of block proposal
- **Verifiable**: Validators can reject invalid operations

#### B. Operations Queue Structure

**Types of Operations**:
1. **ShortTermOrderPlacement**: Short-term order placed in this block
2. **Match**: Order match (regular, liquidation, or deleveraging)
3. **OrderRemoval**: Stateful order removed (undercollateralized, post-only crossed, etc.)
4. **PreexistingStatefulOrder**: Stateful order from previous block (only in PrepareCheckState)

**Example Operations Queue**:
```
[
  ShortTermOrderPlacement(OrderA),
  ShortTermOrderPlacement(OrderB),
  Match(OrderA, OrderC, fillAmount=100),
  Match(OrderB, OrderD, fillAmount=50),
  OrderRemoval(OrderE, UNDERCOLLATERALIZED),
  MatchPerpetualLiquidation(SubaccountX, [fills...]),
]
```

#### C. Operations Processing Flow (Lines 42-120)

**Function**: `ProcessProposerOperations()`

**Called in**: `DeliverTx` (block execution)

**Steps**:
1. **Stateless validation**: `ValidateAndTransformRawOperations()`
   - Decode short-term order transactions
   - Validate operation structure
   - Transform to internal operations
2. **Stateful validation & execution**: `ProcessInternalOperations()`
   - Validate each operation against current state
   - Execute matches, update fill amounts
   - Remove orders, update state
3. **Generate events**: `GenerateProcessProposerMatchesEvents()`
   - Collect filled order IDs
   - Collect removed order IDs
4. **Remove fully filled orders**: Iterate filled orders, remove if `fillAmount == orderSize`
5. **Update memstore**: `MustSetProcessProposerMatchesEvents()`

#### D. Internal Operations Processing (Lines 122-221)

**Function**: `ProcessInternalOperations()`

**For each operation**:

```go
switch operation.Operation {
case *InternalOperation_Match:
    PersistMatchToState(clobMatch, placedShortTermOrders)
    
case *InternalOperation_ShortTermOrderPlacement:
    PerformStatefulOrderValidation(order)
    placedShortTermOrders[order.OrderId] = order
    
case *InternalOperation_OrderRemoval:
    PersistOrderRemovalToState(orderRemoval)
    
case *InternalOperation_PreexistingStatefulOrder:
    panic("Should not exist in operations queue")
}
```

**Key Insight**: Short-term orders are collected in `placedShortTermOrders` map for subsequent match validation

#### E. Match Persistence (Lines 223-264)

**Function**: `PersistMatchToState()`

**Match Types**:
1. **MatchOrders**: Regular order match
   - `PersistMatchOrdersToState()`
   - Validate taker not post-only
   - Validate immediate execution orders not already filled
   - Process each maker fill via `ProcessSingleMatch()`
   - Emit indexer events
2. **MatchPerpetualLiquidation**: Liquidation match
   - `PersistMatchLiquidationToState()`
   - Validate subaccount is liquidatable
   - Validate liquidation order matches proposed liquidation
   - Process each maker fill via `ProcessSingleMatch()`
   - Update subaccount liquidation info
   - Emit indexer events
3. **MatchPerpetualDeleveraging**: Deleveraging match
   - `PersistMatchDeleveragingToState()`
   - Validate subaccount can be deleveraged
   - Validate isFinalSettlement flag
   - Offset positions at bankruptcy or oracle price
   - Emit indexer events

---

## 🔑 Critical Insights

### 1. Liquidations Are Priced to Incentivize Takers

**Fillable price formula ensures**:
- Liquidations are profitable for takers (discount for longs, premium for shorts)
- More underwater positions get larger discounts
- Bounded by bankruptcy price to protect insurance fund

### 2. Multiple Safety Limits Prevent Systemic Risk

**Liquidation limits**:
- **Per-position**: Max 100% per block (configurable)
- **Per-subaccount**: Max notional + max insurance lost per block
- **Per-block**: Max liquidation attempts (prevents DoS)

**Why layered limits?**
- Prevents cascading liquidations
- Gives users time to add collateral
- Protects insurance fund from depletion

### 3. Insurance Fund Is Last Resort

**Insurance fund delta**:
- **Positive**: Subaccount pays fee (capped at MaxLiquidationFeePpm)
- **Negative**: Insurance fund covers losses

**Validation**:
- Check insurance fund has sufficient balance
- Reject liquidation if insurance fund insufficient
- Trigger deleveraging if needed

### 4. MEV Measurement Enables Transparency

**dYdX measures MEV by**:
- Comparing block proposer's operations to validator's operations
- Calculating PnL difference per market
- Emitting metrics for monitoring

**Benefits**:
- Detect malicious proposers
- Quantify centralization risk
- Inform protocol improvements

### 5. Operations Queue Ensures Determinism

**All validators replay same operations**:
- Block proposer creates operations queue
- Validators validate and execute operations
- State transitions are deterministic
- Consensus on final state

**Why this works**:
- Operations queue is part of block proposal
- Validators can reject invalid operations
- All validators reach same state

### 6. Liquidation Daemon Runs Off-Chain

**Liquidation flow**:
1. **Off-chain daemon**: Monitors subaccounts, identifies liquidatable accounts
2. **PrepareCheckState**: Daemon provides list of liquidatable subaccounts
3. **Keeper**: Generates liquidation orders, places on orderbook
4. **MemClob**: Matches liquidations against resting orders
5. **Operations queue**: Proposer includes liquidation matches
6. **DeliverTx**: All validators execute liquidation matches

**Why off-chain daemon?**
- Expensive to check all subaccounts on-chain
- Daemon can use optimized indexing
- Keeper validates daemon's suggestions

### 7. Pseudo-Random Selection Prevents Gaming

**Liquidation order selection**:
- Use block hash as entropy
- Pseudo-randomly select up to MaxLiquidationAttemptsPerBlock
- Sort by risk (most underwater first)

**Why pseudo-random?**
- Prevents validators from front-running liquidations
- Ensures fair distribution of liquidation opportunities
- Deterministic (same block hash → same selection)

---

## 📊 Flow Diagrams

### Liquidation Complete Flow

```
Off-Chain Liquidation Daemon:
  ├─ Monitor all subaccounts
  ├─ Identify liquidatable (TNC < MMR)
  └─ Provide list to PrepareCheckState
  
PrepareCheckState (CheckTx):
  ↓
LiquidateSubaccountsAgainstOrderbook()
  ├─ Pseudo-randomly select up to MaxLiquidationAttemptsPerBlock
  ├─ For each selected subaccount:
  │   ├─ MaybeGetLiquidationOrder()
  │   │   ├─ EnsureIsLiquidatable() → TNC < MMR?
  │   │   ├─ GetPerpetualPositionToLiquidate() → Select position
  │   │   ├─ GetLiquidatablePositionSizeDelta() → Calculate size (respect limits)
  │   │   ├─ GetFillablePrice() → Calculate price
  │   │   │   ├─ Get position risk (PNNV, PMMR)
  │   │   │   ├─ Get total risk (TNC, TMMR)
  │   │   │   ├─ Calculate ABR = BA * (1 - TNC/TMMR), clamp [0,1]
  │   │   │   ├─ Calculate max spread = PMMR * SMMR
  │   │   │   ├─ Calculate oracle delta = ABR * max spread
  │   │   │   └─ Return (PNNV - oracle delta) / PS
  │   │   └─ ConvertFillablePriceToSubticks() → Round to tick
  │   └─ PlacePerpetualLiquidation()
  │       ├─ MemClob.PlacePerpetualLiquidation() → Match against orderbook
  │       │   ├─ matchOrder() → Standard matching logic
  │       │   ├─ validateMatchedLiquidation()
  │       │   │   ├─ GetLiquidationInsuranceFundDelta()
  │       │   │   ├─ IsValidInsuranceFundDelta() → Insurance fund check
  │       │   │   └─ validateLiquidationAgainstSubaccountBlockLimits()
  │       │   └─ Add matches to operations queue
  │       └─ MustUpdateSubaccountPerpetualLiquidated() → Mark as liquidated
  └─ Return unfilled liquidations → Trigger deleveraging
  
DeliverTx:
  ↓
ProcessProposerOperations()
  ├─ ValidateAndTransformRawOperations() → Decode operations
  ├─ ProcessInternalOperations()
  │   └─ PersistMatchLiquidationToState()
  │       ├─ EnsureIsLiquidatable() → Re-validate
  │       ├─ GetLiquidationOrderForPerpetual() → Regenerate liquidation order
  │       ├─ ValidateLiquidationOrderAgainstProposedLiquidation()
  │       ├─ For each fill:
  │       │   ├─ ProcessSingleMatch() → Update positions, fill amounts
  │       │   └─ Emit indexer event
  │       └─ MustUpdateSubaccountPerpetualLiquidated()
  └─ Remove fully filled orders
```

### MEV Measurement Flow

```
DeliverTx (after ProcessProposerOperations):
  ↓
RecordMevMetrics()
  ├─ GetClobMetadata()
  │   ├─ For each CLOB pair:
  │   │   ├─ GetMidPrice() from MemClob
  │   │   ├─ GetOraclePriceSubticksRat()
  │   │   └─ If !exist || spread >= 1%:
  │   │       └─ Use oracle price as mid price
  │   └─ Return {ClobPair, MidPrice, OraclePrice, BestBid, BestAsk}
  │
  ├─ InitializeCumulativePnLs()
  │   ├─ Create blockProposerPnL map
  │   ├─ Create validatorPnL map
  │   └─ For each CLOB pair:
  │       └─ Initialize CumulativePnL{SubaccountPnL, PositionSizeDelta, NumFills, VolumeQuoteQuantums, Metadata, PerpetualFundingIndex}
  │
  ├─ GetMEVDataFromOperations(blockProposerOperations)
  │   ├─ Extract short-term order placements
  │   ├─ Extract regular matches → MEVMatch{TakerSubaccount, MakerSubaccount, Subticks, FillAmount, Fees}
  │   ├─ Extract liquidation matches → MEVLiquidationMatch{LiquidatedSubaccount, MakerSubaccount, InsuranceFundDelta, Subticks, FillAmount, Fees}
  │   └─ Return ValidatorMevMatches{Matches, LiquidationMatches}
  │
  ├─ CalculateSubaccountPnLForMevMatches(blockProposerPnL, blockProposerMevMatches)
  │   ├─ For each regular match:
  │   │   ├─ Calculate taker PnL = (isBuy ? -1 : 1) * filledQuoteQuantums - feeQuoteQuantums
  │   │   ├─ Calculate maker PnL = (isBuy ? 1 : -1) * filledQuoteQuantums - feeQuoteQuantums
  │   │   └─ Update SubaccountPnL, PositionSizeDelta, NumFills, VolumeQuoteQuantums
  │   └─ For each liquidation match:
  │       ├─ Calculate liquidated PnL = (isBuy ? -1 : 1) * filledQuoteQuantums - insuranceFundDelta
  │       ├─ Calculate maker PnL = (isBuy ? 1 : -1) * filledQuoteQuantums - feeQuoteQuantums
  │       └─ Update SubaccountPnL, PositionSizeDelta, NumFills, VolumeQuoteQuantums
  │
  ├─ GetMEVDataFromOperations(validatorOperations)
  ├─ CalculateSubaccountPnLForMevMatches(validatorPnL, validatorMevMatches)
  │
  ├─ For each CLOB pair:
  │   ├─ Calculate MEV = blockProposerPnL - validatorPnL
  │   ├─ Emit metrics (MEV, volume, num fills, mid price, oracle price)
  │   └─ Log to telemetry
  │
  └─ Send to MEV telemetry hosts (if configured)
```

### Operations Queue Processing Flow

```
PrepareCheckState (CheckTx):
  ├─ Place short-term orders on MemClob
  ├─ Match orders, generate operations
  ├─ Liquidate subaccounts, generate operations
  ├─ Deleverage subaccounts, generate operations
  └─ Store operations in MemClob.operationsToPropose

Block Proposal:
  ├─ Proposer calls GetOperationsToPropose()
  ├─ Encode operations to OperationRaw[]
  └─ Include in MsgProposedOperations

DeliverTx:
  ↓
ProcessProposerOperations(rawOperations)
  ├─ ValidateAndTransformRawOperations()
  │   ├─ For each OperationRaw:
  │   │   ├─ Decode short-term order tx (if ShortTermOrderPlacement)
  │   │   ├─ Validate operation structure
  │   │   └─ Transform to InternalOperation
  │   └─ Return InternalOperation[]
  │
  ├─ ProcessInternalOperations(operations)
  │   ├─ placedShortTermOrders = {}
  │   ├─ For each InternalOperation:
  │   │   ├─ validateInternalOperationAgainstClobPairStatus()
  │   │   └─ Switch on operation type:
  │   │       ├─ Match:
  │   │       │   └─ PersistMatchToState()
  │   │       │       ├─ MatchOrders → PersistMatchOrdersToState()
  │   │       │       ├─ MatchPerpetualLiquidation → PersistMatchLiquidationToState()
  │   │       │       └─ MatchPerpetualDeleveraging → PersistMatchDeleveragingToState()
  │   │       ├─ ShortTermOrderPlacement:
  │   │       │   ├─ PerformStatefulOrderValidation()
  │   │       │   └─ placedShortTermOrders[orderId] = order
  │   │       └─ OrderRemoval:
  │   │           └─ PersistOrderRemovalToState()
  │   │               ├─ Validate removal reason
  │   │               ├─ MustRemoveStatefulOrder()
  │   │               └─ Emit indexer event
  │   └─ Return success/error
  │
  ├─ GenerateProcessProposerMatchesEvents()
  │   ├─ Collect all filled order IDs
  │   └─ Return ProcessProposerMatchesEvents{OrderIdsFilledInLastBlock, RemovedStatefulOrderIds}
  │
  ├─ Remove fully filled stateful orders:
  │   ├─ For each filled order ID:
  │   │   ├─ GetLongTermOrderPlacement()
  │   │   ├─ GetOrderFillAmount()
  │   │   ├─ If fillAmount == orderSize:
  │   │   │   ├─ MustRemoveStatefulOrder()
  │   │   │   └─ Add to RemovedStatefulOrderIds
  │   │   └─ Emit metrics
  │   └─ Update ProcessProposerMatchesEvents
  │
  └─ MustSetProcessProposerMatchesEvents() → Store in memstore
```

---

## 🎓 Understanding Check

Can you answer these?
- [x] What is the fillable price formula and why does it include ABR?
- [x] What is the bankruptcy price and how is it used?
- [x] What are the three types of liquidation limits?
- [x] How does the insurance fund delta work?
- [x] What is MEV and how does dYdX measure it?
- [x] Why does dYdX use an operations queue?
- [x] How does pseudo-random selection prevent gaming?
- [x] What happens if a liquidation can't be filled?

---

## 🔍 Questions for Further Study

1. How does deleveraging work when liquidations fail?
2. What triggers the liquidation daemon to check subaccounts?
3. How are liquidation fees distributed?
4. What happens if insurance fund is depleted?
5. How does the protocol handle MEV extraction by validators?
6. What are the gas costs of liquidations?
7. How does the protocol prevent liquidation cascades?

---

## 💡 Key Takeaways

1. **Liquidations are priced to incentivize participation** - Fillable price formula ensures profitable liquidations
2. **Multiple safety limits protect the system** - Per-position, per-subaccount, and per-block limits
3. **Insurance fund is the last resort** - Covers losses when liquidations fill below bankruptcy price
4. **MEV measurement enables transparency** - Quantifies proposer advantage for monitoring
5. **Operations queue ensures determinism** - All validators replay same operations for consensus
6. **Pseudo-random selection prevents gaming** - Fair distribution of liquidation opportunities
7. **Liquidation daemon runs off-chain** - Efficient monitoring without on-chain overhead
8. **Deleveraging handles unfilled liquidations** - Forced position offsetting when orderbook insufficient

---

## ✅ Completion Status

- [x] Liquidation pricing understood
- [x] Liquidation configuration documented
- [x] MEV measurement analyzed
- [x] Operations queue flow documented
- [x] Flow diagrams created
- [x] Key insights documented

**Files Analyzed**: 5/5
- ✅ `types/liquidation_order.go` (150 lines)
- ✅ `types/liquidations_config.go` (81 lines)
- ✅ `keeper/liquidations.go` (1,266 lines)
- ✅ `keeper/mev.go` (912 lines)
- ✅ `keeper/process_operations.go` (944 lines)

**Total Lines Studied**: 3,353 lines

---

**Next Steps (Day 6)**: Integration & Testing
- Study integration tests for liquidations
- Analyze end-to-end testing strategies
- Review test fixtures and mocks
- Understand testing best practices
