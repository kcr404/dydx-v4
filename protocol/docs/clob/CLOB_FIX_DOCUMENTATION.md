# CLOB Fix Documentation

This document combines the **Production Fix Guide** (instructions for applying fixes) and the **Walkthrough** (explanation of the issue and verification).

---

# Part 1: Production Fix & Configuration Guide

This section outlines the critical changes required to resolve **CLOB Order Inclusion** issues and enable **Stateful Order** functionality. These changes address bugs in transaction processing and misconfigurations in the genesis state.

## 1. Critical Code Bug Fix (Protocol)

### Issue: "First Transaction Dropped" in PrepareProposal
A bug in `app/prepare/prepare_proposal.go` caused the first transaction in every proposal request to be silently dropped during the `RemoveDisallowMsgs` check. This often resulted in valid user orders (if they were the first tx) effectively vanishing.

### **File**: `protocol/app/prepare/prepare_proposal.go`

#### **change**:
In function `PrepareProposalHandler`:

```go
// BEFORE (Bugged): Incorrectly slices [1:] skipping the first tx
txsWithoutDisallowMsgs := RemoveDisallowMsgs(ctx, txConfig.TxDecoder(), req.Txs[1:])

// AFTER (Fixed): Process all transactions
txsWithoutDisallowMsgs := RemoveDisallowMsgs(ctx, txConfig.TxDecoder(), req.Txs)
```

## 2. Genesis Configuration Updates

### Issue: Equity Tier Limits Blocking Orders
The default genesis configuration restricted "Tier 0" accounts (test accounts with 0 USDC collateral but valid funds) to **0 open orders**. This caused `CheckTx` to reject all orders from these accounts immediately.

### **File**: `genesis.json` (or `testing/genesis.sh` generator)

#### **Change 1: Increase Equity Tier 0 Limit**
Allow Tier 0 accounts to place orders.

**JSON Path**: `app_state.clob.equity_tier_limit_config.short_term_order_equity_tiers.[0]`
**JSON Path**: `app_state.clob.equity_tier_limit_config.stateful_order_equity_tiers.[0]`

```bash
# Example bash command using dasel (as seen in genesis.sh)
# Set Short-Term Limit to 100 (was 0)
dasel put -t int -f "$GENESIS" '.app_state.clob.equity_tier_limit_config.short_term_order_equity_tiers.[0].limit' -v '100'

# Set Stateful Limit to 100 (was 0)
dasel put -t int -f "$GENESIS" '.app_state.clob.equity_tier_limit_config.stateful_order_equity_tiers.[0].limit' -v '100'
```

### Issue: Strict Block Rate Limits
The default rate limit for Stateful Orders was set to **2 per block**, which can easily be hit during testing or active usage, causing intermittent "transaction dropped" behavior.

#### **Change 2: Increase Stateful Order Block Limit**
Increase the capacity for processing stateful orders per block.

**JSON Path**: `app_state.clob.block_rate_limit_config.max_stateful_orders_per_n_blocks.[0]`

```bash
# Example bash command
# Set Limit to 100 (was 2)
dasel put -t int -f "$GENESIS" '.app_state.clob.block_rate_limit_config.max_stateful_orders_per_n_blocks.[0].limit' -v '100'
```

## 3. CLI Feature Enhancement (Optional)

### Issue: Unable to Place Stateful Orders via CLI
The default `dydxprotocold tx clob place-order` command only supported Short-Term orders (`GoodTilBlock`). Stateful orders (`GoodTilBlockTime`) are required for non-expiring limit orders.

### **File**: `protocol/x/clob/client/cli/tx_place_order.go`

#### **Change**:
Add logic to handle `--good-til-block-time` flag and set correct `OrderFlags`.

```go
// In CmdPlaceOrder...

// Parse flag
gtbt, err := cmd.Flags().GetUint32("good-til-block-time")

// logic to switch between Short-Term and Long-Term (Stateful)
if gtbt > 0 {
    order.GoodTilOneof = &types.Order_GoodTilBlockTime{GoodTilBlockTime: gtbt}
    order.OrderId.OrderFlags = types.OrderIdFlags_LongTerm
} else {
    order.GoodTilOneof = &types.Order_GoodTilBlock{GoodTilBlock: argGoodTilBlock}
    order.OrderId.OrderFlags = types.OrderIdFlags_ShortTerm
}
```

## 4. Summary of Fixes

| Component | File | Action | Impact |
| :--- | :--- | :--- | :--- |
| **Protocol** | `app/prepare/prepare_proposal.go` | **Fix Slice Index** `[1:]` -> `[]` | Prevents the first user transaction in a block from being dropped. |
| **Genesis** | `genesis.json` | **Tier 0 Limit** 0 -> 100 | Allows test accounts (Tier 0) to place orders instead of being rejected. |
| **Genesis** | `genesis.json` | **Stateful Rate Limit** 2 -> 100 | Prevents intermittent drops when >2 stateful orders are placed in a block. |
| **CLI** | `tx_place_order.go` | **Add Logic** | Enables testing of Stateful Orders via CLI. |

---

# Part 2: Walkthrough & Verification

This section documents the successful resolution of the issue where user and test accounts were unable to place orders on the localnet CLOB.

## 1. The Problem
- **Symptom**: Orders placed via CLI or scripts were silently dropped or rejected.
- **Root Cause 1**: **Genesis Configuration**. The default localnet configuration set the **Equity Tier Limit** for Tier 0 accounts (empty or test accounts) to **0**, causing immediate rejection in `CheckTx`.
- **Root Cause 2**: **Logic Bug**. A bug in `PrepareProposal` (`req.Txs[1:]`) caused the *first* transaction in a block proposal to be inadvertently dropped.
- **Intermittent Failure**: A strict **Block Rate Limit** (2 orders/block) caused flaky behavior during stress testing.

## 2. The Solution

### Configuration Changes
Modified `genesis.sh` to:
1. Increase **Equity Tier 0 Limit** from 0 to **100**.
2. Increase **Max Stateful Orders Per Block** from 2 to **100**.

### Code Changes
Patched `app/prepare/prepare_proposal.go` to correctly process all transactions:
```go
// Fixed:
txsWithoutDisallowMsgs := RemoveDisallowMsgs(ctx, txConfig.TxDecoder(), req.Txs)
```

## 3. Verification Results

After applying the fixes and completely resetting the localnet, we verified valid behavior:

### Successful Order Inclusion
We placed a Stateful Order using the `place-stateful-order.sh` script (modified to target Bob).

**Transaction Details**:
- **Owner**: Bob (`dydx10fx...`)
- **Type**: Stateful Order (`GoodTilBlockTime`)
- **Status**: **INCLUDED** in Block 23
- **Code**: `0` (Success)

**Log Proof**:
```text
[Bob] Placing SELL order...
Bob txhash: 0A6C8EB3E06EA8BEC3B3DBFBDA588209338B13369442459317EA520C91E3F065

==========================================
Polling for tx inclusion...
...
[Bob] INCLUDED at height 23, code=0
```
