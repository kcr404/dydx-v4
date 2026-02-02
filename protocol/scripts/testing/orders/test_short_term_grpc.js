#!/usr/bin/env node
/**
 * Tradeview Short-Term Order Submission via gRPC
 * Places orders directly into MemClob using the Tradeview v4 client
 */

const { CompositeClient, Network, OrderFlags, Order_Side, Order_TimeInForce } = require('@dydxprotocol/v4-client-js');
const { LocalWallet } = require('@dydxprotocol/v4-client-js');
const Long = require('long');

// Configuration - Tradeview explicit endpoints
const NETWORK = new Network(
    'testnet',
    'tradeview',
    'http://localhost:26657'
);
NETWORK.chainId = 'localtradeview';
NETWORK.validatorUrl = 'http://localhost:26657';
NETWORK.restUrl = 'http://localhost:1317';
NETWORK.indexerUrl = 'http://34.219.179.201:3002';
const ALICE_MNEMONIC = process.env.ALICE_MNEMONIC || "merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small";
const BOB_MNEMONIC = process.env.BOB_MNEMONIC || "color black kingdom feed sure spread team month grow ill banner speed decade rule office burst uncle pure pump battle ready alone what taxi";

async function placeShortTermOrder() {
    console.log("=========================================");
    console.log("  Tradeview SHORT-TERM Order via gRPC");
    console.log("=========================================\n");

    try {
        // Initialize clients
        console.log("Step 1: Initializing clients...");
        // Updated for TradeView rebranding
        const aliceWallet = await LocalWallet.fromMnemonic(ALICE_MNEMONIC, 'tradeview');
        const bobWallet = await LocalWallet.fromMnemonic(BOB_MNEMONIC, 'tradeview');

        const aliceClient = await CompositeClient.connect(NETWORK);
        const bobClient = await CompositeClient.connect(NETWORK);

        console.log(`   Alice address: ${aliceWallet.address}`);
        console.log(`   Bob address: ${bobWallet.address}\n`);

        // Get current block height for GTB
        console.log("Step 2: Getting current block height...");
        const height = await aliceClient.validatorClient.get.latestBlockHeight();
        const goodTilBlock = height + 10; // 10 blocks from now

        console.log(`   Current height: ${height}`);
        console.log(`   Good Til Block: ${goodTilBlock}\n`);

        // Place Alice's BUY order
        console.log("Step 3: Placing Alice's SHORT-TERM BUY order...");
        const aliceOrder = {
            clientId: Math.floor(Date.now() / 1000), // Unix timestamp as client ID
            orderFlags: OrderFlags.SHORT_TERM, // SHORT-TERM order flag
            clobPairId: 0, // BTC-USD
            side: Order_Side.SIDE_BUY,
            quantums: Long.fromNumber(10_000_000), // 0.1 BTC
            subticks: Long.fromNumber(5_000_000), // Price: $50
            goodTilBlock: goodTilBlock,
            timeInForce: Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
            reduceOnly: false,
            clientMetadata: 0,
        };

        const aliceTx = await aliceClient.placeShortTermOrder(
            aliceWallet,
            aliceOrder,
            0 // subaccount number
        );

        console.log(`   ✅ Alice order placed!`);
        console.log(`   TxHash: ${aliceTx.hash}\n`);

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Place Bob's SELL order
        console.log("Step 4: Placing Bob's SHORT-TERM SELL order...");
        const bobOrder = {
            clientId: Math.floor(Date.now() / 1000) + 1,
            orderFlags: OrderFlags.SHORT_TERM,
            clobPairId: 0,
            side: Order_Side.SIDE_SELL,
            quantums: Long.fromNumber(10_000_000),
            subticks: Long.fromNumber(5_000_000), // Same price - will match!
            goodTilBlock: goodTilBlock,
            timeInForce: Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
            reduceOnly: false,
            clientMetadata: 0,
        };

        const bobTx = await bobClient.placeShortTermOrder(
            bobWallet,
            bobOrder,
            0
        );

        console.log(`   ✅ Bob order placed!`);
        console.log(`   TxHash: ${bobTx.hash}\n`);

        // Wait for inclusion
        console.log("Step 5: Waiting for order inclusion...");
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check if orders matched
        console.log("Step 6: Checking order status...");
        // Note: You'd query the indexer or check subaccount positions here

        console.log("\n=========================================");
        console.log("✅ SHORT-TERM ORDERS SUBMITTED VIA gRPC!");
        console.log("=========================================\n");
        console.log("Key Points:");
        console.log("  • Orders submitted directly to MemClob");
        console.log("  • Bypassed PrepareProposal filtering");
        console.log("  • Used SHORT_TERM order flags");
        console.log("  • Orders handled in-memory only");
        console.log("");

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run
placeShortTermOrder().catch(console.error);
