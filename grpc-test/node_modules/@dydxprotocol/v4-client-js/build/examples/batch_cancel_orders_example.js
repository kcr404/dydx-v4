"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const src_1 = require("../src");
const composite_client_1 = require("../src/clients/composite-client");
const constants_1 = require("../src/clients/constants");
const local_wallet_1 = __importDefault(require("../src/clients/modules/local-wallet"));
const subaccount_1 = require("../src/clients/subaccount");
const utils_1 = require("../src/lib/utils");
const constants_2 = require("./constants");
const generateShortTermOrdersInfo = () => [
    {
        marketId: 'ETH-USD',
        clientId: (0, utils_1.randomInt)(constants_2.MAX_CLIENT_ID),
        side: constants_1.OrderSide.SELL,
        price: 4000,
        size: 0.01,
    },
    {
        marketId: 'ETH-USD',
        clientId: (0, utils_1.randomInt)(constants_2.MAX_CLIENT_ID),
        side: constants_1.OrderSide.SELL,
        price: 4200,
        size: 0.02,
    },
    {
        marketId: 'BTC-USD',
        clientId: (0, utils_1.randomInt)(constants_2.MAX_CLIENT_ID),
        side: constants_1.OrderSide.BUY,
        price: 40000,
        size: 0.01,
    },
];
const generateBatchCancelShortTermOrders = (ordersInfo) => {
    const ordersGroupedByMarketIds = lodash_1.default.groupBy(ordersInfo, (info) => info.marketId);
    return Object.keys(ordersGroupedByMarketIds).map((marketId) => ({
        marketId,
        clientIds: ordersGroupedByMarketIds[marketId].map((info) => info.clientId),
    }));
};
async function test() {
    try {
        const wallet = await local_wallet_1.default.fromMnemonic(constants_2.DYDX_TEST_MNEMONIC, src_1.BECH32_PREFIX);
        console.log('**Wallet**', wallet);
        const network = constants_1.Network.testnet();
        const client = await composite_client_1.CompositeClient.connect(network);
        console.log('**Client**', client);
        const subaccount = new subaccount_1.SubaccountInfo(wallet, 0);
        const currentBlock = await client.validatorClient.get.latestBlockHeight();
        const goodTilBlock = currentBlock + 10;
        const shortTermOrdersInfo = generateShortTermOrdersInfo();
        await placeShortTermOrders(client, subaccount, shortTermOrdersInfo, goodTilBlock);
        await (0, utils_1.sleep)(5000);
        await batchCancelOrders(client, subaccount, shortTermOrdersInfo, goodTilBlock);
    }
    catch (error) {
        console.error('**Test Failed**', error.message);
    }
}
const placeShortTermOrders = async (client, subaccount, shortTermOrdersInfo, goodTilBlock) => {
    const orderPromises = shortTermOrdersInfo.map(async (order) => {
        try {
            const tx = await client.placeShortTermOrder(subaccount, order.marketId, order.side, order.price, order.size, order.clientId, goodTilBlock, src_1.Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED, false);
            console.log('**Short Term Order Tx**', tx.hash);
        }
        catch (error) {
            console.error(`**Short Term Order Failed for Market ${order.marketId}, Client ID ${order.clientId}**`, error.message);
        }
    });
    // Wait for all order placements to complete
    await Promise.all(orderPromises);
};
const batchCancelOrders = async (client, subaccount, shortTermOrdersInfo, goodTilBlock) => {
    const shortTermOrdersPayload = generateBatchCancelShortTermOrders(shortTermOrdersInfo);
    try {
        const tx = await client.batchCancelShortTermOrdersWithMarketId(subaccount, shortTermOrdersPayload, goodTilBlock + 10);
        console.log('**Batch Cancel Short Term Orders Tx**', tx);
    }
    catch (error) {
        console.error('**Batch Cancel Short Term Orders Failed**', error.message);
    }
};
test()
    .then(() => {
    console.log('**Batch Cancel Test Completed Successfully**');
})
    .catch((error) => {
    console.error('**Batch Cancel Test Execution Error**', error.message);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmF0Y2hfY2FuY2VsX29yZGVyc19leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vZXhhbXBsZXMvYmF0Y2hfY2FuY2VsX29yZGVyc19leGFtcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0RBQXVCO0FBRXZCLGdDQUEwRDtBQUMxRCxzRUFBMEY7QUFDMUYsd0RBQThEO0FBQzlELHVGQUE4RDtBQUM5RCwwREFBMkQ7QUFDM0QsNENBQW9EO0FBQ3BELDJDQUFnRTtBQVVoRSxNQUFNLDJCQUEyQixHQUFHLEdBQWdCLEVBQUUsQ0FBQztJQUNyRDtRQUNFLFFBQVEsRUFBRSxTQUFTO1FBQ25CLFFBQVEsRUFBRSxJQUFBLGlCQUFTLEVBQUMseUJBQWEsQ0FBQztRQUNsQyxJQUFJLEVBQUUscUJBQVMsQ0FBQyxJQUFJO1FBQ3BCLEtBQUssRUFBRSxJQUFJO1FBQ1gsSUFBSSxFQUFFLElBQUk7S0FDWDtJQUNEO1FBQ0UsUUFBUSxFQUFFLFNBQVM7UUFDbkIsUUFBUSxFQUFFLElBQUEsaUJBQVMsRUFBQyx5QkFBYSxDQUFDO1FBQ2xDLElBQUksRUFBRSxxQkFBUyxDQUFDLElBQUk7UUFDcEIsS0FBSyxFQUFFLElBQUk7UUFDWCxJQUFJLEVBQUUsSUFBSTtLQUNYO0lBQ0Q7UUFDRSxRQUFRLEVBQUUsU0FBUztRQUNuQixRQUFRLEVBQUUsSUFBQSxpQkFBUyxFQUFDLHlCQUFhLENBQUM7UUFDbEMsSUFBSSxFQUFFLHFCQUFTLENBQUMsR0FBRztRQUNuQixLQUFLLEVBQUUsS0FBSztRQUNaLElBQUksRUFBRSxJQUFJO0tBQ1g7Q0FDRixDQUFDO0FBRUYsTUFBTSxrQ0FBa0MsR0FBRyxDQUFDLFVBQXVCLEVBQTRCLEVBQUU7SUFDL0YsTUFBTSx3QkFBd0IsR0FBRyxnQkFBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNo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