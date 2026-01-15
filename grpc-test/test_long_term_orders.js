#!/usr/bin/env node
/**
 * Test LONG-TERM (Stateful) Orders via gRPC
 */
const { CompositeClient, LocalWallet, BECH32_PREFIX, Order_Side, Order_TimeInForce, Network } = require('@dydxprotocol/v4-client-js');

const ALICE_MNEMONIC = "merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small";
const BOB_MNEMONIC = "color black kingdom feed rough spread envelope coffee faith either wrist mom place trade tumble one coach owner usual old armed knee certain risk";

async function main() {
    console.log("🚀 Testing Long-Term (Stateful) Orders via gRPC\n");

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
        console.log("📊 Current block height:", height, "\\n");

        // Calculate Good Til Block Time (95 days from now for long-term orders)
        const currentTime = Math.floor(Date.now() / 1000);
        const goodTilBlockTime = currentTime + (95 * 24 * 60 * 60); // 95 days

        // Place Alice's BUY order
        console.log("📝 Placing Long-Term BUY order (Alice)...");
        try {
            const aliceClientId = Math.floor(Math.random() * 1000000000);
            const aliceBuyOrder = await client.placeLongTermOrder(
                aliceWallet,
                0, // subaccount
                'BTC-USD',
                Order_Side.SIDE_BUY,
                40000, // price $40,000
                0.01, // size 0.01 BTC
                aliceClientId,
                goodTilBlockTime,
                Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
                false // reduceOnly
            );

            console.log("✅ Alice BUY order placed!");
            console.log("   TxHash:", aliceBuyOrder.hash);
            console.log("   Height:", aliceBuyOrder.height, "\\n");
        } catch (error) {
            console.error("❌ Failed to place Alice BUY order:", error.message);
            console.error("   Full error:", error, "\\n");
        }

        // Place Bob's SELL order
        console.log("📝 Placing Long-Term SELL order (Bob)...");
        try {
            const bobClientId = Math.floor(Math.random() * 1000000000);
            const bobSellOrder = await client.placeLongTermOrder(
                bobWallet,
                0, // subaccount
                'BTC-USD',
                Order_Side.SIDE_SELL,
                40000, // price $40,000
                0.01, // size 0.01 BTC
                bobClientId,
                goodTilBlockTime,
                Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
                false // reduceOnly
            );

            console.log("✅ Bob SELL order placed!");
            console.log("   TxHash:", bobSellOrder.hash);
            console.log("   Height:", bobSellOrder.height, "\\n");
        } catch (error) {
            console.error("❌ Failed to place Bob SELL order:", error.message);
            console.error("   Full error:", error, "\\n");
        }

        console.log("✨ Long-term order test complete!\\n");

    } catch (error) {
        console.error("\\n❌ Error:", error.message);
        console.error("\\nFull error:");
        console.error(error);
        process.exit(1);
    }
}

main().catch(console.error);
