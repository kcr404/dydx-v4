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
        const msg = client.post.composer.composeMsgSendToken(subaccount.address, constants_1.TEST_RECIPIENT_ADDRESS, client.config.denoms.CHAINTOKEN_DENOM, amount.toString());
        resolve([msg]);
    });
    const totalFee = await client.post.simulate(subaccount.wallet, () => msgs, undefined, undefined);
    console.log('**Total Fee**');
    console.log(totalFee);
    const amountAfterFee = amount.sub(long_1.default.fromString(totalFee.amount[0].amount));
    console.log('**Amount after fee**');
    console.log(amountAfterFee);
    const tx = await client.post.sendToken(subaccount, constants_1.TEST_RECIPIENT_ADDRESS, client.config.denoms.CHAINTOKEN_DENOM, amountAfterFee.toString(), false, tendermint_rpc_1.Method.BroadcastTxCommit);
    console.log('**Send**');
    console.log(tx);
}
test()
    .then(() => { })
    .catch((error) => {
    console.log(error.message);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmZXJfZXhhbXBsZV9zZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vZXhhbXBsZXMvdHJhbnNmZXJfZXhhbXBsZV9zZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsMkRBQWdEO0FBQ2hELGdEQUF3QjtBQUV4Qiw4REFBd0U7QUFDeEUsZ0NBQXVDO0FBQ3ZDLHdEQUFtRDtBQUNuRCx1RkFBOEQ7QUFDOUQsMERBQTJEO0FBQzNELHNFQUFrRTtBQUNsRSwyQ0FBaUQ7QUFFakQsS0FBSyxVQUFVLElBQUk7SUFDakIsTUFBTSxNQUFNLEdBQUcsTUFBTSxzQkFBVyxDQUFDLFlBQVksQ0FBQyw4QkFBa0IsRUFBRSxtQkFBYSxDQUFDLENBQUM7SUFDakYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVwQixNQUFNLE1BQU0sR0FBRyxNQUFNLGtDQUFlLENBQUMsT0FBTyxDQUFDLG1CQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDaEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXBCLE1BQU0sVUFBVSxHQUFHLElBQUksMkJBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxjQUFJLENBQUMsU0FBVyxDQUFDLENBQUM7SUFFckMsTUFBTSxJQUFJLEdBQTRCLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFDNUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQ2xELFVBQVUsQ0FBQyxPQUFPLEVBQ2xCLGtDQUFzQixFQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFDckMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUNsQixDQUFDO1FBRUYsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNqQixDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2pHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUV0QixNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGNBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzlFLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRTVCLE1BQU0sRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQ3BDLFVBQVUsRUFDVixrQ0FBc0IsRUFDdEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQ3JDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsRUFDekIsS0FBSyxFQUNMLHVCQUFNLENBQUMsaUJBQWlCLENBQ3pCLENBQUM7SUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQUVELElBQUksRUFBRTtLQUNILElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUM7S0FDZCxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtJQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDIn0=