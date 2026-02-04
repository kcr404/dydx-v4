# Scripts Subdirectories Guide

**Date**: January 13, 2026  
**Purpose**: Documentation for scripts in subdirectories (markets, governance, vault)

---

## 📁 Directory Structure

```bash
scripts/
├── markets/          (2 files)
├── governance/       (9 files)
├── vault/            (1 file)
├── affiliates/
├── bridge_events/
├── debugging/
├── genesis/
├── revshare/
└── ... (other subdirectories)
```

---

## 🏪 Markets Scripts (2 files)

### 1. `launch_markets.py` ⭐ Main Script

**Purpose**: Automates launching new markets on dYdX v4

**What it does**:

- Syncs market map from mainnet to testnet/staging
- Makes Alice a market authority via governance proposal
- Creates and launches new markets automatically
- Handles retries and error recovery

**Key Features**:

- Queries mainnet market map
- Compares with local/staging market map
- Adds missing markets via governance
- Submits `create-markets` and `create-market` transactions

**Usage**:

```bash
python3 scripts/markets/launch_markets.py \
  --chain-id dydxprotocol-testnet \
  --node https://validator.v4staging.dydx.exchange:443 \
  --number-markets 5
```

**Requirements**:

- Python 3 with `yaml`, `json` modules
- Alice must have authority (script handles this)
- Sufficient native tokens for fees

**Use Case**: Staging/testnet market synchronization

---

### 2. `get_isolated_market_insurance_fund.py`

**Purpose**: Calculates insurance fund for isolated markets

**What it does**:

- Queries market parameters
- Calculates required insurance fund
- Useful for market risk management

**Usage**: Primarily for analysis/reporting

---

## 🏛️ Governance Scripts (9 files)

### Shell Scripts (5 files)

#### 1. `enable_all_clob_pairs.sh` ⭐ Useful

**Purpose**: Generates governance proposal to enable trading on all CLOB pairs

**What it does**:

- Takes CLOB pairs JSON as input
- Generates `MsgUpdateClobPair` proposal
- Sets all pairs to ACTIVE status

**Usage**:

```bash
# 1. Get clob pairs
curl -X GET "http://localhost:1317/dydxprotocol/clob/clob_pair" > /tmp/clob_pairs.json

# 2. Generate proposal
./scripts/governance/enable_all_clob_pairs.sh /tmp/clob_pairs.json > /tmp/proposal.json

# 3. Submit proposal
dydxprotocold tx gov submit-proposal /tmp/proposal.json \
  --from alice --gas auto --fees 400000000000000000adv4tnt
```

**Use Case**: Bulk enable markets after genesis

---

#### 2. `submit_and_vote_proposal.sh`

**Purpose**: Submit and auto-vote on governance proposals

**Usage**: Automated governance for testing

---

#### 3. `submit_proposal.sh`

**Purpose**: Submit governance proposals

**Usage**: Generic proposal submission

---

#### 4. `vote_in_dev.sh`, `vote_in_staging.sh`, `vote_in_testnet.sh`

**Purpose**: Vote on proposals in different environments

**Usage**: Environment-specific voting scripts

---

### Python Scripts (4 files)

#### 1. `bridge_vesters_set_rewards.py`

**Purpose**: Configure bridge vesting rewards

**Use Case**: Bridge module configuration

---

#### 2. `community_treasury_sending.py`

**Purpose**: Community treasury fund transfers

**Use Case**: Treasury management

---

#### 3. `create_delisting_proposal.py`

**Purpose**: Generate market delisting proposals

**Use Case**: Market lifecycle management

---

## 🏦 Vault Scripts (1 file)

### `get_vault.go` ⭐ Utility Tool

**Purpose**: Derives vault address from vault type and number

**What it does**:

- Takes vault type (e.g., "clob") and number
- Calculates the corresponding subaccount address
- Used for vault deposits/queries

**Usage**:

```bash
# Get BTC vault address (CLOB pair 0)
go run scripts/vault/get_vault.go -type clob -number 0

# Get ETH vault address (CLOB pair 1)
go run scripts/vault/get_vault.go -type clob -number 1
```

**Output Example**:

```
Using the following configuration (modifiable via flags):
type: VAULT_TYPE_CLOB
number: 0

Vault:
  Owner: tradeview1c0m5x87llaunl5sgv3q5vd7j5uha26d2jeq777
  Number: 0
```

**Use Case**:

- Finding vault addresses for deposits
- Querying vault balances
- Understanding vault structure

---

## 🧪 Can We Run These on Local Chain?

### ✅ CAN RUN (with local chain)

1. **`get_vault.go`** - ✅ YES
   - Pure calculation, no chain interaction
   - Works offline
   - Useful for getting vault addresses

2. **`enable_all_clob_pairs.sh`** - ✅ YES
   - Can generate proposals for local chain
   - Requires local REST endpoint
   - Useful for enabling markets

### ⚠️ REQUIRES MODIFICATION

1. **`launch_markets.py`** - ⚠️ PARTIAL
   - Designed for testnet/staging
   - Would need modification for local chain
   - Requires governance setup

2. **Governance scripts** - ⚠️ PARTIAL
   - Can work with local chain
   - Need to adjust node URLs
   - Require funded accounts

### ❌ NOT SUITABLE FOR LOCAL

1. **Market sync scripts** - ❌ NO
   - Require mainnet connection
   - Not useful for isolated local testing

---

## 📝 Practical Examples

### Example 1: Get Vault Address

```bash
# Get BTC vault (pair 0)
go run scripts/vault/get_vault.go -type clob -number 0

# Output: tradeview1c0m5x87llaunl5sgv3q5vd7j5uha26d2jeq777
```

### Example 2: Enable All Markets (Local)

```bash
# 1. Query local CLOB pairs
curl -s "http://localhost:1317/dydxprotocol/clob/clob_pair" > /tmp/local_pairs.json

# 2. Generate proposal
./scripts/governance/enable_all_clob_pairs.sh /tmp/local_pairs.json > /tmp/enable_proposal.json

# 3. Submit (using Docker)
docker exec protocol-dydxprotocold0-1 dydxprotocold tx gov submit-proposal \
  /tmp/enable_proposal.json \
  --from alice --home /dydxprotocol/chain/.alice --keyring-backend test \
  --chain-id localdydxprotocol --fees 400000000000000000adv4tnt --yes
```

### Example 3: Vote on Proposal (Local)

```bash
# Vote yes on proposal 1
docker exec protocol-dydxprotocold0-1 dydxprotocold tx gov vote 1 yes \
  --from alice --home /dydxprotocol/chain/.alice --keyring-backend test \
  --chain-id localdydxprotocol --fees 5000000000000000adv4tnt --yes
```

---

## 🎯 Summary

### Most Useful for Local Testing

1. ✅ `get_vault.go` - Vault address calculator
2. ✅ `enable_all_clob_pairs.sh` - Bulk enable markets
3. ✅ Governance voting scripts - Test governance

### Production/Staging Only

1. ❌ `launch_markets.py` - Market synchronization
2. ❌ Market insurance fund scripts - Production analysis

### Key Takeaways

- **Vault scripts**: Utility tools, work anywhere
- **Governance scripts**: Can adapt for local testing
- **Market scripts**: Designed for production/staging sync

---

**Next Steps:**

1. Test `get_vault.go` on local chain
2. Try enabling markets with governance script
3. Explore other subdirectories (affiliates, revshare, etc.)
