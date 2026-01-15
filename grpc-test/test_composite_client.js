#!/usr/bin/env node
/**
 * SHORT-TERM ORDERS using CompositeClient.placeShortTermOrder()
 * This method should handle validation correctly
 */
const { CompositeClient, LocalWallet, BECH32_PREFIX, Order_Side, Order_TimeInForce, Network } = require('@dydxprotocol/v4-client-js');

const ALICE_MNEMONIC = "merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small";

async function main() {
    console.log("SHORT-TERM ORDER TEST - CompositeClient Method\n");
    
    try {
        // Create wallet
        const wallet = await LocalWallet.fromMnemonic(ALICE_MNEMONIC, BECH32_PREFIX);
        console.log("Wallet:", wallet.address, "\n");

        // Use Network.local() helper
        const network = Network.local();
        console.log("Network config:", JSON.stringify(network, null, 2), "\n");
        
        console.log("Connecting...");
        const client = await CompositeClient.connect(network);
        console.log("✅ Connected!\n");

        const height = await client.validatorClient.get.latestBlockHeight();
        const gtb = height + 20;
        
        console.log("Height:", height, "GTB:",  "\n");

        // Use the high-level placeShortTermOrder method
        console.log("Placing order using CompositeClient.placeShortTermOrder()...");
        const clientId = Math.floor(Math.random() * 1000000);
        
        const result = await client.placeShortTermOrder(
            wallet,
            0, // subaccount
            'BTC-USD',
            Order_Side.SIDE_BUY,
            50000, // price
            0.01, // size
            clientId, 
            
            Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
            false // reduceOnly
        );
        
        console.log("\n✅ SUCCESS!");
        console.log("Result:", JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error("\n❌ Error:", error.message);
        console.error("\nFull error:");
        console.error(error);
    }
}

main().catch(console.error);
