#!/usr/bin/env node
const { CompositeClient, LocalWallet, BECH32_PREFIX, Order_Side, Order_TimeInForce, Network } = require('@dydxprotocol/v4-client-js');

const ALICE_MNEMONIC = "merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small";
const BOB_MNEMONIC = "color black kingdom feed rough spread envelope coffee faith either wrist mom place trade tumble one coach owner usual old armed knee certain risk";

async function main() {
    console.log("🚀 Testing dYdX Orders via gRPC\n");
    console.log("=".repeat(60) + "\n");
    
    try {
        const aliceWallet = await LocalWallet.fromMnemonic(ALICE_MNEMONIC, BECH32_PREFIX);
        const bobWallet = await LocalWallet.fromMnemonic(BOB_MNEMONIC, BECH32_PREFIX);
        console.log("✅ Alice:", aliceWallet.address);
        console.log("✅ Bob:", bobWallet.address, "\n");

        const network = Network.local();
        console.log("Connecting...");
        const client = await CompositeClient.connect(network);
        console.log("✅ Connected!\n");

        const height = await client.validatorClient.get.latestBlockHeight();
        const gtb = height + 10;
        console.log("📊 Height:", height, "GTB:", gtb, "\n");

        // SHORT-TERM ORDERS
        console.log("=".repeat(60));
        console.log("TESTING SHORT-TERM ORDERS");
        console.log("=".repeat(60) + "\n");

        console.log("📝 Alice SHORT-TERM BUY...");
        try {
            const clientId = Math.floor(Math.random() * 1000000);
            const result = await client.placeShortTermOrder(
                aliceWallet, 0, 'BTC-USD', Order_Side.SIDE_BUY,
                40000, 0.01, clientId, gtb,
                Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED, false
            );
            console.log("✅ SUCCESS!", JSON.stringify(result, null, 2), "\n");
        } catch (error) {
            console.error("❌ Failed:", error.message, "\n");
        }

        console.log("📝 Bob SHORT-TERM SELL...");
        try {
            const clientId = Math.floor(Math.random() * 1000000);
            const result = await client.placeShortTermOrder(
                bobWallet, 0, 'BTC-USD', Order_Side.SIDE_SELL,
                40000, 0.01, clientId, gtb,
                Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED, false
            );
            console.log("✅ SUCCESS!", JSON.stringify(result, null, 2), "\n");
        } catch (error) {
            console.error("❌ Failed:", error.message, "\n");
        }

        // LONG-TERM ORDERS
        console.log("=".repeat(60));
        console.log("TESTING LONG-TERM ORDERS");
        console.log("=".repeat(60) + "\n");

        const currentTime = Math.floor(Date.now() / 1000);
        const goodTilBlockTime = currentTime + (95 * 24 * 60 * 60);

        console.log("📝 Alice LONG-TERM BUY...");
        try {
            const clientId = Math.floor(Math.random() * 1000000);
            const result = await client.placeLongTermOrder(
                aliceWallet, 0, 'BTC-USD', Order_Side.SIDE_BUY,
                40000, 0.01, clientId, goodTilBlockTime,
                Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED, false
            );
            console.log("✅ SUCCESS! TxHash:", result.hash, "Height:", result.height, "\n");
        } catch (error) {
            console.error("❌ Failed:", error.message, "\n");
        }

        console.log("📝 Bob LONG-TERM SELL...");
        try {
            const clientId = Math.floor(Math.random() * 1000000);
            const result = await client.placeLongTermOrder(
                bobWallet, 0, 'BTC-USD', Order_Side.SIDE_SELL,
                40000, 0.01, clientId, goodTilBlockTime,
                Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED, false
            );
            console.log("✅ SUCCESS! TxHash:", result.hash, "Height:", result.height, "\n");
        } catch (error) {
            console.error("❌ Failed:", error.message, "\n");
        }

        console.log("=".repeat(60));
        console.log("✨ All tests complete!");
        console.log("=".repeat(60));
        
    } catch (error) {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    }
}

main().catch(console.error);
