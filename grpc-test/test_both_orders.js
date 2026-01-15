#!/usr/bin/env node
const { CompositeClient, LocalWallet, BECH32_PREFIX, Order_Side, Order_TimeInForce, Network } = require('@dydxprotocol/v4-client-js');

const ALICE_MNEMONIC = "merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small";
const BOB_MNEMONIC = "color black kingdom feed rough spread envelope coffee faith either wrist mom place trade tumble one coach owner usual old armed knee certain risk";

async function main() {
    console.log("🚀 Testing dYdX Orders via gRPC\n");
    console.log("=" .repeat(60) + "\n");
    
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
        console.log("📊 Current block height:", height, "\n");

        // ========== SHORT-TERM ORDERS ==========
        console.log("=" .repeat(60));
        console.log("TESTING SHORT-TERM ORDERS");
        console.log("=" .repeat(60) + "\n");

        const gtb = height + 10;
        console.log("📊 Good Til Block:", gtb, "\n");

        console.log("📝 Placing Short-Term BUY order (Alice)...");
        try {
            const aliceClientId = Math.floor(Math.random() * 1000000000);
            const aliceBuyOrder = await client.placeShortTermOrder(
                aliceWallet,
                0,
                'BTC-USD',
                Order_Side.SIDE_BUY,
                40000,
                0.01,
                aliceClientId,
                gtb,
                Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
                false
            );
            console.log("✅ Alice SHORT-TERM BUY order placed!");
            console.log("   Response:", JSON.stringify(aliceBuyOrder, null, 2), "\n");
        } catch (error) {
            console.error("❌ Failed:", error.message, "\n");
        }

        console.log("📝 Placing Short-Term SELL order (Bob)...");
        try {
            const bobClientId = Math.floor(Math.random() * 1000000000);
            const bobSellOrder = await client.placeShortTermOrder(
                bobWallet,
                0,
                'BTC-USD',
                Order_Side.SIDE_SELL,
                40000,
                0.01,
                bobClientId,
                gtb,
                Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
                false
            );
            console.log("✅ Bob SHORT-TERM SELL order placed!");
            console.log("   Response:", JSON.stringify(bobSellOrder, null, 2), "\n");
        } catch (error) {
            console.error("❌ Failed:", error.message, "\n");
        }

        // ========== LONG-TERM ORDERS ==========
        console.log("=" .repeat(60));
        console.log("TESTING LONG-TERM (STATEFUL) ORDERS");
        console.log("=" .repeat(60) + "\n");

        const currentTime = Math.floor(Date.now() / 1000);
        const goodTilBlockTime = currentTime + (95 * 24 * 60 * 60);
        console.log("📊 Good Til Block Time:", goodTilBlockTime, "\n");

        console.log("📝 Placing Long-Term BUY order (Alice)...");
        try {
            const aliceClientId = Math.floor(Math.random() * 1000000000);
            const aliceBuyOrder = await client.placeLongTermOrder(
                aliceWallet,
                0,
                'BTC-USD',
                Order_Side.SIDE_BUY,
                40000,
                0.01,
                aliceClientId,
                goodTilBlockTime,
                Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
                false
            );
            console.log("✅ Alice LONG-TERM BUY order placed!");
            console.log("   TxHash:", aliceBuyOrder.hash);
            console.log("   Height:", aliceBuyOrder.height, "\n");
        } catch (error) {
            console.error("❌ Failed:", error.message, "\n");
        }

        console.log("📝 Placing Long-Term SELL order (Bob)...");
        try {
            const bobClientId = Math.floor(Math.random() * 1000000000);
            const bobSellOrder = await client.placeLongTermOrder(
                bobWallet,
                0,
                'BTC-USD',
                Order_Side.SIDE_SELL,
                40000,
                0.01,
                bobClientId,
                goodTilBlockTime,
                Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
                false
            );
            console.log("✅ Bob LONG-TERM SELL order placed!");
            console.log("   TxHash:", bobSellOrder.hash);
            console.log("   Height:", bobSellOrder.height, "\n");
        } catch (error) {
            console.error("❌ Failed:", error.message, "\n");
        }

        console.log("=" .repeat(60));
        console.log("✨ All tests complete!");
        console.log("=" .repeat(60) + "\n");
        
    } catch (error) {
        console.error("\n❌ Error:", error.message);
        console.error(error);
        process.exit(1);
    }
}

main().catch(console.error);
