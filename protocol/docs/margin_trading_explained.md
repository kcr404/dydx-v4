# dYdX v4 Margin Trading & Perpetual Positions Explained

## What is `margin_enabled`?

The `margin_enabled` field in a subaccount determines the **margin mode** for that subaccount:

```yaml
margin_enabled: false  # Isolated Margin Mode (default)
margin_enabled: true   # Cross-Margin Mode
```

### Isolated Margin Mode (`margin_enabled: false`)
- **Default mode** for all subaccounts
- Each perpetual position is **isolated** from others
- Collateral (USDC) for one position cannot be used for another
- If one position gets liquidated, it doesn't affect other positions
- **Lower risk** but requires more capital

### Cross-Margin Mode (`margin_enabled: true`)
- All positions in the subaccount **share the same collateral pool**
- Your total USDC balance backs all positions
- More capital efficient (can open larger positions with same collateral)
- **Higher risk**: liquidation of one position can affect the entire account
- Allows for **margin trading** (borrowing to increase position size)

---

## Current Status: ⚠️ NOT YET IMPLEMENTED

According to the codebase comments:

```go
// File: x/subaccounts/simulation/genesis.go:70
// TODO(DEC-582): randomly toggle `MarginEnabled` once we support margin trading.
```

**This means:**
- ✅ The `margin_enabled` field exists in the data structure
- ❌ **Cross-margin mode is NOT yet implemented**
- ❌ **You CANNOT manually enable margin trading** via CLI
- ❌ No transaction type exists to toggle `margin_enabled`
- ✅ All subaccounts currently operate in **Isolated Margin Mode**

---

## Understanding Perpetual Positions

Let's decode Bob's subaccount data:

```yaml
subaccount:
  asset_positions:
  - asset_id: 0
    index: "0"
    quantums: "100001000"  # ~100 USDC collateral
  
  id:
    number: 0
    owner: dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs
  
  margin_enabled: false  # Isolated margin mode
  
  perpetual_positions:
  - funding_index: "0"
    perpetual_id: 35
    quantums: "-1000000"  # NEGATIVE = SHORT position
    quote_balance: "0"
```

### Breaking Down the Perpetual Position

| Field | Value | Meaning |
|-------|-------|---------|
| **perpetual_id** | `35` | The market ID (e.g., BTC-USD, ETH-USD, etc.) |
| **quantums** | `-1000000` | Position size in base quantums |
| **Sign** | Negative (`-`) | **SHORT position** (sold/borrowed) |
| **funding_index** | `0` | Funding rate tracking index |
| **quote_balance** | `0` | Unsettled PnL in quote currency (USDC) |

### Position Direction

```
quantums > 0  →  LONG position  (bought, expecting price to rise)
quantums < 0  →  SHORT position (sold, expecting price to fall)
quantums = 0  →  No position
```

### Example Positions

```yaml
# Example 1: LONG 0.01 BTC
perpetual_positions:
  - perpetual_id: 0  # BTC-USD
    quantums: "1000000"  # Positive = LONG
    
# Example 2: SHORT 1 ETH
perpetual_positions:
  - perpetual_id: 1  # ETH-USD
    quantums: "-100000000"  # Negative = SHORT
    
# Example 3: Multiple positions (Isolated Margin)
perpetual_positions:
  - perpetual_id: 0
    quantums: "1000000"  # LONG BTC
  - perpetual_id: 1
    quantums: "-50000000"  # SHORT ETH
  # Each position uses separate collateral
```

---

## How Trading Works Currently (Without Margin)

### 1. Isolated Margin Trading (Current Implementation)

When you place an order:

```bash
./build/dydxprotocold tx clob place-order \
  "$BOB" 0 "$CID" 35 2 1000000 150000 0 \
  --good-til-block-time "$GTBT" \
  --from "$BOB" \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" \
  --gas 200000 \
  -y --broadcast-mode sync --node "$NODE"
```

**Parameters:**
- `"$BOB"`: Owner address
- `0`: Subaccount number
- `"$CID"`: Client order ID
- `35`: Perpetual ID (market)
- `2`: Side (1=BUY/LONG, 2=SELL/SHORT)
- `1000000`: Size in quantums
- `150000`: Price in subticks
- `0`: Good til block (0 = use --good-til-block-time)

**What happens:**
1. Order is placed on perpetual market 35
2. If matched, a position is opened/modified
3. Collateral is **isolated** to this specific position
4. `margin_enabled` remains `false`

### 2. Collateral Requirements

