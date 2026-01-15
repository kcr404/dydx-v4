"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tendermint_rpc_1 = require("@cosmjs/tendermint-rpc");
const long_1 = __importDefault(require("long"));
const constants_1 = require("../__tests__/helpers/constants");
const src_1 = require("../src");
const constants_2 = require("../src/clients/constants");
const local_wallet_1 = __importDefault(require("../src/clients/modules/local-wallet"));
const subaccount_1 = require("../src/clients/subaccount");
const validator_client_1 = require("../src/clients/validator-client");
const constants_3 = require("./constants");
async function test() {
    const wallet = await local_wallet_1.default.fromMnemonic(constants_3.DYDX_TEST_MNEMONIC, src_1.BECH32_PREFIX);
    console.log(wallet);
    const client = await validator_client_1.ValidatorClient.connect(constants_2.Network.testnet().validatorConfig);
    console.log('**Client**');
    console.log(client);
    const subaccount = new subaccount_1.SubaccountInfo(wallet, 0);
    const amount = new long_1.default(100000000);
    const msgs = new Promise((resolve) => {
        const msg = client.post.composer.composeMsgWithdrawFromSubaccount(subaccount.address, subaccount.subaccountNumber, 0, amount, constants_1.TEST_RECIPIENT_ADDRESS);
        resolve([msg]);
    });
    const totalFee = await client.post.simulate(subaccount.wallet, () => msgs, undefined);
    console.log('**Total Fee**');
    console.log(totalFee);
    const amountAfterFee = amount.sub(long_1.default.fromString(totalFee.amount[0].amount));
    console.log('**Amount after fee**');
    console.log(amountAfterFee);
    const tx = await client.post.withdraw(subaccount, 0, amountAfterFee, constants_1.TEST_RECIPIENT_ADDRESS, tendermint_rpc_1.Method.BroadcastTxCommit);
    console.log('**Withdraw and Send**');
    console.log(tx);
}
test()
    .then(() => { })
    .catch((error) => {
    console.log(error.message);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmZXJfZXhhbXBsZV93aXRoZHJhd19vdGhlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2V4YW1wbGVzL3RyYW5zZmVyX2V4YW1wbGVfd2l0aGRyYXdfb3RoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSwyREFBZ0Q7QUFDaEQsZ0RBQXdCO0FBRXhCLDhEQUF3RTtBQUN4RSxnQ0FBdUM7QUFDdkMsd0RBQW1EO0FBQ25ELHVGQUE4RDtBQUM5RCwwREFBMkQ7QUFDM0Qsc0VBQWtFO0FBQ2xFLDJDQUFpRDtBQUVqRCxLQUFLLFVBQVUsSUFBSTtJQUNqQixNQUFNLE1BQU0sR0FBRyxNQUFNLHNCQUFXLENBQUMsWUFBWSxDQUFDLDhCQUFrQixFQUFFLG1CQUFhLENBQUMsQ0FBQztJQUNqRixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXBCLE1BQU0sTUFBTSxHQUFHLE1BQU0sa0NBQWUsQ0FBQyxPQUFPLENBQUMsbUJBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNoRixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFcEIsTUFBTSxVQUFVLEdBQUcsSUFBSSwyQkFBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVqRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGNBQUksQ0FBQyxTQUFXLENBQUMsQ0FBQztJQUVyQyxNQUFNLElBQUksR0FBNEIsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUM1RCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0MsQ0FDL0QsVUFBVSxDQUFDLE9BQU8sRUFDbEIsVUFBVSxDQUFDLGdCQUFnQixFQUMzQixDQUFDLEVBQ0QsTUFBTSxFQUNOLGtDQUFzQixDQUN2QixDQUFDO1FBRUYsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNqQixDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDdEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXRCLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDOUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFNUIsTUFBTSxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FDbkMsVUFBVSxFQUNWLENBQUMsRUFDRCxjQUFjLEVBQ2Qsa0NBQXNCLEVBQ3RCLHVCQUFNLENBQUMsaUJBQWlCLENBQ3pCLENBQUM7SUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNsQixDQUFDO0FBRUQsSUFBSSxFQUFFO0tBQ0gsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztLQUNkLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO0lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUMifQ==