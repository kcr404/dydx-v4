#!/usr/bin/env node
/**
 * Test SHORT-TERM Orders via gRPC
 * Fixed parameter order: clientId comes BEFORE goodTilBlock
 */
const { CompositeClient, LocalWallet, BECH32_PREFIX, Order_Side, Order_TimeInForce, Network } = require('@dydxprotocol/v4-client-js');

const ALICE_MNEMONIC = "merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small";
const BOB_MNEMONIC = "color black kingdom feed rough spread envelope coffee faith either wrist mom place trade tumble one coach owner usual old armed knee certain risk";

async function main() {
    console.log("🚀 Testing Short-Term Orders via gRPC\n");

    try {
        // Create wallets
        const aliceWallet = await LocalWallet.fromMnemonic(ALICE_MNEMONIC, BECH32_PREFIX);
        const bobWallet = await LocalWallet.fromMnemonic(BOB_MNEMONIC, BECH32_PREFIX);
        console.log("✅ Alice:", aliceWallet.address);
        console.log("✅ Bob:", bobWallet.address, "\n");

        // Connect to local network
        const network = Network.local();
        console.log("Connecting to local chain...");
        const client = await CompositeClient.connect(network);
        console.log("✅ Connected!\n");

        const height = await client.validatorClient.get.latestBlockHeight();
        const gtb = height + 10; // Good til block (max 20 for short-term)
        console.log("📊 Current block height:", height);
        console.log("📊 Good Til Block:", gtb, "\n");

        // Place Alice's BUY order
        console.log("📝 Placing Short-Term BUY order (Alice)...");
        try {
            const aliceClientId = Math.floor(Math.random() * 1000000000);
            // Correct parameter order: wallet, subaccount, market, side, price, size, clientId, gtb, tif, reduceOnly
            const aliceBuyOrder = await client.placeShortTermOrder(
                aliceWallet,
                0, // subaccount
                'BTC-USD',
                Order_Side.SIDE_BUY,
                40000, // price $40,000
                0.01, // size 0.01 BTC
                aliceClientId, // clientId BEFORE gtb
                gtb, // goodTilBlock AFTER clientId
                Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
                false // reduceOnly
            );

            console.log("✅ Alice BUY order placed!");
            console.log("   Response:", JSON.stringify(aliceBuyOrder, null, 2), "\n");
        } catch (error) {
            console.error("❌ Failed to place Alice BUY order:", error.message);
        }

        // Place Bob's SELL order
        console.log("📝 Placing Short-Term SELL order (Bob)...");
        try {
            const bobClientId = Math.floor(Math.random() * 1000000000);
            const bobSellOrder = await client.placeShortTermOrder(
                bobWallet,
                0, // subaccount
                'BTC-USD',
                Order_Side.SIDE_SELL,
                40000, // price $40,000
                0.01, // size 0.01 BTC
                bobClientId,
                gtb,
                Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
                false // reduceOnly
            );

            console.log("✅ Bob SELL order placed!");
            console.log("   Response:", JSON.stringify(bobSellOrder, null, 2), "\n");
        } catch (error) {
            console.error("❌ Failed to place Bob SELL order:", error.message);
        }

        console.log("✨ Short-term order test complete!\n");

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    }
}

main().catch(console.error);