For **isolated margin** (current mode):
- Each position requires its own collateral
- Initial margin: ~10-20% of position value (varies by market)
- Maintenance margin: ~5-10% of position value
- If margin falls below maintenance → **liquidation**

---

## What You CAN Do Now

### ✅ Available Actions

1. **Open Long/Short Positions**
   ```bash
   # Place a LONG order (BUY)
   ./build/dydxprotocold tx clob place-order \
     "$BOB" 0 "$CID" 35 1 1000000 150000 0 \
     --good-til-block-time "$GTBT" ...
   
   # Place a SHORT order (SELL)
   ./build/dydxprotocold tx clob place-order \
     "$BOB" 0 "$CID" 35 2 1000000 150000 0 \
     --good-til-block-time "$GTBT" ...
   ```

2. **Deposit Collateral**
   ```bash
   ./build/dydxprotocold tx sending deposit-to-subaccount \
     "$BOB" "$BOB" 0 100000000 \
     --from "$BOB" ...
   ```

3. **Use Multiple Subaccounts**
   - Each subaccount can have different positions
   - Subaccounts are **always isolated** from each other
   - Use subaccount 0, 1, 2, ... up to 127

4. **Query Position Status**
   ```bash
   ./build/dydxprotocold query subaccounts show-subaccount \
     "$BOB" 0 --node http://localhost:26657
   ```

### ❌ NOT Available (Yet)

1. **Enable Cross-Margin Mode**
   - No CLI command exists
   - No transaction type to toggle `margin_enabled`
   - Field is read-only in current implementation

2. **Margin Trading (Leverage)**
   - Cannot borrow to increase position size beyond collateral
   - Cannot use shared collateral pool across positions
   - Limited to isolated margin calculations

---

## Future: When Margin Trading is Implemented

Once `margin_enabled` support is added, you would be able to:

### Expected CLI Command (Hypothetical)
```bash
# Enable cross-margin mode
./build/dydxprotocold tx subaccounts set-cross-margin \
  "$BOB" 0 true \
  --from "$BOB" \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" \
  --gas 200000 \
  -y --broadcast-mode sync --node "$NODE"
```

### Benefits of Cross-Margin
- **Higher leverage**: Use all USDC for any position
- **Capital efficiency**: Less collateral needed overall
- **Flexible trading**: Profits from one position support others
- **Risk management**: Shared risk pool (double-edged sword)

---

## Practical Example: Bob's Current Position

Let's analyze Bob's actual subaccount:

```yaml
asset_positions:
  - asset_id: 0
    quantums: "100001000"  # 100.001 USDC

perpetual_positions:
  - perpetual_id: 35
    quantums: "-1000000"  # SHORT position
    quote_balance: "0"
```

**What this means:**
- Bob has **100.001 USDC** as collateral
- Bob has a **SHORT position** on market 35
- Position size: 1,000,000 quantums (size depends on market's quantum definition)
- **Isolated margin**: This USDC only backs this specific position
- No unrealized PnL yet (`quote_balance: 0`)

**If Bob wants to open another position:**
- He would need to deposit more USDC
- Or use a different subaccount
- Cannot share the 100 USDC with a new position (isolated mode)

---

## Summary

| Feature | Current Status | Future (When Implemented) |
|---------|---------------|---------------------------|
| **Isolated Margin** | ✅ Fully supported | ✅ Supported |
| **Cross-Margin** | ❌ Not implemented | ✅ Will be supported |
| **`margin_enabled` field** | ✅ Exists (always `false`) | ✅ Can be toggled |
| **Perpetual Trading** | ✅ Fully supported | ✅ Supported |
| **Leverage** | ⚠️ Limited (isolated only) | ✅ Full leverage |
| **CLI to enable margin** | ❌ Does not exist | ✅ Will exist |

---

## Key Takeaways

1. **`margin_enabled: false`** is the **only mode** currently available
2. You **cannot manually enable** cross-margin mode yet
3. **Perpetual positions work perfectly** in isolated margin mode
4. Each position requires **separate collateral**
5. Use **multiple subaccounts** for position isolation
6. The field exists in the data structure but **functionality is not implemented**

---

## References

- Subaccount Proto Definition: [`x/subaccounts/types/subaccount.pb.go:93-95`](file:///data/data/v4-chain/protocol/x/subaccounts/types/subaccount.pb.go#L93-L95)
- TODO Comment: [`x/subaccounts/simulation/genesis.go:70`](file:///data/data/v4-chain/protocol/x/subaccounts/simulation/genesis.go#L70)
- Subaccount Documentation: [`docs/subaccounts_explained.md`](file:///data/data/v4-chain/protocol/docs/subaccounts_explained.md)
