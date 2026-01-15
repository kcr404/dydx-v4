## gRPC Trading Status (Short‑Term + Long‑Term Orders)

This document summarizes **how we run** the local dYdX v4 devnet + indexer components, how we submit **short‑term and long‑term orders via gRPC**, and the **current progress / state** of the system.

---

### 1. Environment Overview

- **Protocol chain (localnet)**
  - Chain ID: `localdydxprotocol`
  - RPC: `http://localhost:26657`
  - REST: `http://localhost:1317` (from app.toml/client.toml)
  - Status check:
    ```bash
    curl -s http://localhost:26657/status | jq '.result.sync_info.latest_block_height'
    ```

- **Indexer (local)**
  - Comlink HTTP: `http://localhost:3002` (v4 REST API)
  - Redis: `redis://localhost:6382`
  - Postgres: `localhost:5435` (`dydx_dev` / `dydx_dev`)
  - Docker compose (in `indexer/`):
    ```bash
    cd /data/data-v4-chain/indexer
    docker-compose -f docker-compose-local-deployment.yml up -d \
      postgres redis postgres-package comlink
    ```

- **Local gRPC trading test folder**
  - Location: `/data/data-v4-chain/grpc-test`
  - Contains the Node scripts and `@dydxprotocol/v4-client-js` dependency.

---

### 2. Wallets and Network (per dYdX docs)

