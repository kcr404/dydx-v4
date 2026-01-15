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
  Order_Side,
  Order_TimeInForce,
} = require('@dydxprotocol/v4-client-js');

const Long = require('long');

const ALICE_MNEMONIC = 'merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small';
const BOB_MNEMONIC   = 'color habit donor nurse dinosaur stable wonder process post perfect raven gold census inside worth inquiry mammal panic olive toss shadow strong name drum';

async function placeShortTermPair(client, aliceWallet, bobWallet) {
  console.log('\n=== SHORT-TERM ORDERS (gRPC) ===');

  const height = await client.validatorClient.get.latestBlockHeight();
  const goodTilBlock = await client.calculateGoodTilBlock(height + 8); // SDK clamps into [h+1, h+ShortBlockWindow]

  console.log('Height:', height, 'Requested GTB:', height + 8, 'Validated GTB:', goodTilBlock);

  const ticker = 'TEST-USD';
  const price  = 1.0;
  const size   = 0.01;

  const clientIdAlice = Math.floor(Math.random() * 1_000_000);
  const clientIdBob   = clientIdAlice + 1;

  console.log(`Placing Alice SHORT-TERM BUY ${size} ${ticker} @ ${price} (clientId=${clientIdAlice})...`);
  const aliceTx = await client.placeShortTermOrder(
    aliceWallet,
    0,                    // subaccount 0
    ticker,
    Order_Side.SIDE_BUY,
    price,
    size,
    clientIdAlice,
    goodTilBlock,
    Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
    false,               // reduceOnly
  );
  console.log('  Alice tx hash:', aliceTx.hash || aliceTx.txhash || JSON.stringify(aliceTx).slice(0, 120));

  await new Promise(r => setTimeout(r, 3000));

  console.log(`Placing Bob SHORT-TERM SELL ${size} ${ticker} @ ${price} (clientId=${clientIdBob})...`);
  const bobTx = await client.placeShortTermOrder(
    bobWallet,
    0,
    ticker,
    Order_Side.SIDE_SELL,
    price,
    size,
    clientIdBob,
    goodTilBlock,
    Order_TimeInForce.TIME_IN_FORCE_TIME_IN_FORCE_UNSPECIFIED || Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
    false,
  );
  console.log('  Bob tx hash  :', bobTx.hash || bobTx.txhash || JSON.stringify(bobTx).slice(0, 120));
}

async function placeLongTermPair(client, aliceWallet, bobWallet) {
  console.log('\n=== LONG-TERM ORDERS (gRPC) ===');

  // Per docs: long-term orders use goodTilBlockTime (up to ~95 days)
  const nowSec = Math.floor(Date.now() / 1000);
  const oneDaySec = 24 * 60 * 60;
  const goodTilBlockTime = await client.calculateGoodTilBlockTime(nowSec + oneDaySec);

  console.log('Now:', nowSec, 'GoodTilBlockTime (1d):', goodTilBlockTime);

  const ticker = 'TEST-USD';
  const price  = 1.0;
  const size   = 0.01;

  const clientIdAlice = Math.floor(Math.random() * 1_000_000);
  const clientIdBob   = clientIdAlice + 1;

  // For long-term we use the generic placeOrder helper (stateful path)
  console.log(`Placing Alice LONG-TERM BUY ${size} ${ticker} @ ${price} (clientId=${clientIdAlice})...`);
  const aliceLt = await client.placeOrder(
    aliceWallet,
    0,
    ticker,
    Order_Side.SIDE_BUY,
    price,
    size,
    clientIdAlice,
    0,                     // goodTilBlock = 0 for time-based
    goodTilBlockTime,
    Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
    false,                 // reduceOnly
  );
  console.log('  Alice long-term tx hash:', aliceLt.hash || aliceLt.txhash || JSON.stringify(aliceLt).slice(0, 120));

  await new Promise(r => setTimeout(r, 3000));

  console.log(`Placing Bob LONG-TERM SELL ${size} ${ticker} @ ${price} (clientId=${clientIdBob})...`);
  const bobLt = await client.placeOrder(
    bobWallet,
    0,
    ticker,
    Order_Side.SIDE_SELL,
    price,
    size,
    clientIdBob,
    0,
    goodTilBlockTime,
    Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
    false,
  );
  console.log('  Bob long-term tx hash  :', bobLt.hash || bobLt.txhash || JSON.stringify(bobLt).slice(0, 120));
}

async function main() {
  console.log('=========================================');
  console.log('  dYdX gRPC Trading (Short + Long term)');
  console.log('=========================================\n');

  try {
    const aliceWallet = await LocalWallet.fromMnemonic(ALICE_MNEMONIC, BECH32_PREFIX);
    const bobWallet   = await LocalWallet.fromMnemonic(BOB_MNEMONIC,   BECH32_PREFIX);

    console.log('Wallets:');
    console.log('  Alice:', aliceWallet.address);
    console.log('  Bob  :', bobWallet.address, '\n');

    const network = Network.local();
    console.log('Connecting via Network.local()...');
    const client = await CompositeClient.connect(network);
    console.log('✅ CompositeClient connected.');

    await placeShortTermPair(client, aliceWallet, bobWallet);
    await placeLongTermPair(client, aliceWallet, bobWallet);

    console.log('\nDone. You can now verify txs via RPC or indexer.');
  } catch (err) {
    console.error('\n❌ Error in trade_short_long.js:', err.message || err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main().catch(console.error);
