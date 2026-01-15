"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const long_1 = __importDefault(require("long"));
const constants_1 = require("../src/clients/constants");
const local_wallet_1 = __importDefault(require("../src/clients/modules/local-wallet"));
const noble_client_1 = require("../src/clients/noble-client");
const validator_client_1 = require("../src/clients/validator-client");
const constants_2 = require("../src/lib/constants");
const utils_1 = require("../src/lib/utils");
const constants_3 = require("./constants");
async function test() {
    const dydxClient = await validator_client_1.ValidatorClient.connect(constants_1.Network.testnet().validatorConfig);
    const dydxWallet = await local_wallet_1.default.fromMnemonic(constants_3.DYDX_TEST_MNEMONIC, constants_2.BECH32_PREFIX);
    const nobleWallet = await local_wallet_1.default.fromMnemonic(constants_3.DYDX_TEST_MNEMONIC, constants_2.NOBLE_BECH32_PREFIX);
    const client = new noble_client_1.NobleClient('https://rpc.testnet.noble.strange.love', 'Noble example');
    await client.connect(nobleWallet);
    if (nobleWallet.address === undefined || dydxWallet.address === undefined) {
        throw new Error('Wallet not found');
    }
    // IBC to noble
    const ibcToNobleMsg = {
        typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
        value: {
            sourcePort: 'transfer',
            sourceChannel: 'channel-0',
            token: {
                denom: 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5',
                amount: '1000000',
            },
            sender: dydxWallet.address,
            receiver: nobleWallet.address,
            timeoutTimestamp: long_1.default.fromNumber(Math.floor(Date.now() / 1000) * 1e9 + 10 * 60 * 1e9),
        },
    };
    const msgs = [ibcToNobleMsg];
    const encodeObjects = new Promise((resolve) => resolve(msgs));
    await dydxClient.post.send(dydxWallet, () => {
        return encodeObjects;
    }, false, undefined, undefined);
    await (0, utils_1.sleep)(30000);
    try {
        const coins = await client.getAccountBalances();
        console.log('Balances');
        console.log(JSON.stringify(coins));
        // IBC from noble
        const ibcFromNobleMsg = {
            typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
            value: {
                sourcePort: 'transfer',
                sourceChannel: 'channel-21',
                token: {
                    denom: 'uusdc',
                    amount: coins[0].amount,
                },
                sender: nobleWallet.address,
                receiver: dydxWallet.address,
                timeoutTimestamp: long_1.default.fromNumber(Math.floor(Date.now() / 1000) * 1e9 + 10 * 60 * 1e9),
            },
        };
        const fee = await client.simulateTransaction([ibcFromNobleMsg]);
        ibcFromNobleMsg.value.token.amount = (parseInt(ibcFromNobleMsg.value.token.amount, 10) -
            Math.floor(parseInt(fee.amount[0].amount, 10) * 1.4)).toString();
        await client.send([ibcFromNobleMsg]);
    }
    catch (error) {
        console.log(JSON.stringify(error.message));
    }
    await (0, utils_1.sleep)(30000);
    try {
        const coin = await client.getAccountBalance('uusdc');
        console.log('Balance');
        console.log(JSON.stringify(coin));
    }
    catch (error) {
        console.log(JSON.stringify(error.message));
    }
}
test()
    .then(() => { })
    .catch((error) => {
    console.log(error.message);
    console.log(error);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9ibGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2V4YW1wbGVzL25vYmxlX2V4YW1wbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxnREFBd0I7QUFFeEIsd0RBQW1EO0FBQ25ELHVGQUE4RDtBQUM5RCw4REFBMEQ7QUFDMUQsc0VBQWtFO0FBQ2xFLG9EQUEwRTtBQUMxRSw0Q0FBeUM7QUFDekMsMkNBQWlEO0FBRWpELEtBQUssVUFBVSxJQUFJO0lBQ2pCLE1BQU0sVUFBVSxHQUFHLE1BQU0sa0NBQWUsQ0FBQyxPQUFPLENBQUMsbUJBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUVwRixNQUFNLFVBQVUsR0FBRyxNQUFNLHNCQUFXLENBQUMsWUFBWSxDQUFDLDhCQUFrQixFQUFFLHlCQUFhLENBQUMsQ0FBQztJQUNyRixNQUFNLFdBQVcsR0FBRyxNQUFNLHNCQUFXLENBQUMsWUFBWSxDQUFDLDhCQUFrQixFQUFFLCtCQUFtQixDQUFDLENBQUM7SUFFNUYsTUFBTSxNQUFNLEdBQUcsSUFBSSwwQkFBVyxDQUFDLHdDQUF3QyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQzFGLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUVsQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO1FBQ3pFLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztLQUNyQztJQUVELGVBQWU7SUFFZixNQUFNLGFBQWEsR0FBaUI7UUFDbEMsT0FBTyxFQUFFLDJDQUEyQztRQUNwRCxLQUFLLEVBQUU7WUFDTCxVQUFVLEVBQUUsVUFBVTtZQUN0QixhQUFhLEVBQUUsV0FBVztZQUMxQixLQUFLLEVBQUU7Z0JBQ0wsS0FBSyxFQUFFLHNFQUFzRTtnQkFDN0UsTUFBTSxFQUFFLFNBQVM7YUFDbEI7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