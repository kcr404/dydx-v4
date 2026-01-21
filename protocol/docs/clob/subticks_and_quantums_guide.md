# Subticks and Quantums Guide

## Overview

In dYdX v4, we don't use decimals (like `0.001` or `50000.50`) for prices and sizes on the blockchain. Computers can sometimes make tiny errors with decimals (floating-point math), which is unacceptable for financial applications.

Instead, we use **integers** (whole numbers) for everything.
*   **Quantums** represent the **Size** (Amount) of an asset.
*   **Subticks** represent the **Price** of an asset.

Think of it like using "cents" instead of "dollars". Instead of saying `$1.50`, you say `150` cents. It's precise and leaves no room for error.

---

## 1. Quantums (Size)

**Quantums** are the smallest indivisible unit of an asset you can trade.

*   **Analogy**: 
    *   For **USDC**, the smallest unit is often `0.000001` USDC (6 decimals). So, 1 Quantum = 1 micro-USDC.
    *   For **BTC**, the smallest unit is often `0.00000001` BTC (8 decimals). This is known as a "Satoshi". So, 1 Quantum = 1 Satoshi.

### How to Calculate User Size -> Quantums

You need to know the **Atomic Resolution** of the asset (the number of decimals).

$$ \text{Quantums} = \text{Size} \times 10^{\text{Atomic Resolution}} $$

#### Example: BTC (Atomic Resolution = 8)
*   You want to trade **0.1 BTC**.
*   Calculation: $0.1 \times 10^8 = 0.1 \times 100,000,000 = 10,000,000$ Quantums.
*   **Result**: You send `10000000` to the chain.

---

## 2. Subticks (Price)

**Subticks** represent the price on the CLOB (Central Limit Order Book).

Unlike a simple conversion, `Subticks` are defined by the **Quote Asset** (usually USDC) and the **Subticks per Tick** parameter.
This allows the exchange to define a very precise "price grid".

### How to Calculate User Price -> Subticks

You need to know the **Subticks per Tick** parameter for the specific market (ClobPair). This value determines how many "steps" exist between each price tick.

$$ \text{Subticks} = \text{Price} \times \text{Subticks per Tick} $$

*(Note: This assumes the price is already in terms of the Quote Asset's main unit, e.g., 50,000 USDC)*.

#### Example: BTC-USD
*   You want to place an order at **$50,000**.
*   The market is configured with `SUBTICKS_PER_TICK = 100,000` (This means there are 100,000 intermediate price steps per $1).
*   Calculation: $50,000 \times 100,000 = 5,000,000,000$ Subticks.
*   **Result**: You send `5000000000` as the price to the chain.

---

## 3. Walkthrough of Your Example

Let's break down the example script you found:

```bash
# Pair 0 parameters
SUBTICKS_PER_TICK=100000    # 100,000 subticks per $1
STEP_BASE_QUANTUMS=1000000  # Minimum size increment (not used in direct calculation but for validation)

# Trade Details
# Price: $50,000
# Size:  0.1 BTC
```

### Step A: Calculate Subticks (Price)
$$ 50,000 \text{ (Price)} \times 100,000 \text{ (Subticks per Tick)} = 5,000,000,000 \text{ Subticks} $$

### Step B: Calculate Quantums (Size)
$$ 0.1 \text{ (BTC)} \times 100,000,000 \text{ (Atomic Resolution } 10^8\text{)} = 10,000,000 \text{ Quantums} $$

### The Command
```bash
docker exec protocol-dydxprotocold0-1 dydxprotocold tx clob place-order \
  ... \
  10000000 \   # Quantums (Size)
  5000000000 \ # Subticks (Price)
  ...
```

## Why is it different for different CLOB pairs?
Every market (pair) has different volatility and price ranges.
*   **BTC ($50,000)**: A movement of $0.01 is tiny. We might not need super granular subticks, or maybe we do for high-frequency trading.
*   **DOGE ($0.10)**: A movement of $0.01 is huge (10%). We need **lots** of subticks between $0.10 and $0.11 to allow people to trade at $0.10001, $0.10002, etc.

Therefore, `SUBTICKS_PER_TICK` is a configurable parameter set by governance for each market to optimize for its specific price scale.