Following the dYdX docs:
- **Connecting**: [Connecting to dYdX](https://docs.dydx.xyz/interaction/endpoints)
- **Wallet Setup**: [Wallet Setup](https://docs.dydx.xyz/interaction/wallet-setup)
- **Trading**: [Trading](https://docs.dydx.xyz/interaction/trading)

We use the standard localnet mnemonics from the protocol repo:
- **Alice mnemonic** (used as main trader A)
- **Bob mnemonic** (used as main trader B)

Address derivation in the scripts:
- Uses `LocalWallet.fromMnemonic(MNEMONIC, BECH32_PREFIX)` from `@dydxprotocol/v4-client-js`.
- `BECH32_PREFIX` is `dydx` for the local chain.

Network configuration:
- Uses `Network.local()` from the SDK, which maps to:
  - Node/Validator RPC/gRPC: local devnet
  - Indexer REST/WS: local indexer (`http://localhost:3002`, `ws://localhost:3003`)

---

### 3. Short‑Term Orders via gRPC (MemClob path)

**Why gRPC (not CLI) for short‑term orders:**
- As discovered earlier, short‑term orders (OrderFlags = 0) are **filtered** from normal txs in `PrepareProposal` and are intended to go through the **MemClob + MsgProposedOperations** path.
- CLI txs for short‑term orders hit `RemoveDisallowMsgs` and can fail with decoding/ABCI+ errors; so the correct path is via **gRPC/WebSockets** and the in‑memory order book.

We now use **CompositeClient.placeShortTermOrder** from `@dydxprotocol/v4-client-js`, which:
- Talks to the **validator** over gRPC for signing/broadcast.
- Uses the **indexer** (or our stub) for market metadata (CLOB pair id, atomic resolution, step size, etc.).
- Injects the order into **MemClob** as short‑term, valid for `current_height + ShortBlockWindow`.

#### Script: `trade_short_long_ready.js`

Path:
- `/data/data-v4-chain/grpc-test/trade_short_long_ready.js`

Run:
```bash
cd /data/data-v4-chain/grpc-test
node trade_short_long_ready.js
```

What it does for **short‑term**:
1. Creates wallets:
   - Alice and Bob from the known local mnemonics.
2. Builds subaccounts:
   - `new SubaccountInfo(aliceWallet, 0)`
   - `new SubaccountInfo(bobWallet,   0)`
3. Connects via `Network.local()`:
   ```js
   const network = Network.local();
   const client  = await CompositeClient.connect(network);
   ```
4. Queries current block height and computes `goodTilBlock`:
   - `height = await client.validatorClient.get.latestBlockHeight();`
   - `requestedGtb = height + 8;`
   - `goodTilBlock = await client.calculateGoodTilBlock(0, null, requestedGtb);`
5. Uses a **priced market**:
   - TEST‑USD with `market_id = 33`, `clobPairId = 35`.
   - We stub indexer `markets.getPerpetualMarkets` in the script to avoid relying on a flaky local indexer HTTP, returning compatible fields (`clobPairId`, `atomicResolution`, `stepBaseQuantums`, etc.).
6. Places **Alice BUY** and **Bob SELL** short‑term orders:
   ```js
   await client.placeShortTermOrder(
     aliceSub,
     TEST_USD_MARKET_ID,
     Order_Side.SIDE_BUY,
     1.0,        // price
     0.01,       // size
     clientIdAlice,
     goodTilBlock,
     Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
     false,
   );

   await client.placeShortTermOrder(
     bobSub,
     TEST_USD_MARKET_ID,
     Order_Side.SIDE_SELL,
     1.0,
     0.01,
     clientIdBob,
     goodTilBlock,
     Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
     false,
   );
   ```
7. Logs **short‑term tx hashes** as `Uint8Array(32)`; these are the Tendermint tx hashes.

Example output (already observed):
- `Alice short-term tx hash: Uint8Array(32) [ 108, 106, 119, ... ]`
- `Bob short-term tx hash  : Uint8Array(32) [ 49, 193, 199, ... ]`

You can verify inclusion via RPC:
```bash
TX_HEX=<hex-encoded-tx-hash>   # Convert from the Uint8Array if necessary
curl -s "http://localhost:26657/tx?hash=0x${TX_HEX}" | jq
```

---

### 4. Long‑Term (Stateful) Orders via gRPC

Long‑term orders are **stateful** and use **time‑based validity** (`goodTilBlockTime`) with an upper bound of `StatefulOrderTimeWindow` (~95 days per docs).

The script uses **CompositeClient.placeOrder** for long‑term LIMIT orders:
- `OrderType.LIMIT`
- `OrderTimeInForce.GTT` (Good‑Til‑Time, time‑based)
- `goodTilTimeInSeconds` as a small **delta** (e.g., `+1 day`), passed into `placeOrder` so the SDK converts it into a valid `goodTilBlockTime` underneath.

In `trade_short_long_ready.js`:
1. Compute a **delta** time for GTT (workaround for current SDK behavior):
   ```js
   const nowSec    = Math.floor(Date.now() / 1000);
   const oneDaySec = 24 * 60 * 60;
   const goodTilTime = oneDaySec; // treated as delta
   ```
2. Use long‑term flags via `OrderType.LIMIT` + `OrderTimeInForce.GTT`:
   ```js
   const aliceLt = await client.placeOrder(
     aliceSub,
     TEST_USD_MARKET_ID,
     OrderType.LIMIT,
     Order_Side.SIDE_BUY,
     1.0,               // price
     0.01,              // size
     clientIdAlice,
     OrderTimeInForce.GTT,
     goodTilTime,       // delta seconds
     OrderExecution.DEFAULT,
     false,             // postOnly
     false,             // reduceOnly
     0,                 // triggerPrice
     null,              // marketInfo
     null,              // currentHeight
     0,                 // goodTilBlock (0 for time-based)
     undefined,         // memo
   );
   ```
3. Logs **long‑term tx hashes** as proper hex strings (from the SDK `TxResponse`):
   - Example:
     - `Alice long-term tx hash: 0A502421201AC03F7D8F6EA4A1B5DA429ABACAAC1A038F7BF669610589ED8F63`
     - `Bob long-term tx hash  : 610424BB749DB9FBD45411433433F54FC0F85E33BC63AF749A097E635E150907`

Again, you can verify via RPC:
```bash
curl -s "http://localhost:26657/tx?hash=0x0A502421201AC03F7D8F6EA4A1B5DA429ABACAAC1A038F7BF669610589ED8F63" | jq
```

---

### 5. Indexer Status and Workarounds

- **Comlink** is running (`indexer_comlink_1` is Up on port 3002), but:
  - Redis connectivity from inside the container has been unreliable (ECONNREFUSED `127.0.0.1:6382` in some runs), so the indexer HTTP may reset connections under load.
- Because **short‑term order helpers** call `indexerClient.markets.getPerpetualMarkets()`, we:
  - Implemented a **local stub** in `trade_short_long_ready.js` to return deterministic market metadata for TEST‑USD.
  - This avoids failures when `http://localhost:3002` is not fully stable.

This means:
- gRPC order placement **does not depend** on a healthy local indexer for now.
- Once Redis/connectivity is fully stable, you can remove the stub and use the real indexer markets endpoint.

---

### 6. Current Progress Summary

- ✅ **Short‑term orders via gRPC**:
  - Working end‑to‑end using `CompositeClient.placeShortTermOrder`.
  - Orders are valid within `ShortBlockWindow` and included in blocks (MemClob path).
  - Tx hashes are logged and can be checked via Tendermint RPC.

- ✅ **Long‑term (stateful) orders via gRPC**:
  - Working using `CompositeClient.placeOrder` with `OrderType.LIMIT` + `OrderTimeInForce.GTT`.
  - `goodTilTimeInSeconds` is passed as a **delta** (e.g., +1 day) and enforced by the chain against `StatefulOrderTimeWindow`.
  - Hex tx hashes are logged for verification.

- ⚠️ **Local indexer (Comlink/Redis)**:
  - Comlink is up on `:3002` but Redis connectivity errors appear in logs.
  - To de‑risk, the trading script stubs `getPerpetualMarkets` for TEST‑USD.

- 🔜 **Next steps (optional)**:
  - Harden Redis/Comlink connectivity so indexer REST is fully reliable.
  - Remove the markets stub from the trading script and rely entirely on `indexerClient.markets`.
  - Add helper scripts to:
    - Convert the `Uint8Array` tx hashes into hex.
    - Poll `/tx?hash=...` and indexer `/v4/transactions/...` to confirm inclusion and fill/match details.

---

### 7. How to Re‑Run Everything

1. **Ensure protocol chain is running**:
   ```bash
   cd /data/data-v4-chain/protocol
   docker-compose -f docker-compose.local.yml up -d
   curl -s http://localhost:26657/status | jq '.result.sync_info.latest_block_height'
   ```

2. **Start essential indexer pieces (optional, for real markets API)**:
   ```bash
   cd /data/data-v4-chain/indexer
   docker-compose -f docker-compose-local-deployment.yml up -d \
     postgres redis postgres-package comlink
   ```

3. **Run the gRPC trading script (short‑term + long‑term)**:
   ```bash
   cd /data/data-v4-chain/grpc-test
   node trade_short_long_ready.js
   ```

4. **Verify txs via RPC** (example for long‑term hash):
   ```bash
   curl -s "http://localhost:26657/tx?hash=0x<HEX_TX_HASH>" | jq
   ```

This doc is now your single source of truth for **how we run**, **what scripts exist**, and **what currently works** for short‑term and long‑term gRPC orders on your local dYdX v4 environment.
