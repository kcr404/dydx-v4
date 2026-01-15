#!/usr/bin/env node
// Short-term + long-term orders over gRPC on local dYdX devnet
// Docs:
// - Endpoints: https://docs.dydx.xyz/interaction/endpoints
// - Wallet setup: https://docs.dydx.xyz/interaction/wallet-setup
// - Trading: https://docs.dydx.xyz/interaction/trading

const {
  CompositeClient,
  LocalWallet,
  BECH32_PREFIX,
  Network,
  SubaccountInfo,
  Order_Side,
  Order_TimeInForce,
  OrderType,
  OrderExecution,
  OrderTimeInForce,
} = require('@dydxprotocol/v4-client-js');

const Long = require('long');

// Local devnet mnemonics
const ALICE_MNEMONIC = 'merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small';
const BOB_MNEMONIC   = 'color habit donor nurse dinosaur stable wonder process post perfect raven gold census inside worth inquiry mammal panic olive toss shadow strong name drum';

// On the local dYdX devnet: TEST-USD has market_id = 33, CLOB pair id = 35
const TEST_USD_MARKET_ID = 33;

async function placeShortTermPair(client, aliceSub, bobSub) {
  console.log('\n=== SHORT-TERM ORDERS (gRPC) ===');

  // 1) Get current height, then choose GTB within ShortBlockWindow (20 blocks per docs)
  const height = await client.validatorClient.get.latestBlockHeight();
  const requestedGtb = height + 8;
  const goodTilBlock = await client.calculateGoodTilBlock(0, null, requestedGtb); // orderFlags=0 (SHORT_TERM)

  console.log('Height:', height, 'Requested GTB:', requestedGtb, 'Validated GTB:', goodTilBlock);

  const price  = 1.0;
  const size   = 0.01;
  const clientIdAlice = Math.floor(Math.random() * 1_000_000);
  const clientIdBob   = clientIdAlice + 1;

  console.log(`Placing Alice SHORT-TERM BUY ${size} TEST-USD @ ${price} (clientId=${clientIdAlice})...`);
  const aliceTx = await client.placeShortTermOrder(
    aliceSub,
    TEST_USD_MARKET_ID,
    Order_Side.SIDE_BUY,
    price,
    size,
    clientIdAlice,
    goodTilBlock,
    Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
    false,                // reduceOnly
  );
  const aliceStHashBytes = aliceTx.hash || aliceTx.txhash;
  const aliceStHashHex =
    aliceStHashBytes instanceof Uint8Array
      ? Buffer.from(aliceStHashBytes).toString('hex').toUpperCase()
      : String(aliceStHashBytes);
  console.log('  Alice short-term tx hash (hex):', aliceStHashHex);

  await new Promise(r => setTimeout(r, 3000));

  console.log(`Placing Bob SHORT-TERM SELL ${size} TEST-USD @ ${price} (clientId=${clientIdBob})...`);
  const bobTx = await client.placeShortTermOrder(
    bobSub,
    TEST_USD_MARKET_ID,
    Order_Side.SIDE_SELL,
    price,
    size,
    clientIdBob,
    goodTilBlock,
    Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
    false,
  );
  const bobStHashBytes = bobTx.hash || bobTx.txhash;
  const bobStHashHex =
    bobStHashBytes instanceof Uint8Array
      ? Buffer.from(bobStHashBytes).toString('hex').toUpperCase()
      : String(bobStHashBytes);
  console.log('  Bob short-term tx hash  (hex):', bobStHashHex);
}

