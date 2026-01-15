# CLI Testing Guide for dYdX v4 Localnet

This guide provides CLI commands to test advanced chain features beyond basic order placement.

> **Prerequisites**: Ensure you are in the `protocol` directory and have the `dydxprotocold` binary built.
> Set up variables for easier copy-pasting:

```bash
# Setup Environment
export ALICE=$(./build/dydxprotocold keys show alice --home ./tmp_keyring --keyring-backend test -a)
export BOB=$(./build/dydxprotocold keys show bob --home ./tmp_keyring --keyring-backend test -a)
export CHAIN_ID="localdydxprotocol"
export FEES="5000000000000000adv4tnt"
export NODE="http://localhost:26657"

# Helper function for tx submission
dydx_tx() {
  ./build/dydxprotocold tx "$@" --home ./tmp_keyring --keyring-backend test --chain-id "$CHAIN_ID" --fees "$FEES" --gas 200000 -y --node "$NODE" --broadcast-mode sync
}
```

---

## 1. Advanced Trading (CLOB)
*Note: The CLI currently supports "Limit" orders (Short-Term and Stateful). Advanced types like Stop-Loss or Conditional are typically submitted via API/Indexer, but basic Stateful orders can be tested here.*

### Place a Stateful Order (Long-Term)
Stateful orders stay on the book until filled or cancelled (unlike Short-Term which expire in ~5 blocks).
```bash
# 1 hour from now
GTBT=$(($(date +%s) + 3600))
# Args: owner, subaccount, client_id, pair_id, side(1=Buy,2=Sell), quantums, subticks, good_til_block (ignored for stateful)
dydx_tx clob place-order "$ALICE" 0 123 35 1 1000000 100000 0 --good-til-block-time "$GTBT"
```

### Cancel an Order
```bash
# Args: owner, subaccount, client_id, pair_id, good_til_block, good_til_block_time
dydx_tx clob cancel-order "$ALICE" 0 123 35 0 "$GTBT"
```

---

## 2. Vaults & Yield
Test depositing into the MegaVault (automated LP vault).

### Deposit to MegaVault
```bash
# Args: owner, subaccount_number, quote_quantums
# Deposit 10 USDC (assuming 1 USDC = 1e6 quantums)
dydx_tx vault deposit-to-megavault "$ALICE" 0 10000000
```

### Withdraw from MegaVault
```bash
# Args: owner, subaccount_number, shares, min_quote_quantums
dydx_tx vault withdraw-from-megavault "$ALICE" 0 100 0
```

---

## 3. Governance
Propose and vote on network changes.

### Submit a Text Proposal
```bash
dydx_tx gov submit-proposal \
  --title "Test Proposal" \
  --description "Testing governance on localnet" \
  --type "Text" \
  --from "$ALICE"
```

### Vote on Proposal
```bash
# Vote "Yes" on Proposal #1
dydx_tx gov vote 1 yes --from "$ALICE"
```

---

## 4. Staking
Manage validator delegations.

### Delegate Tokens
Delegate funds to a validator to earn staking rewards.
```bash
# Get Validator Address
VAL_ADDR=$(./build/dydxprotocold keys show alice --home ./tmp_keyring --keyring-backend test --bech val -a)

# Delegate 100 tokens
dydx_tx staking delegate "$VAL_ADDR" 100000000adv4tnt --from "$ALICE"
```

### Check Delegations
```bash
./build/dydxprotocold query staking delegations "$ALICE" --node "$NODE"
```

---

## 5. Cross-Chain Bridge (Simulation)
In Localnet, the `bridge-daemon` usually handles events. You can manually simulate acknowledging a bridge event if you have the rights.
*Note: This usually requires the `bridge` module authority account, but you can query params.*

```bash
./build/dydxprotocold query bridge safety-params --node "$NODE"
```
