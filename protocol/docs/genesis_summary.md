# Genesis File Summary (`genesis.json`)

**Location:** `/data/.dydxprotocol/config/genesis.json`

---

## Chain & Network Overview

- **Chain ID:** `dydx-testnet-1`
- **App Name:** `dydxprotocold`
- **App Version:** `9.0.0-62-g55bdb1a96`
- **Genesis Time:** `2025-12-22T09:42:40.465841339Z`
- **Initial Height:** `1`

---

## Core Modules & Key Settings

### 1. **Affiliates**

- **Affiliate Tiers** (5 levels):
  1. Tier 0 – No stake, taker fee share `50000 ppm` (5%)
  2. Tier 1 – `200` stake, volume `1e12` quote quantums, taker fee share `100000 ppm` (10%)
  3. Tier 2 – `1000` stake, volume `5e12`, taker fee share `125000 ppm` (12.5%)
  4. Tier 3 – `5000` stake, volume `2.5e13`, taker fee share `150000 ppm` (15%)
  5. Tier 4 – `100000000` stake, volume `5e13`, taker fee share `250000 ppm` (25%)
- **Affiliate Parameters**
  - Max 30‑day attributable volume per referred user: `1e14` quote quantums
  - Referee minimum fee tier index: `2`
  - Max 30‑day affiliate revenue per referred user: `1e10` quote quantums

### 2. **Assets**

- Primary asset listed:
  - **ID:** `0`
  - **Symbol:** `USDC`
  - **Denom:** `ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5`
  - **Denom Exponent:** `-6`
  - **Has Market:** `false`

### 3. **Auth**

- **Params** – max memo characters `256`, tx sig limit `7`, tx size cost per byte `10`
- **Initial Accounts** – two base accounts with addresses `dydx1madmz...` and `dydx1e2tvx...`, both with zero balance initially.

### 4. **Bank**

- **Balances** – each of the two accounts receives `1e36` units of `stake` (the native staking token).
- **Send Enabled:** default `true`

### 5. **Bridge**

- **Event Params** – denom `bridge-token`, Ethereum chain ID `11155111`, ETH address `0xEf01c3A30eB57c91c40C52E996d29c202ae72193`
- **Propose Params** – max 10 bridges per block, propose delay `60s`, skip rate `800000 ppm`
- **Safety Params** – disabled `false`, delay blocks `86400`

### 6. **Clob (Central Limit Order Book)**

- No initial `clob_pairs`.
- **Liquidations Config** – max liquidation fee `5000 ppm`, position block limits, sub‑account limits, fillable price config (bankruptcy adjustment `1000000 ppm`, spread to maintenance margin ratio `100000 ppm`).
- **Block Rate Limit Config** – all limits empty (no restrictions yet).

### 7. **Consensus** – default parameters for block size, evidence, validator pub‑key types (`ed25519`)

### 8. **Crisis**

- Constant fee of `1000 stake`.

### 9. **Distribution**

- Community tax `0.02` (2%).
- No initial fee pool or delegator withdraw infos.

### 10. **Epochs**

- Three epochs defined:
  - `funding-sample` – 30‑second tick, duration `60s`
  - `funding-tick` – tick `0`, duration `3600s`
  - `stats-epoch` – tick `0`, duration `3600s`

### 11. **Fee Tiers**

- Nine fee tiers (maker fee `-110 ppm` (‑0.011%) for all tiers, taker fee decreasing from `500 ppm` (0.05%) to `250 ppm` (0.025%) as volume increases).
- Tier requirements range from `0` volume (tier 1) up to `5,000` volume share ppm for higher tiers.

### 12. **Governance (`gov`)**

- **Parameters**
  - Minimum deposit: `10000000 stake`
  - Voting period: `172800s` (48 h)
  - Quorum: `0.334` (33.4%)
  - Threshold: `0.5` (50%)
  - Veto threshold: `0.334`
  - Burn vote veto: `true`
- No proposals, deposits, or votes at genesis.

### 13. **IBC**

- Clients, connections, and channels empty – testnet starts without IBC links.

### 14. **Interchain Accounts**

- Controller and host enabled, but no active channels or accounts.

### 15. **Listing**

- Hard cap for markets `500`.
- Vault deposit params for new vaults `10,000,000,000` (10 B) and main vault `0`.

### 16. **MarketMap**

- Two markets defined:
  - **BTC/USD** – ticker with base `BTC`, quote `USD`, decimals `5`, enabled `true`. Provider configs include Binance, BinanceUS, Bitfinex, Bitstamp, Bybit, CoinbasePro, CryptoCom, Kraken, Okx.
  - **ETH/USD** – ticker with base `ETH`, quote `USD`, decimals `6`, enabled `true`. Same provider set.
- Market map last updated `0`.

### 17. **Prices**

- **Market Params** for the two markets above, each with an `exchange_config_json` string listing the same providers.
- **Initial Prices**
  - BTC (id `0`): price `2000000000` (represents $20,000 with exponent `-5`).
  - ETH (id `1`): price `1500000000` (represents $1,500 with exponent `-6`).

### 18. **Rate Limit**

- Limits for the USDC IBC denom: baseline minimum `1e12` per hour, `1e13` per day, with TVL‑based scaling.

### 19. **Revshare**

- Address `dydx17xpfv...` with zero revenue share.

### 20. **Rewards**

- Treasury account `rewards_treasury`, denom `atvx`, market ID `1`, fee multiplier `990000 ppm`.

### 21. **Slashing**

- Signed blocks window `3000`, minimum signed per window `0.05`, no slash fractions for double‑sign or downtime.

### 22. **Staking**

- Bond denom `stake`
- Max validators `100`, unbonding time `1814400s` (21 days)
- No validators listed at genesis (they will be added via `genutil`).

### 23. **Vault**

- Default quoting params (layers, spread mins, buffers, skew factor, order size, expiration, activation threshold).
- Operator account `dydx10d07y...` with metadata “Governance”.

### 24. **Vesting**

- Two vest entries for community and rewards, both using `atvx` token, start `2023‑01‑01`, end `2025‑01‑01`.

---

## How to Use This Summary

- The file defines the **initial state** of the dYdX testnet.
- Most modules are empty (e.g., `clob_pairs`, `ibc` channels) and will be populated by transactions after the chain starts.
- Key economic parameters (fees, affiliate tiers, governance thresholds) are already set and can be referenced when building UI or writing documentation.
- The **price module** seeds BTC and ETH prices, which the price‑feed daemon will later update.