async function placeLongTermPair(client, aliceSub, bobSub) {
  console.log('\n=== LONG-TERM ORDERS (gRPC) ===');

  // Per trading docs, long-term orders use goodTilBlockTime (up to ~95 days)
  const nowSec    = Math.floor(Date.now() / 1000);
  const oneDaySec = 24 * 60 * 60;
  // Workaround: pass a small delta (e.g., +1 day) instead of absolute epoch time
  // to stay within StatefulOrderTimeWindow given current SDK behavior.
  const goodTilTime = oneDaySec;

  console.log('Now:', nowSec, 'GoodTilTime delta (sec, +1d):', goodTilTime);

  const price  = 1.0;
  const size   = 0.01;
  const clientIdAlice = Math.floor(Math.random() * 1_000_000);
  const clientIdBob   = clientIdAlice + 1;

  // LIMIT long-term, DEFAULT execution
  console.log(`Placing Alice LONG-TERM BUY ${size} TEST-USD @ ${price} (clientId=${clientIdAlice})...`);
  const aliceLt = await client.placeOrder(
    aliceSub,
    TEST_USD_MARKET_ID,
    OrderType.LIMIT,
    Order_Side.SIDE_BUY,
    price,
    size,
    clientIdAlice,
    OrderTimeInForce.GTT,
    goodTilTime,
    OrderExecution.DEFAULT,
    false,              // postOnly
    false,              // reduceOnly
    0,                  // triggerPrice (not used)
    null,               // marketInfo (let SDK fetch from indexer)
    null,               // currentHeight (let SDK fetch)
    0,                  // goodTilBlock (0 because we use time-based)
    undefined,          // memo
  );
  console.log('  Alice long-term tx hash:', aliceLt.hash || aliceLt.txhash || JSON.stringify(aliceLt).slice(0, 160));

  await new Promise(r => setTimeout(r, 3000));

  console.log(`Placing Bob LONG-TERM SELL ${size} TEST-USD @ ${price} (clientId=${clientIdBob})...`);
  const bobLt = await client.placeOrder(
    bobSub,
    TEST_USD_MARKET_ID,
    OrderType.LIMIT,
    Order_Side.SIDE_SELL,
    price,
    size,
    clientIdBob,
    OrderTimeInForce.GTT,
    goodTilTime,
    OrderExecution.DEFAULT,
    false,
    false,
    0,
    null,
    null,
    0,
    undefined,
  );
  console.log('  Bob long-term tx hash  :', bobLt.hash || bobLt.txhash || JSON.stringify(bobLt).slice(0, 160));
}

async function main() {
  console.log('=========================================');
  console.log('  dYdX gRPC Trading (Short + Long term)');
  console.log('=========================================\n');

  try {
    const aliceWallet = await LocalWallet.fromMnemonic(ALICE_MNEMONIC, BECH32_PREFIX);
    const bobWallet   = await LocalWallet.fromMnemonic(BOB_MNEMONIC,   BECH32_PREFIX);

    const aliceSub = new SubaccountInfo(aliceWallet, 0);
    const bobSub   = new SubaccountInfo(bobWallet,   0);

    console.log('Wallets / Subaccounts:');
    console.log('  Alice addr:', aliceWallet.address, 'sub=0');
    console.log('  Bob   addr:', bobWallet.address,   'sub=0');

    const network = Network.local();
    console.log('\nConnecting via Network.local()...');
    const client = await CompositeClient.connect(network);
    console.log('✅ CompositeClient connected.');

    // Monkey-patch indexer markets call to avoid hitting local indexer HTTP (port 3002),
    // which is currently unstable. We stub the minimal market data needed by the helpers.
    // Override the existing markets client method instead of replacing the object.
    const markets = client.indexerClient.markets;
    if (markets && typeof markets.getPerpetualMarkets === 'function') {
      markets.getPerpetualMarkets = async (arg) => {
        const marketId = typeof arg === 'number'
          ? arg
          : (arg && (arg.market || arg.ticker)) || TEST_USD_MARKET_ID;
        return {
          markets: {
            [marketId]: {
              clobPairId: 35,            // TEST-USD CLOB pair id
              atomicResolution: 8,       // 1e-8 size granularity
              stepBaseQuantums: '1000000', // matches on-chain StepBaseQuantums seen in error
              quantumConversionExponent: 0,
              subticksPerTick: '1',
            },
          },
        };
      };
    }

    await placeShortTermPair(client, aliceSub, bobSub);
    await placeLongTermPair(client, aliceSub, bobSub);

    console.log('\nDone. Use RPC or indexer to verify these tx hashes.');
  } catch (err) {
    console.error('\n❌ Error in trade_short_long_ready.js:', err.message || err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main().catch(console.error);
