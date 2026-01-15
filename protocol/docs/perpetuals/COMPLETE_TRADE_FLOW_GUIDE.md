# Complete Trade Flow: Makers, Takers, and Funders Deep Dive

**A comprehensive guide to understanding perpetual trading mechanics on dYdX v4**

---

## 📚 Table of Contents

1. [Core Participants](#core-participants)
2. [Complete Trade Flow Example](#complete-trade-flow-example)
3. [Detailed Role Breakdown](#detailed-role-breakdown)
4. [Terminology Encyclopedia](#terminology-encyclopedia)
5. [Technical Implementation](#technical-implementation)
6. [Real-World Scenarios](#real-world-scenarios)

---

## 🎭 Core Participants

### 1. **Maker** (Liquidity Provider)
**Role**: Provides liquidity by placing limit orders that rest on the orderbook

**Characteristics**:
- Places orders that don't immediately match
- Adds depth to the orderbook
- Receives **maker rebates** (negative fees, typically -0.02%)
- Waits for someone to trade against their order
- Can cancel orders before they're filled

**Example**: Alice places a limit order to BUY 1 BTC at $40,000

### 2. **Taker** (Liquidity Consumer)
**Role**: Removes liquidity by placing orders that immediately match existing orders

**Characteristics**:
- Places orders that cross the spread
- Matches against existing maker orders
- Pays **taker fees** (typically 0.05%)
- Executes immediately at best available price
- Cannot cancel (already executed)

**Example**: Bob places a market order to SELL 1 BTC (matches Alice's order)

### 3. **Funder** (Funding Rate Participant)
**Role**: Participants in the funding rate mechanism that keeps perpetual prices anchored to spot

**Characteristics**:
- **Long funders**: Pay funding when perpetual > spot (bullish positions pay)
- **Short funders**: Receive funding when perpetual > spot (bearish positions receive)
- **Reversed**: When perpetual < spot, shorts pay longs
- Funding exchanged every 8 hours (or per protocol settings)
- No direct order placement - automatic based on position

**Example**: Charlie holds a long BTC position and pays 0.01% funding every 8 hours when BTC perpetual trades above spot

---

## 🔄 Complete Trade Flow Example

### Scenario: BTC-USD Perpetual Trading

**Initial State**:
- BTC Spot Price: $40,000
- BTC Perpetual Price: $40,050 (slightly premium)
- Funding Rate: +0.01% (longs pay shorts)

---

### **Step 1: Maker Places Limit Order (Alice - Long Position)**

**Action**: Alice wants to buy BTC at $40,000

```
Order Details:
- Type: Limit Order (Maker)
- Side: BUY (Long)
- Size: 1 BTC
- Price: $40,000
- Leverage: 10x
- Collateral Required: $4,000 USDC (1 BTC / 10x)
```

**What Happens**:
1. **Collateralization Check**:
   - Alice's subaccount has $5,000 USDC
   - Required margin: $4,000 (initial margin)
   - Maintenance margin: $2,000 (50% of initial)
   - ✅ Check passes

2. **Order Placement**:
   - Order added to orderbook at $40,000 price level
   - Position: Front of queue (price-time priority)
   - Status: **Resting on orderbook**

3. **Orderbook State**:
   ```
   Bids (Buy Orders):
   $40,000: [Alice: 1 BTC] ← Best Bid
   $39,950: [David: 0.5 BTC]
   $39,900: [Emma: 2 BTC]
   
   Asks (Sell Orders):
   $40,100: [Frank: 0.8 BTC] ← Best Ask
   $40,150: [Grace: 1.5 BTC]
   ```

4. **Alice's State**:
   - Position: None yet (order not filled)
   - Locked Collateral: $4,000 USDC
   - Free Collateral: $1,000 USDC
   - Fees: None yet

---

### **Step 2: Taker Matches Order (Bob - Short Position)**

**Action**: Bob wants to sell BTC immediately at market price

```
Order Details:
- Type: Market Order (Taker)
- Side: SELL (Short)
- Size: 1 BTC
- Price: Market (best available)
- Leverage: 5x
- Collateral Required: $8,000 USDC (1 BTC / 5x)
```

**What Happens**:

1. **Order Matching** (MemClob):
   - Bob's sell order crosses the spread
   - Matches against Alice's $40,000 buy order
   - Match price: $40,000 (maker's price)
   - Match size: 1 BTC (full fill)

2. **Collateralization Check**:
   - Bob's subaccount has $10,000 USDC
   - Required margin: $8,000 (initial margin at 5x)
   - Maintenance margin: $4,000
   - ✅ Check passes

3. **Trade Execution**:
   ```
   Match Details:
   - Maker: Alice (BUY 1 BTC @ $40,000)
   - Taker: Bob (SELL 1 BTC @ $40,000)
   - Notional Value: $40,000
   - Maker Fee: -$8 (rebate: -0.02% × $40,000)
   - Taker Fee: +$20 (fee: 0.05% × $40,000)
   ```

4. **Position Updates**:

   **Alice (Maker - Long)**:
   ```
   Before: No position
   After:
   - Position: +1 BTC (Long)
   - Entry Price: $40,000
   - Notional: $40,000
   - Leverage: 10x
   - Collateral: $4,000 USDC
   - Fee Rebate: +$8 USDC
   - Total Collateral: $4,008 USDC
   - Unrealized PnL: $0
   ```

   **Bob (Taker - Short)**:
   ```
   Before: No position
   After:
   - Position: -1 BTC (Short)
   - Entry Price: $40,000
   - Notional: $40,000
   - Leverage: 5x
   - Collateral: $8,000 USDC
   - Fee Paid: -$20 USDC
   - Total Collateral: $7,980 USDC
   - Unrealized PnL: $0
   ```

5. **Orderbook Update**:
   ```
   Bids (Buy Orders):
   $39,950: [David: 0.5 BTC] ← New Best Bid
   $39,900: [Emma: 2 BTC]
   
   Asks (Sell Orders):
   $40,100: [Frank: 0.8 BTC] ← Best Ask
   $40,150: [Grace: 1.5 BTC]
   ```

---

### **Step 3: Funding Rate Mechanism (8 Hours Later)**

**Market State**:
- BTC Spot Price: $40,200
- BTC Perpetual Price: $40,300 (premium persists)
- Funding Rate: +0.01% per 8 hours

**What Happens**:

1. **Funding Rate Calculation**:
   ```
   Premium = (Perpetual - Spot) / Spot
   Premium = ($40,300 - $40,200) / $40,200 = 0.25%
   
   Funding Rate = Premium × Dampening Factor
   Funding Rate = 0.25% × 0.04 = 0.01%
   ```

2. **Funding Payment Direction**:
   - Perpetual > Spot → **Longs pay Shorts**
   - Alice (Long) pays funding
   - Bob (Short) receives funding

3. **Funding Calculation**:

   **Alice (Long Position)**:
   ```
   Position Size: 1 BTC
   Notional Value: $40,300 (current mark price)
   Funding Rate: 0.01%
   
   Funding Payment = $40,300 × 0.01% = $4.03
   Alice PAYS $4.03 to funding pool
   
   Updated Collateral: $4,008 - $4.03 = $4,003.97 USDC
   ```

   **Bob (Short Position)**:
   ```
   Position Size: -1 BTC
   Notional Value: $40,300
   Funding Rate: 0.01%
   
   Funding Received = $40,300 × 0.01% = $4.03
   Bob RECEIVES $4.03 from funding pool
   
   Updated Collateral: $7,980 + $4.03 = $7,984.03 USDC
   ```

4. **Funding Mechanism Purpose**:
   - Incentivizes arbitrage between perpetual and spot
   - When perpetual > spot: Longs pay → Encourages shorts → Brings price down
   - When perpetual < spot: Shorts pay → Encourages longs → Brings price up
   - Keeps perpetual price anchored to spot without expiration

---

### **Step 4: Price Movement & PnL**

**Market Moves**: BTC perpetual price rises to $42,000

**Alice (Long Position) - PROFIT**:
```
Entry Price: $40,000
Current Price: $42,000
Position: +1 BTC

Unrealized PnL = (Current - Entry) × Size
Unrealized PnL = ($42,000 - $40,000) × 1 = +$2,000

Total Equity = Collateral + PnL - Funding
Total Equity = $4,008 + $2,000 - $4.03 = $6,003.97 USDC

ROI = $2,000 / $4,000 = 50% (on 10x leverage)
```

**Bob (Short Position) - LOSS**:
```
Entry Price: $40,000
Current Price: $42,000
Position: -1 BTC

Unrealized PnL = (Entry - Current) × Size
Unrealized PnL = ($40,000 - $42,000) × 1 = -$2,000

Total Equity = Collateral + PnL + Funding
Total Equity = $7,980 - $2,000 + $4.03 = $5,984.03 USDC

ROI = -$2,000 / $8,000 = -25% (on 5x leverage)

Liquidation Check:
Maintenance Margin = $4,000
Current Equity = $5,984.03
✅ Safe (above maintenance margin)
```

---

### **Step 5: Position Closing**

**Alice Closes Long** (Takes Profit):

```
Action: Place SELL market order for 1 BTC
Match Price: $42,000 (current best bid)

Closing Trade:
- Alice becomes TAKER (market order)
- Matches against another maker's buy order
- Taker Fee: 0.05% × $42,000 = $21

Final PnL Calculation:
Entry: $40,000
Exit: $42,000
Gross Profit: $2,000

Fees:
- Entry Fee (Maker Rebate): +$8
- Exit Fee (Taker Fee): -$21
- Funding Paid: -$4.03
Total Fees: -$17.03

Net Profit = $2,000 - $17.03 = $1,982.97
ROI = $1,982.97 / $4,000 = 49.57%

Final Collateral: $4,000 + $1,982.97 = $5,982.97 USDC
```

**Bob Closes Short** (Cuts Loss):

```
Action: Place BUY market order for 1 BTC
Match Price: $42,000 (current best ask)

Closing Trade:
- Bob becomes TAKER (market order)
- Matches against another maker's sell order
- Taker Fee: 0.05% × $42,000 = $21

Final PnL Calculation:
Entry: $40,000
Exit: $42,000
Gross Loss: -$2,000

Fees:
- Entry Fee (Taker Fee): -$20
- Exit Fee (Taker Fee): -$21
- Funding Received: +$4.03
Total Fees: -$36.97

Net Loss = -$2,000 - $36.97 = -$2,036.97
ROI = -$2,036.97 / $8,000 = -25.46%

Final Collateral: $8,000 - $2,036.97 = $5,963.03 USDC
```

---

## 🔍 Detailed Role Breakdown

### Maker Role Deep Dive

**Advantages**:
1. **Fee Rebates**: Earn -0.02% on every trade (get paid to trade)
2. **Price Control**: Set your desired entry price
3. **No Slippage**: Execute at exact limit price
4. **Queue Priority**: First in line at price level (FIFO)

**Disadvantages**:
1. **Execution Risk**: Order may not fill
2. **Opportunity Cost**: Capital locked while waiting
3. **Adverse Selection**: May fill at worst times (when price moves against you)
4. **Cancellation Needed**: Must actively cancel if market moves

**Best For**:
- Market makers providing liquidity
- Patient traders with price targets
- High-frequency traders
- Arbitrageurs

**Strategy Example**:
```
Scenario: BTC trading at $40,000

Maker Strategy (Market Making):
1. Place BUY limit @ $39,950 (0.5 BTC)
2. Place SELL limit @ $40,050 (0.5 BTC)
3. Spread: $100 ($50 each side)
4. If both fill: Profit = $100 - fees
5. Continuously adjust as market moves
```

---

### Taker Role Deep Dive

**Advantages**:
1. **Immediate Execution**: Instant fill
2. **Certainty**: Know you'll get filled
3. **Simplicity**: No order management needed
4. **Urgency**: Can act on time-sensitive information

**Disadvantages**:
1. **Fees**: Pay 0.05% taker fee
2. **Slippage**: May get worse price than expected
3. **Market Impact**: Large orders move the market
4. **No Rebates**: Always pay, never earn

**Best For**:
- Retail traders
- Urgent position changes
- Stop-loss/take-profit execution
- News-based trading

**Strategy Example**:
```
Scenario: Breaking news - BTC ETF approved!

Taker Strategy (Momentum):
1. Immediate market BUY order
2. Accept current best ask price
3. Pay taker fee for instant execution
4. Capture price movement before others
```

---

### Funder Role Deep Dive

**Funding Rate Mechanics**:

**When Perpetual > Spot (Premium)**:
```
Longs PAY funding → Shorts RECEIVE funding

Example:
- Perpetual: $40,300
- Spot: $40,000
- Premium: 0.75%
- Funding Rate: 0.01% per 8 hours

Long Position (1 BTC):
- Pays: $40,300 × 0.01% = $4.03 every 8 hours
- Annual Cost: $4.03 × 3 × 365 = $4,412.85 (11% APR)

Short Position (1 BTC):
- Receives: $4.03 every 8 hours
- Annual Yield: 11% APR
```

**When Perpetual < Spot (Discount)**:
```
Shorts PAY funding → Longs RECEIVE funding

Example:
- Perpetual: $39,700
- Spot: $40,000
- Discount: -0.75%
- Funding Rate: -0.01% per 8 hours

Long Position (1 BTC):
- Receives: $39,700 × 0.01% = $3.97 every 8 hours
- Annual Yield: 10% APR

Short Position (1 BTC):
- Pays: $3.97 every 8 hours
- Annual Cost: 10% APR
```

**Funding Rate Strategies**:

1. **Basis Trading** (Market Neutral):
   ```
   Setup:
   - Buy BTC spot: $40,000
   - Short BTC perpetual: $40,300
   - Locked-in profit: $300
   - Receive funding: 0.01% per 8 hours
   
   Total Return:
   - Price convergence: $300
   - Funding income: ~11% APR
   - Risk: Nearly zero (hedged)
   ```

2. **Funding Arbitrage**:
   ```
   When funding is high (longs pay):
   - Short perpetual
   - Collect funding payments
   - Close when funding normalizes
   ```

---

## 📖 Terminology Encyclopedia

### A-C

**Ask (Offer)**:
- Sell orders on the orderbook
- Lowest ask = best price to buy at
- Example: "Best ask is $40,100"

**Base Asset**:
- The asset being traded (BTC in BTC-USD)
- Position size denominated in base asset
- Example: "Long 1 BTC"

**Bid**:
- Buy orders on the orderbook
- Highest bid = best price to sell at
- Example: "Best bid is $40,000"

**Collateral**:
- USDC deposited to back positions
- Determines max leverage
- Can be liquidated if insufficient

**Cross Margin**:
- All positions share same collateral pool
- Losses in one position offset by gains in another
- Used by dYdX v4

### D-F

**Deleveraging**:
- Forced position closure when insurance fund depleted
- Occurs during extreme liquidations
- Counterparty positions reduced

**Entry Price**:
- Average price of position opening
- Used for PnL calculation
- Example: "Entered long at $40,000"

**Funding Rate**:
- Periodic payment between longs and shorts
- Anchors perpetual to spot price
- Paid/received every 8 hours

**Fill**:
- Order execution (partial or full)
- Creates position or modifies existing
- Example: "Order filled at $40,000"

### G-L

**Good-Til-Block (GTB)**:
- Short-term order expiration
- Expires at specific block height
- Example: "GTB 1000" (expires at block 1000)

**Good-Til-Time (GTT)**:
- Long-term order expiration
- Expires at specific timestamp
- Example: "GTT 1705334400" (Unix timestamp)

**Initial Margin**:
- Minimum collateral to open position
- Determines max leverage
- Example: 10% initial = 10x max leverage

**Isolated Margin**:
- Each position has separate collateral
- Liquidation doesn't affect other positions
- NOT used by dYdX v4 (uses cross margin)

**Leverage**:
- Position size / Collateral
- Amplifies gains and losses
- Example: 10x leverage = 10% margin

**Limit Order**:
- Order at specific price or better
- Becomes maker if doesn't immediately fill
- Example: "Buy limit @ $40,000"

**Liquidation**:
- Forced position closure
- Occurs when equity < maintenance margin
- Protects protocol from bad debt

### M-P

**Maintenance Margin**:
- Minimum equity to keep position open
- Below this = liquidation
- Typically 50% of initial margin

**Maker**:
- Provides liquidity (limit orders)
- Receives fee rebates
- Adds depth to orderbook

**Market Order**:
- Order at best available price
- Always taker (immediate execution)
- May experience slippage

**Mark Price**:
- Fair price used for liquidations
- Prevents manipulation
- Based on oracle + orderbook

**Notional Value**:
- Position size × Current price
- Used for margin calculations
- Example: 1 BTC @ $40,000 = $40,000 notional

**Open Interest**:
- Total value of all open positions
- Indicates market activity
- Example: "$1B open interest in BTC-USD"

**Oracle Price**:
- External price feed (from Slinky oracle)
- Used for mark price calculation
- Prevents orderbook manipulation

**Perpetual Contract**:
- Derivative with no expiration
- Tracks spot via funding rate
- Can hold indefinitely

**Position**:
- Open long or short exposure
- Measured in base asset
- Example: "Position: +2.5 BTC (long)"

**PnL (Profit and Loss)**:
- Unrealized: Current position value change
- Realized: Closed position profit/loss
- Example: "+$2,000 unrealized PnL"

### Q-S

**Quote Asset**:
- Asset used for pricing (USD in BTC-USD)
- Collateral denominated in quote asset
- Example: "Collateral: 5,000 USDC"

**Reduce-Only Order**:
- Can only decrease position size
- Cannot increase or flip position
- Used for closing positions safely

**Slippage**:
- Difference between expected and executed price
- Occurs with market orders
- Higher in illiquid markets

**Spread**:
- Difference between best bid and best ask
- Indicates liquidity
- Example: "Spread: $100 ($40,000 bid, $40,100 ask)"

**Subaccount**:
- Isolated trading account
- Holds collateral and positions
- Can have multiple per wallet

**Subticks**:
- Smallest price increment
- Enables precise pricing
- Example: "1 subtick = $0.01"

### T-Z

**Taker**:
- Removes liquidity (market orders)
- Pays taker fees
- Immediate execution

**Time-in-Force**:
- Order duration rules
- Types: GTC, IOC, FOK, Post-Only
- Controls order behavior

**Unrealized PnL**:
- Profit/loss on open positions
- Changes with mark price
- Not locked in until closed

**USDC**:
- Stablecoin used as collateral
- Quote asset for all markets
- 1 USDC ≈ 1 USD

---

## ⚙️ Technical Implementation

### Order Matching Algorithm

**Price-Time Priority**:
```
1. Best Price First:
   - Highest bid matched first (for sells)
   - Lowest ask matched first (for buys)

2. Time Priority (FIFO):
   - Within same price level
   - First order placed = first matched
   - Fair queue system

Example Orderbook:
Bids:
  $40,000: [Alice (10:00), Bob (10:05), Carol (10:10)]
  $39,950: [David (09:00)]

Incoming SELL order matches:
  1. Alice first (best price + earliest time)
  2. Bob second (same price, next in time)
  3. Carol third (same price, last in time)
```

### Collateralization Formula

```
Initial Margin Requirement = Position Notional / Max Leverage
Maintenance Margin = Initial Margin × Maintenance Fraction

Example (10x leverage, 50% maintenance):
Position: 1 BTC @ $40,000
Initial Margin = $40,000 / 10 = $4,000
Maintenance Margin = $4,000 × 0.5 = $2,000

Liquidation occurs when:
Equity = Collateral + Unrealized PnL < Maintenance Margin
```

### Funding Rate Calculation

```
Premium Index = (Perpetual Price - Spot Price) / Spot Price

Funding Rate = Premium Index × Dampening Factor

Dampening Factor = Time Period / 24 hours
For 8-hour funding: 8/24 = 0.333

Example:
Perpetual: $40,300
Spot: $40,000
Premium: ($40,300 - $40,000) / $40,000 = 0.75%
Funding Rate = 0.75% × 0.333 = 0.25% per 8 hours

Annual Rate = 0.25% × 3 × 365 = 273.75% APR
```

### Liquidation Process

```
1. Monitor Equity:
   Equity = Collateral + Unrealized PnL - Funding Paid

2. Check Maintenance Margin:
   If Equity < Maintenance Margin → Liquidation

3. Liquidation Execution:
   - Position closed at bankruptcy price
   - Insurance fund covers losses
   - If insurance insufficient → Deleveraging

4. Bankruptcy Price:
   Long: Entry Price - (Collateral / Position Size)
   Short: Entry Price + (Collateral / Position Size)

Example (Long):
Entry: $40,000
Collateral: $4,000
Size: 1 BTC
Bankruptcy: $40,000 - ($4,000 / 1) = $36,000
```

---

## 🌍 Real-World Scenarios

### Scenario 1: Market Making Strategy

**Setup**:
- Capital: $100,000 USDC
- Market: BTC-USD
- Current Price: $40,000
- Target: Earn maker rebates + spread

**Execution**:
```
1. Place Buy Limit Orders:
   - $39,950 × 0.5 BTC (Collateral: $2,000)
   - $39,900 × 0.5 BTC (Collateral: $2,000)
   - $39,850 × 0.5 BTC (Collateral: $2,000)

2. Place Sell Limit Orders:
   - $40,050 × 0.5 BTC (Collateral: $2,000)
   - $40,100 × 0.5 BTC (Collateral: $2,000)
   - $40,150 × 0.5 BTC (Collateral: $2,000)

Total Collateral Used: $12,000
Free Collateral: $88,000

3. When Orders Fill:
   - Earn maker rebate: -0.02%
   - Capture spread: $50-$150 per BTC
   - Rebalance and repeat

Daily Target:
- 10 round trips × 0.5 BTC = 5 BTC volume
- Spread profit: 5 × $100 = $500
- Maker rebates: $200,000 × 0.02% = $40
- Total: $540/day = 0.54% daily = ~197% APR
```

### Scenario 2: Funding Arbitrage

**Setup**:
- Funding Rate: +0.05% per 8 hours (high)
- Perpetual: $40,500
- Spot: $40,000

**Strategy**:
```
1. Short Perpetual:
   - Size: 10 BTC
   - Entry: $40,500
   - Collateral: $81,000 (5x leverage)

2. Buy Spot (on CEX):
   - Size: 10 BTC
   - Cost: $400,000

3. Funding Income:
   - Receive: $40,500 × 10 × 0.05% = $202.50 per 8 hours
   - Daily: $607.50
   - Annual: $221,737.50 (55% APR on $400k)

4. Exit When:
   - Funding normalizes (< 0.01%)
   - Prices converge
   - Lock in convergence profit + funding income
```

### Scenario 3: Liquidation Cascade

**Market Crash Scenario**:
```
Initial State:
- BTC Price: $40,000
- Total Long Open Interest: $1B
- Average Leverage: 10x

Price Drops to $36,000 (-10%):

1. First Wave Liquidations:
   - 10x leveraged longs liquidated
   - Forced selling: $100M notional
   - Price drops further to $35,500

2. Second Wave:
   - 8x leveraged longs liquidated
   - More forced selling
   - Price drops to $35,000

3. Insurance Fund:
   - Covers losses from liquidations
   - If depleted → Deleveraging
   - Profitable shorts partially closed

4. Market Stabilization:
   - Liquidations complete
   - New equilibrium at $35,000
   - Funding rate flips negative (shorts pay longs)
```

---

## 🎓 Key Takeaways

### For Makers:
1. **Patience Pays**: Wait for fills, earn rebates
2. **Manage Risk**: Cancel orders if market moves against you
3. **Provide Liquidity**: Help market efficiency
4. **Optimize Spreads**: Balance fill rate vs profit

### For Takers:
1. **Speed Costs**: Pay for immediate execution
2. **Watch Slippage**: Large orders impact price
3. **Use Strategically**: When timing matters
4. **Consider Limits**: Sometimes waiting saves fees

### For Funders:
1. **Understand Direction**: Know who pays whom
2. **Monitor Rates**: High rates = opportunity
3. **Hedge Positions**: Basis trading for low risk
4. **Time Matters**: Funding accrues continuously

### Universal Principles:
1. **Leverage Amplifies**: Both gains and losses
2. **Collateral is King**: Manage it carefully
3. **Fees Matter**: They compound over time
4. **Risk Management**: Always have a plan

---

## 📚 Further Reading

- **CLOB Study**: `../clob/study/` - Deep dive into matching engine
- **Margin Trading**: `./margin/` - Margin system details
- **Testing**: `../../testing/` - Test trading scenarios
- **Architecture**: `../../architecture/` - System design

---

**Last Updated**: January 15, 2026  
**Version**: 1.0  
**Author**: dYdX v4 Documentation Team
