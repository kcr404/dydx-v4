/**
 * Tradeview SHORT-TERM Order Test (PK) - FINAL CHECK v2
 */

const { CompositeClient, Network, OrderFlags, Order_Side, Order_TimeInForce } = require('@dydxprotocol/v4-client-js');
const { LocalWallet } = require('@dydxprotocol/v4-client-js');
const Long = require('long');

const ALICE_PK = "c64c72505730acd43a69ca7b9ce17003538091e36dc1ddb7577a40c46f39215b";
const BOB_PK = "cc3af9e719c3d4dbf38563a1f1d8f166363805d1fe9bb6af7b160091a2c99cf8";

// Create Network config by modifying base
const NETWORK = new Network(
    'local-testnet',
    'indexer', // connection type? usually 'testnet' or 'mainnet' or similar
    'http://localhost:26657' // validator URL
);

// Manually override connection config to be sure
NETWORK.indexerConfig = {
    restEndpoint: 'http://34.219.179.201:3002',
    websocketEndpoint: 'ws://34.219.179.201:3002/ws',
};
NETWORK.validatorConfig = {
    restEndpoint: 'http://localhost:1317',
    rpcEndpoint: 'http://localhost:26657',
    grpcEndpoint: 'localhost:9090',
    chainId: 'localtradeview',
};

async function placeShortTermOrder() {
    console.log("=========================================");
    console.log("  Tradeview SHORT-TERM Order via gRPC (PK) - FINAL v2");
    console.log("=========================================\n");

    try {
        console.log("Step 1: Initializing clients...");
        // Pass HEX STRING directly (no Uint8Array conversion needed for this library version apparently)
        const aliceWallet = await LocalWallet.fromPrivateKey(ALICE_PK, 'tradeview');
        const bobWallet = await LocalWallet.fromPrivateKey(BOB_PK, 'tradeview');

        console.log("   Connecting to:");
        console.log("   Validator RPC:", NETWORK.validatorConfig.rpcEndpoint);
        console.log("   Validator gRPC:", NETWORK.validatorConfig.grpcEndpoint);

        const aliceClient = await CompositeClient.connect(NETWORK);
        const bobClient = await CompositeClient.connect(NETWORK);

        console.log("   Alice address:", aliceWallet.address);

        console.log("Step 2: Getting current block height...");
        const height = await aliceClient.validatorClient.get.latestBlockHeight();
        const goodTilBlock = height + 10;
        console.log("   Current height:", height);

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

        console.log("   TxHash:", aliceTx.hash);

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

        console.log("   TxHash:", bobTx.hash);

        console.log("=========================================");
        console.log("=========================================\n");

    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.cause) console.error("Cause:", error.cause);
        console.error(error.stack);
        process.exit(1);
    }
}

placeShortTermOrder().catch(console.error);
