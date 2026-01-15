#!/usr/bin/env node
// dYdX v4 short-term and long-term orders over gRPC
// Based on docs:
// - Connecting: https://docs.dydx.xyz/interaction/endpoints
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

// Local devnet mnemonics (from previous sessions)
const ALICE_MNEMONIC = 'merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small';
const BOB_MNEMONIC   = 'color habit donor nurse dinosaur stable wonder process post perfect raven gold census inside worth inquiry mammal panic olive toss shadow strong name drum';

async function placeShortTermOrders(client, aliceWallet, bobWallet) {
  console.log('\n=== SHORT-TERM ORDERS (via gRPC / MemClob) ===');

  // 1) Get current block height from validator
  const height = await client.validatorClient.get.latestBlockHeight();
  const goodTilBlock = height + 8; // within ShortBlockWindow = 20 blocks
  console.log('Current height:', height, 'GoodTilBlock:', goodTilBlock);

  // 2) Choose a priced market. On localnet, TEST-USD (clob_pair_id 35) is safe.
  const ticker = 'TEST-USD';

  const size  = 0.01;   // 0.01 TEST
  const price = 1.0;    // 1 TEST-USD

  const clientIdAlice = Math.floor(Math.random() * 1_000_000);
  const clientIdBob   = clientIdAlice + 1;

  // 3) Alice BUY short-term
  console.log(`Placing Alice SHORT-TERM BUY ${size} ${ticker} @ ${price}...`);
  const aliceTx = await client.placeShortTermOrder(
    aliceWallet,
    0,               // subaccount 0
    ticker,
    Order_Side.SIDE_BUY,
    price,
    size,
    clientIdAlice,
    goodTilBlock,
    Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
    false,           // reduceOnly
  );
  console.log('Alice short-term tx:', aliceTx.hash || JSON.stringify(aliceTx).slice(0, 120));

  // small delay so blocks can progress
  await new Promise(r => setTimeout(r, 3000));

  // 4) Bob SELL short-term (same params, opposite side)
  console.log(`Placing Bob SHORT-TERM SELL ${size} ${ticker} @ ${price}...`);
  const bobTx = await client.placeShortTermOrder(
    bobWallet,
    0,
    ticker,
    Order_Side.SIDE_SELL,
    price,
    size,
    clientIdBob,
    goodTilBlock,
    Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
    false,
  );
  console.log('Bob short-term tx:', bobTx.hash || JSON.stringify(bobTx).slice(0, 120));
}

async function main() {
  console.log('=========================================');
  console.log('  dYdX gRPC Trading (Short + Long term)');
  console.log('=========================================\n');

  try {
    // 1) Wallets from mnemonics (Wallet Setup docs)
    const aliceWallet = await LocalWallet.fromMnemonic(ALICE_MNEMONIC, BECH32_PREFIX);
    const bobWallet   = await LocalWallet.fromMnemonic(BOB_MNEMONIC,   BECH32_PREFIX);

    console.log('Wallets:');
    console.log('  Alice:', aliceWallet.address);
    console.log('  Bob  :', bobWallet.address, '\n');

    // 2) Network.local() uses local devnet endpoints (endpoints docs)
    const network = Network.local();
    console.log('Connecting via Network.local()...');
    const client = await CompositeClient.connect(network);
    console.log('✅ CompositeClient connected.');

    // 3) SHORT-TERM ORDERS over gRPC
    await placeShortTermOrders(client, aliceWallet, bobWallet);

    // TODO: 4) LONG-TERM ORDERS (stateful) over gRPC
    // We can add a second helper that uses client.placeOrder / placeLongTermOrder
    // with goodTilBlockTime (blockTime + 95 days) as per docs.

    console.log('\nAll done.');
  } catch (err) {
    console.error('\n❌ Error in trading script:', err.message || err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main().catch(console.error);
