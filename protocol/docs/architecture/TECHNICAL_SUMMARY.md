# dYdX v4 Localnet Technical Summary & Guide

## 1. Overview
This document details the complete flow of setting up a dYdX v4 localnet, executing various trade types, debugging transaction inclusion issues, and validating the order matching engine. It serves as a comprehensive guide for developers looking to replicate this environment.

## 2. Environment Setup (Node Running)
To run a local chain, we utilize the provided `Makefile` and Docker stack.

### Prerequisites
- Docker & Docker Compose
- Go 1.21+
- `make`

### Step-by-Step Setup
1.  **Clean State**: Always start fresh to avoid state conflicts.
    ```bash
    make localnet-stop
    make clean
    # If permission errors occur (common on Linux):
    docker run --rm -v $(pwd):/workspace -w /workspace alpine rm -rf localnet
    ```

2.  **Build Binary**:
    ```bash
    make build
    # Binary location: build/dydxprotocold
    ```

3.  **Start Localnet**:
    ```bash
    make localnet-startd
    ```
    *Note: The genesis process (`scripts/local.sh`) takes time to initialize validators and oracle prices.*

### Challenges & Fixes
-   **Port Conflicts**: The default `docker-compose.yml` maps full node streaming to port `9093`. If this is in use, modify the mapping (e.g., to `19093:9092`).
-   **Governance Compatibility**: Newer SDK versions require `submit-legacy-proposal` instead of `submit-proposal` for text-based proposals.

## 3. Trade Types & Mechanics
We explored three primary transaction categories on the dYdX chain.

### A. Short-Term Orders (Ephemeral)
-   **Flag**: Uses `GoodTilBlock` (Block Height).
-   **Behavior**: These orders are **stateless**. They pass `CheckTx` but are **filtered out** of the block proposal by design.
-   **Inclusion**: They *only* appear on-chain if they are immediately matched by the `MemClob` (Memory Central Limit Order Book). If not matched, they vanish.
-   **Use Case**: High-frequency market making where chain bloat must be minimized.
-   **Testing Warning**: Scripts that place these orders *sequentially* (one by one) will fail to match, as the first order "vanishes" before the second arrives. To test matching, you must execute orders **concurrently** (hitting the same block window).

### B. Long-Term Orders (Stateful)
-   **Flag**: Uses `--good-til-block-time` (Timestamp).
-   **Behavior**: These are **stateful**. They persist in the chain state until filled, canceled, or expired.
-   **Inclusion**: Guaranteed inclusion in blocks (if valid).
-   **Use Case**: Manual trading, GTC (Good-Till-Cancel) orders, and **deterministic testing**.

### C. Order Matching
-   **Mechanism**: A match occurs when a Taker order crosses a Maker order's price.
-   **Verification**:
    -   Alice places a Buy Limit Order (Stateful).
    -   Bob places a Sell Limit Order (Stateful) at a lower price.
    -   **Result**: Both transactions appear in the block, and fills are recorded.

## 4. Key Challenges & Solutions

### Issue 1: "Disappearing" Transactions
**Symptom**: `place-order` returns `code: 0` (valid CheckTx), but the transaction hash is not found on-chain.
**Root Cause**:
1.  **Short-Term Filtering**: As described above, Short-Term orders are dropped if not matched.
2.  **Insufficient Margin**: Even Stateful orders are dropped from the *block proposal* (after passing CheckTx) if the subaccount has insufficient funds.

### Issue 2: Subaccount Funding (The "Bob" Problem)
**Symptom**: Alice's orders pass, but Bob's identically configured orders fail to appear on-chain.
**Solution**:
dYdX trading requires funds in the **Subaccount**, not just the Bank module.
```bash
# Correctly fund subaccount 0
./build/dydxprotocold tx sending deposit-to-subaccount <ADDRESS> <ADDRESS> 0 <AMOUNT> ...
```

## 5. Replication Guide (How to Run This)
Follow these steps to run the full test suite.

### 1. Start the Chain
```bash
make localnet-startd
```

### 2. Run CLI Tests (Gov, Staking, Vault)
```bash
./scripts/run_cli_tests.sh
```

### 3. Verify Trading & Matching
We have created a unified script to fund accounts and verify matching.
```bash
./scripts/test_matching_orders.sh
```
*Expected Output: "SUCCESS: Both orders included."*

### 4. Advanced: Verify Short-Term (Ephemeral) Mechanics
To prove that Short-Term orders work despite being visible only in memory:
```bash
./scripts/demonstrate_ephemeral_matching.sh
```
*   This script attempts to fire orders perfectly concurrently.
*   **Success**: Position sizes change.
*   **Failure**: No change (if timing misses).
*   *Note: This emulates a "Bot" behavior using shell background jobs.*

### 4. Project Structure (Reference)
-   `scripts/`: Contains all executable test scripts.
-   `docs/`: Contains deep-dive guides (`MEMPOOL_AND_FIX_GUIDE.md`, `CLI_TESTING_GUIDE.md`).
-   `build/`: Contains the chain binary.

---
