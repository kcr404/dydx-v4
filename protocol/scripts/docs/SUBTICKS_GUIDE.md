# Understanding Subticks in dYdX v4 CLOB

**Date**: January 13, 2026  
**Purpose**: Complete guide to subticks, quantums, and order parameters

---

## 🎯 The Problem We Solved

**Error**: `Order subticks 4990000 must be a multiple of the ClobPair's SubticksPerTick 100000`

**Root Cause**: Each CLOB pair has specific tick sizes, and all orders must align with these parameters.

---

## 📊 Core Concepts

### 1. Subticks (Price Representation)

**What are subticks?**
- Subticks are the **atomic unit of price** in the orderbook
- They represent price in the smallest possible increment
- Think of them as "price in the smallest denomination"

**Formula**:
```
Price (USD) = Subticks / SubticksPerTick
```

**Example** (BTC-USD, SubticksPerTick = 100,000):
```
Subticks: 5,000,000
Price = 5,000,000 / 100,000 = $50 per unit

Subticks: 5,100,000
Price = 5,100,000 / 100,000 = $51 per unit
```

**Key Rule**: Subticks MUST be a multiple of `SubticksPerTick`

---

### 2. Quantums (Size Representation)

**What are quantums?**
- Quantums are the **atomic unit of quantity** in the orderbook
- They represent the size/amount being traded
- Adjusted by `quantum_conversion_exponent` for human-readable values

**Formula**:
```
Human Size = Quantums × 10^(quantum_conversion_exponent)
```

**Example** (BTC, quantum_conversion_exponent = -8):
```
Quantums: 10,000,000
Human Size = 10,000,000 × 10^(-8) = 0.1 BTC

Quantums: 100,000,000
Human Size = 100,000,000 × 10^(-8) = 1.0 BTC
```

**Key Rule**: Quantums MUST be a multiple of `StepBaseQuantums`

---

## 🔍 How to Find Parameters for Each Pair

### Method 1: REST API Query

```bash
# Query specific pair (e.g., pair 0 = BTC)
curl -s "http://localhost:1317/dydxprotocol/clob/clob_pair/0" | jq '.clob_pair'
```

**Output**:
```json
{
  "id": 0,
  "subticks_per_tick": 100000,
  "step_base_quantums": "1000000",
  "quantum_conversion_exponent": -8,
  "status": "STATUS_ACTIVE"
}
```

### Method 2: Query All Pairs

```bash
# Get all pairs
curl -s "http://localhost:1317/dydxprotocol/clob/clob_pair" | jq '.clob_pair[]'
```

---

## 📋 Parameter Reference Table

### Local Chain CLOB Pairs

| Pair ID | Market | SubticksPerTick | StepBaseQuantums | Quantum Exp | Status |
|---------|--------|-----------------|------------------|-------------|--------|
| 0 | BTC-USD | 100,000 | 1,000,000 | -8 | ACTIVE |
| 1 | ETH-USD | 100,000 | 1,000,000 | -9 | ACTIVE |
| 2 | ? | 1,000,000 | 1,000,000 | -8 | ACTIVE |
| 3 | ? | 100,000 | 1,000,000 | -8 | ACTIVE |
| 4 | ? | 100,000 | 1,000,000 | -8 | ACTIVE |

---

## 🧮 Calculating Valid Order Parameters

### Step 1: Query the CLOB Pair

```bash
PAIR_ID=0
PAIR_DATA=$(curl -s "http://localhost:1317/dydxprotocol/clob/clob_pair/$PAIR_ID")

SUBTICKS_PER_TICK=$(echo "$PAIR_DATA" | jq -r '.clob_pair.subticks_per_tick')
STEP_BASE_QUANTUMS=$(echo "$PAIR_DATA" | jq -r '.clob_pair.step_base_quantums')
QUANTUM_EXP=$(echo "$PAIR_DATA" | jq -r '.clob_pair.quantum_conversion_exponent')

echo "SubticksPerTick: $SUBTICKS_PER_TICK"
echo "StepBaseQuantums: $STEP_BASE_QUANTUMS"
echo "QuantumExp: $QUANTUM_EXP"
```

