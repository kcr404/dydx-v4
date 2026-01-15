"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const composite_client_1 = require("../src/clients/composite-client");
const constants_1 = require("../src/clients/constants");
const local_wallet_1 = __importDefault(require("../src/clients/modules/local-wallet"));
const subaccount_1 = require("../src/clients/subaccount");
const utils_1 = require("../src/lib/utils");
const constants_2 = require("./constants");
const human_readable_orders_json_1 = __importDefault(require("./human_readable_orders.json"));
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function test() {
    var _a, _b, _c;
    const wallet = await local_wallet_1.default.fromMnemonic(constants_2.DYDX_TEST_MNEMONIC, src_1.BECH32_PREFIX);
    console.log(wallet);
    const network = constants_1.Network.testnet();
    const client = await composite_client_1.CompositeClient.connect(network);
    console.log('**Client**');
    console.log(client);
    const subaccount = new subaccount_1.SubaccountInfo(wallet, 0);
    for (const orderParams of human_readable_orders_json_1.default) {
        try {
            const type = constants_1.OrderType[orderParams.type];
            const side = constants_1.OrderSide[orderParams.side];
            const timeInForceString = (_a = orderParams.timeInForce) !== null && _a !== void 0 ? _a : 'GTT';
            const timeInForce = constants_1.OrderTimeInForce[timeInForceString];
            const price = (_b = orderParams.price) !== null && _b !== void 0 ? _b : 1350;
            const timeInForceSeconds = timeInForce === constants_1.OrderTimeInForce.GTT ? 60 : 0;
            const postOnly = (_c = orderParams.postOnly) !== null && _c !== void 0 ? _c : false;
            const tx = await client.placeOrder(subaccount, 'ETH-USD', type, side, price, 0.01, (0, utils_1.randomInt)(constants_2.MAX_CLIENT_ID), timeInForce, timeInForceSeconds, constants_1.OrderExecution.DEFAULT, postOnly, false);
            console.log('**Order Tx**');
            console.log(tx);
        }
        catch (error) {
            console.log(error.message);
        }
        await sleep(5000); // wait for placeOrder to complete
    }
}
test()
    .then(() => { })
    .catch((error) => {
    console.log(error.message);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2V4YW1wbGVzL3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxnQ0FBdUM7QUFDdkMsc0VBQWtFO0FBQ2xFLHdEQU1rQztBQUNsQyx1RkFBOEQ7QUFDOUQsMERBQTJEO0FBQzNELDRDQUE2QztBQUM3QywyQ0FBZ0U7QUFDaEUsOEZBQXdEO0FBRXhELEtBQUssVUFBVSxLQUFLLENBQUMsRUFBVTtJQUM3QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0QsQ0FBQztBQUVELEtBQUssVUFBVSxJQUFJOztJQUNqQixNQUFNLE1BQU0sR0FBRyxNQUFNLHNCQUFXLENBQUMsWUFBWSxDQUFDLDhCQUFrQixFQUFFLG1CQUFhLENBQUMsQ0FBQztJQUNqRixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BCLE1BQU0sT0FBTyxHQUFHLG1CQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxrQ0FBZSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0RCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEIsTUFBTSxVQUFVLEdBQUcsSUFBSSwyQkFBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRCxLQUFLLE1BQU0sV0FBVyxJQUFJLG9DQUFZLEVBQUU7UUFDdEMsSUFBSTtZQUNGLE1BQU0sSUFBSSxHQUFHLHFCQUFTLENBQUMsV0FBVyxDQUFDLElBQThCLENBQUMsQ0FBQztZQUNuRSxNQUFNLElBQUksR0FBRyxxQkFBUyxDQUFDLFdBQVcsQ0FBQyxJQUE4QixDQUFDLENBQUM7WUFDbkUsTUFBTSxpQkFBaUIsR0FBRyxNQUFBLFdBQVcsQ0FBQyxXQUFXLG1DQUFJLEtBQUssQ0FBQztZQUMzRCxNQUFNLFdBQVcsR0FBRyw0QkFBZ0IsQ0FBQyxpQkFBa0QsQ0FBQyxDQUFDO1lBQ3pGLE1BQU0sS0FBSyxHQUFHLE1BQUEsV0FBVyxDQUFDLEtBQUssbUNBQUksSUFBSSxDQUFDO1lBQ3hDLE1BQU0sa0JBQWtCLEdBQUcsV0FBVyxLQUFLLDRCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekUsTUFBTSxRQUFRLEdBQUcsTUFBQSxXQUFXLENBQUMsUUFBUSxtQ0FBSSxLQUFLLENBQUM7WUFDL0MsTUFBTSxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsVUFBVSxDQUNoQyxVQUFVLEVBQ1YsU0FBUyxFQUNULElBQUksRUFDSixJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixJQUFBLGlCQUFTLEVBQUMseUJBQWEsQ0FBQyxFQUN4QixXQUFXLEVBQ1gsa0JBQWtCLEVBQ2xCLDBCQUFjLENBQUMsT0FBTyxFQUN0QixRQUFRLEVBQ1IsS0FBSyxDQUNOLENBQUM7WUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDakI7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzVCO1FBRUQsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxrQ0FBa0M7S0FDdEQ7QUFDSCxDQUFDO0FBRUQsSUFBSSxFQUFFO0tBQ0gsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztLQUNkLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO0lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUMifQ==