# dYdX v4 Subaccounts Explained

## Available Keys in Your Keyring

You have **2 keys** available in the test keyring:

| Name | Address | Type |
|------|---------|------|
| **alice** | `dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4` | local |
| **bob** | `dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs` | local |

---

## What is a Subaccount?

In dYdX v4, a **subaccount** is a logical subdivision of a user's account that allows for **isolated trading positions**. Each user can have multiple subaccounts (numbered 0, 1, 2, ..., up to 127).

### Key Characteristics:
- **Owner**: The main wallet address (e.g., Bob's address)
- **Number**: Subaccount ID (0-127)
- **Asset Positions**: Holdings of assets like USDC
- **Perpetual Positions**: Open positions in perpetual futures markets
- **Margin Enabled**: Whether cross-margin is enabled

---

## Bob's Current Subaccounts

### Subaccount 0 (Active)
```yaml
Owner: dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs
Number: 0
Asset Positions:
  - Asset ID: 0 (USDC)
    Quantums: 100,001,000 (~100 USDC)
Perpetual Positions:
  - Perpetual ID: 35
    Quantums: -1,000,000 (SHORT position)
    Quote Balance: 0
Margin Enabled: false
```

### Subaccount 1 (Empty)
```yaml
Owner: dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs
Number: 1
Asset Positions: []
Perpetual Positions: []
Margin Enabled: false
```

---

## How the Previous Script Works

Let's break down [fund_and_test_bob.sh](file:///data/data/v4-chain/protocol/scripts/fund_and_test_bob.sh):

### Step 1: Get Bob's Address
```bash
BOB=$(./build/dydxprotocold keys show bob --home ./tmp_keyring --keyring-backend test -a)
```
- Retrieves Bob's address from the keyring
- Result: `dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs`

### Step 2: Deposit to Subaccount 0
```bash
./build/dydxprotocold tx sending deposit-to-subaccount "$BOB" "$BOB" 0 100000000 \
  --from "$BOB" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 -y --broadcast-mode sync --node "$NODE"
```

**Command Breakdown:**
- `deposit-to-subaccount`: Transaction type
- `"$BOB"`: Sender address (from wallet)
- `"$BOB"`: Recipient address (to subaccount owner)
- `0`: **Subaccount number** (this is subaccount 0)
- `100000000`: Amount in quantums (100 USDC with 6 decimals)

### Step 3: Wait for Block Inclusion
```bash
sleep 6
```
- Waits for the transaction to be included in a block

### Step 4: Place Stateful Order
```bash
./scripts/test_stateful_nonmatching.sh
```
- Places a non-matching stateful order from Bob's subaccount 0

---

## How to Use a New Subaccount

### Option 1: Using Subaccount 1

To deposit to **subaccount 1** instead of subaccount 0:

```bash
./build/dydxprotocold tx sending deposit-to-subaccount "$BOB" "$BOB" 1 50000000 \
  --from "$BOB" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 -y --broadcast-mode sync --node "$NODE"
```

**Change**: The `0` becomes `1` (fourth parameter)

### Option 2: Placing Orders from Subaccount 1

When placing an order, you specify the subaccount number:

```bash
./build/dydxprotocold tx clob place-order \
  "$BOB" 1 0 0 \
  SIDE_SELL \
  100000 \
  5000000000000 \
  0 \
  "$GTB" \
  0 \
  0 \
  --from "$BOB" \
  --home ./tmp_keyring \
  --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" \
  --gas 200000 \
  -y \
  --broadcast-mode sync \
  --node "$NODE"
```

**Order Parameters:**
1. `"$BOB"`: Owner address
2. `1`: **Subaccount number** (using subaccount 1)
3. `0`: Client ID
4. `0`: Order flags
5. `SIDE_SELL`: Order side (SELL or BUY)
6. `100000`: Quantums (size)
7. `5000000000000`: Subticks (price)
8. `0`: Good til block time
9. `"$GTB"`: Good til block (expiration)
10. `0`: Time in force
11. `0`: Reduce only

---

## Demo Script

I've created a demonstration script: [demo_bob_subaccount.sh](file:///data/data/v4-chain/protocol/scripts/demo_bob_subaccount.sh)

This script will:
1. Show Bob's current subaccounts (0 and 1)
2. Deposit 50 USDC to subaccount 1
3. Place a SELL order from subaccount 1
4. Display the final state

### Run it:
```bash
cd /data/data/v4-chain/protocol
bash ./scripts/demo_bob_subaccount.sh
```

---

## Why Use Multiple Subaccounts?

1. **Isolation**: Separate trading strategies or positions
2. **Risk Management**: Limit exposure per subaccount
3. **Organization**: Different subaccounts for different markets
4. **Margin Isolation**: Each subaccount has its own margin calculations

---

## Subaccount Number Range

- **Valid range**: 0 to 127 (128 total subaccounts per address)
- **Default**: Most scripts use subaccount 0
- **Creation**: Subaccounts are created automatically when you deposit to them

---

## Quick Reference Commands

### List all keys:
```bash
./build/dydxprotocold keys list --home ./tmp_keyring --keyring-backend test
```

### Check a specific subaccount:
```bash
./build/dydxprotocold query subaccounts show-subaccount <ADDRESS> <SUBACCOUNT_NUMBER> --node http://localhost:26657
```

### Deposit to a subaccount:
```bash
./build/dydxprotocold tx sending deposit-to-subaccount <FROM_ADDRESS> <TO_ADDRESS> <SUBACCOUNT_NUMBER> <AMOUNT> \
  --from <SIGNER> --home ./tmp_keyring --keyring-backend test \
  --chain-id localdydxprotocol --fees 5000000000000000adv4tnt --gas 200000 -y \
  --broadcast-mode sync --node http://localhost:26657
```
