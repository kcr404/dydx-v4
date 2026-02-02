#!/usr/bin/env node
/**
 * Tradeview SHORT-TERM Order Test (PK) - Fixed
 */

const { CompositeClient, Network, OrderFlags, Order_Side, Order_TimeInForce } = require('@dydxprotocol/v4-client-js');
const { LocalWallet } = require('@dydxprotocol/v4-client-js');
const Long = require('long');

// Helper to convert hex to Uint8Array
const fromHexString = (hexString) =>
  new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const ALICE_PK = "c64c72505730acd43a69ca7b9ce17003538091e36dc1ddb7577a40c46f39215b";
const BOB_PK = "cc3af9e719c3d4dbf38563a1f1d8f166363805d1fe9bb6af7b160091a2c99cf8";

// Configuration - using plain object for robust connection
const NETWORK = {
    id: 'local-testnet',
    connectionConfig: {
        validatorConfig: {
            restEndpoint: 'http://localhost:1317',
            rpcEndpoint: 'http://localhost:26657',
            grpcEndpoint: 'localhost:9090',
            chainId: 'localtradeview',
        },
        indexerConfig: {
            restEndpoint: 'http://34.219.179.201:3002',
            websocketEndpoint: 'ws://34.219.179.201:3002/ws',
        },
    },
};

async function placeShortTermOrder() {
    console.log("=========================================");
    console.log("  Tradeview SHORT-TERM Order via gRPC (PK)");
    console.log("=========================================\n");

    try {
        console.log("Step 1: Initializing clients...");
        // Use Private Key (converted to proper format)
        const aliceWallet = await LocalWallet.fromPrivateKey(fromHexString(ALICE_PK), 'tradeview');
        const bobWallet = await LocalWallet.fromPrivateKey(fromHexString(BOB_PK), 'tradeview');

        console.log("   Connecting to:");
        console.log("   Validator RPC:", NETWORK.connectionConfig.validatorConfig.rpcEndpoint);
        console.log("   Validator gRPC:", NETWORK.connectionConfig.validatorConfig.grpcEndpoint);

        const aliceClient = await CompositeClient.connect(NETWORK);
        const bobClient = await CompositeClient.connect(NETWORK);

        console.log(`   ✅ Connected!`);
        console.log(`   Alice address: ${aliceWallet.address}`);
        console.log(`   Bob address: ${bobWallet.address}\n`);

        console.log("Step 2: Getting current block height...");
        // Use validator client directly to ensure RPC works
        const height = await aliceClient.validatorClient.get.latestBlockHeight();
        const goodTilBlock = height + 10;
        console.log(`   Current height: ${height}`);
        console.log(`   Good Til Block: ${goodTilBlock}\n`);

        // Place Alice's BUY order
        console.log("Step 3: Placing Alice's SHORT-TERM BUY order...");
        const aliceOrder = {
            clientId: Math.floor(Date.now() / 1000),
            orderFlags: OrderFlags.SHORT_TERM,
            clobPairId: 0,
            side: Order_Side.SIDE_BUY,
            quantums: Long.fromNumber(10_000_000),
            subticks: Long.fromNumber(5_000_000),
            goodTilBlock: goodTilBlock,
            timeInForce: Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
            reduceOnly: false,
            clientMetadata: 0,
        };

        const aliceTx = await aliceClient.placeShortTermOrder(
            aliceWallet,
            aliceOrder,
            0 
        );

        console.log(`   ✅ Alice order placed!`);
        console.log(`   TxHash: ${aliceTx.hash}\n`);

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Place Bob's SELL order
        console.log("Step 4: Placing Bob's SHORT-TERM SELL order...");
        const bobOrder = {
            clientId: Math.floor(Date.now() / 1000) + 1,
            orderFlags: OrderFlags.SHORT_TERM,
            clobPairId: 0,
            side: Order_Side.SIDE_SELL,
            quantums: Long.fromNumber(10_000_000),
            subticks: Long.fromNumber(5_000_000),
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
        
        console.log("=========================================");
        console.log("✅ SHORT-TERM ORDERS SUBMITTED!");
        console.log("=========================================\n");

    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.cause) console.error("Cause:", error.cause);
        process.exit(1);
    }
}

placeShortTermOrder().catch(err => {
    console.error("Unhandled error:", err);
    process.exit(1);
});