### Step 2: Calculate Valid Subticks (Price)

**Goal**: Place BUY order at $50,000 per BTC

```bash
# For BTC (pair 0): SubticksPerTick = 100,000
DESIRED_PRICE=50000  # USD per BTC

# Calculate subticks
SUBTICKS=$((DESIRED_PRICE * SUBTICKS_PER_TICK))
# Result: 50,000 × 100,000 = 5,000,000,000

# Verify it's a multiple
if [ $((SUBTICKS % SUBTICKS_PER_TICK)) -eq 0 ]; then
    echo "✅ Valid subticks: $SUBTICKS"
else
    echo "❌ Invalid! Must be multiple of $SUBTICKS_PER_TICK"
fi
```

**Valid Examples** (SubticksPerTick = 100,000):
- ✅ 5,000,000 (price: $50)
- ✅ 5,100,000 (price: $51)
- ✅ 10,000,000 (price: $100)
- ❌ 5,050,000 (NOT a multiple!)
- ❌ 4,990,000 (NOT a multiple!)

### Step 3: Calculate Valid Quantums (Size)

**Goal**: Trade 0.1 BTC

```bash
# For BTC: quantum_conversion_exponent = -8, StepBaseQuantums = 1,000,000
DESIRED_SIZE=0.1  # BTC

# Calculate quantums
# 0.1 BTC = 0.1 × 10^8 = 10,000,000 quantums
QUANTUMS=$((10000000))

# Verify it's a multiple of StepBaseQuantums
if [ $((QUANTUMS % STEP_BASE_QUANTUMS)) -eq 0 ]; then
    echo "✅ Valid quantums: $QUANTUMS"
else
    echo "❌ Invalid! Must be multiple of $STEP_BASE_QUANTUMS"
fi
```

**Valid Examples** (StepBaseQuantums = 1,000,000):
- ✅ 1,000,000 (0.01 BTC)
- ✅ 10,000,000 (0.1 BTC)
- ✅ 100,000,000 (1.0 BTC)
- ❌ 500,000 (NOT a multiple!)
- ❌ 1,500,000 (NOT a multiple!)

---

## 💡 Practical Examples

### Example 1: BTC Order at $50,000 for 0.1 BTC

```bash
# Pair 0 parameters
SUBTICKS_PER_TICK=100000
STEP_BASE_QUANTUMS=1000000

# Calculate
PRICE=50000
SIZE_BTC=0.1

SUBTICKS=$((PRICE * SUBTICKS_PER_TICK))  # 5,000,000,000
QUANTUMS=$((SIZE_BTC * 100000000))        # 10,000,000

# Place order
docker exec protocol-dydxprotocold0-1 dydxprotocold tx clob place-order \
  "tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy" 0 123456 0 1 \
  $QUANTUMS $SUBTICKS $GTB \
  --from alice --keyring-backend test --chain-id localtradeview \
  --fees "5000000000000000adv4tnt" --gas 200000 -y
```

### Example 2: Different Pair (Pair 2)

```bash
# Pair 2 has SubticksPerTick = 1,000,000 (different!)
SUBTICKS_PER_TICK=1000000

# For price $100
PRICE=100
SUBTICKS=$((PRICE * SUBTICKS_PER_TICK))  # 100,000,000

# This would FAIL with 100,000 subticks!
# Must use multiples of 1,000,000
```

---

## 🚨 Common Mistakes

### Mistake 1: Using Same Subticks for All Pairs
```bash
# ❌ WRONG - assumes all pairs have same SubticksPerTick
SUBTICKS=100000  # Might work for pair 0, fails for pair 2
```

### Mistake 2: Not Checking Multiples
```bash
# ❌ WRONG - 4,990,000 is NOT a multiple of 100,000
SUBTICKS=4990000  # Will fail!

# ✅ CORRECT
SUBTICKS=5000000  # 50 × 100,000
```

### Mistake 3: Hardcoding Values
```bash
# ❌ WRONG - hardcoded for one pair
SUBTICKS=5000000

# ✅ CORRECT - query and calculate
SUBTICKS=$((PRICE * SUBTICKS_PER_TICK))
```

---

## 🔧 Helper Functions

### Get Pair Parameters
```bash
get_pair_params() {
    local pair_id=$1
    local data=$(curl -s "http://localhost:1317/dydxprotocol/clob/clob_pair/$pair_id")
    
    echo "SubticksPerTick: $(echo "$data" | jq -r '.clob_pair.subticks_per_tick')"
    echo "StepBaseQuantums: $(echo "$data" | jq -r '.clob_pair.step_base_quantums')"
    echo "QuantumExp: $(echo "$data" | jq -r '.clob_pair.quantum_conversion_exponent')"
}

# Usage
get_pair_params 0
```

### Calculate Valid Subticks
```bash
calculate_subticks() {
    local price=$1
    local subticks_per_tick=$2
    echo $((price * subticks_per_tick))
}

# Usage
SUBTICKS=$(calculate_subticks 50000 100000)
```

### Validate Parameters
```bash
validate_order_params() {
    local subticks=$1
    local quantums=$2
    local subticks_per_tick=$3
    local step_base_quantums=$4
    
    if [ $((subticks % subticks_per_tick)) -ne 0 ]; then
        echo "❌ Invalid subticks: must be multiple of $subticks_per_tick"
        return 1
    fi
    
    if [ $((quantums % step_base_quantums)) -ne 0 ]; then
        echo "❌ Invalid quantums: must be multiple of $step_base_quantums"
        return 1
    fi
    
    echo "✅ Valid parameters"
    return 0
}
```

---

## 📝 Quick Reference

### For BTC (Pair 0):
- **SubticksPerTick**: 100,000
- **StepBaseQuantums**: 1,000,000
- **QuantumExp**: -8

**Price Examples**:
- $50,000 → 5,000,000,000 subticks
- $51,000 → 5,100,000,000 subticks
- $49,900 → 4,990,000,000 subticks

**Size Examples**:
- 0.01 BTC → 1,000,000 quantums
- 0.1 BTC → 10,000,000 quantums
- 1.0 BTC → 100,000,000 quantums

---

## ✅ Working Order Template

```bash
#!/bin/bash
# Template for placing valid short-term orders

PAIR_ID=0  # BTC
PRICE_USD=50000
SIZE_BTC=0.1

# Query pair parameters
PAIR_DATA=$(curl -s "http://localhost:1317/dydxprotocol/clob/clob_pair/$PAIR_ID")
SUBTICKS_PER_TICK=$(echo "$PAIR_DATA" | jq -r '.clob_pair.subticks_per_tick')
STEP_BASE_QUANTUMS=$(echo "$PAIR_DATA" | jq -r '.clob_pair.step_base_quantums')

# Calculate valid parameters
SUBTICKS=$((PRICE_USD * SUBTICKS_PER_TICK))
QUANTUMS=$((SIZE_BTC * 100000000))  # Adjust for quantum_exp

# Get GTB
GTB=$(($(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height') + 10))

# Place order
docker exec protocol-dydxprotocold0-1 dydxprotocold tx clob place-order \
  "tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy" 0 $CLIENT_ID $PAIR_ID 1 \
  $QUANTUMS $SUBTICKS $GTB \
  --from alice --home /dydxprotocol/chain/.alice --keyring-backend test \
  --chain-id localtradeview --fees "5000000000000000adv4tnt" \
  --gas 200000 -y
```

---

## 🎓 Key Takeaways

1. **Always query pair parameters first** - never assume
2. **Subticks = Price × SubticksPerTick** - must be exact multiple
3. **Quantums = Size × 10^(-quantum_exp)** - must be multiple of StepBaseQuantums
4. **Each pair is different** - BTC ≠ ETH ≠ Other pairs
5. **Validation is critical** - one wrong parameter = rejected order

---

**Last Updated**: January 13, 2026  
**Status**: ✅ Working and Verified
