"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../src/clients/constants");
const errors_1 = require("../src/clients/lib/errors");
const native_1 = require("../src/clients/native");
const constants_2 = require("./constants");
async function test() {
    try {
        const paramsInJson = `{
      "endpointUrls":[
        "https://dydx-testnet.nodefleet.org",
        "https://test-dydx-rpc.kingnodes.com",
        "https://dydx-rpc.liquify.com/api=8878132/dydx"
      ],
      "chainId":"dydx-testnet-4"
    }`;
        const result = await (0, native_1.getOptimalNode)(paramsInJson);
        console.log(result);
        const wallet = await (0, native_1.connectWallet)(constants_2.DYDX_TEST_MNEMONIC);
        console.log(wallet);
        const params3 = `
    {"subaccountNumber":0,"amount":100.0}
    `;
        const result3 = await (0, native_1.faucet)(params3);
        console.log(result3);
        const address = await (0, native_1.connect)(constants_1.Network.testnet(), constants_2.DYDX_TEST_MNEMONIC);
        console.log(address);
        const payload = `{ "address": "${constants_2.DYDX_TEST_ADDRESS}" }`;
        const userStats = await (0, native_1.getUserStats)(payload);
        console.log(userStats);
        const balances1 = await (0, native_1.getAccountBalances)();
        console.log(balances1);
        const vaultOwnerShares = await (0, native_1.getMegavaultOwnerShares)(payload);
        console.log(vaultOwnerShares);
        const depositResult = await (0, native_1.depositToMegavault)(0, 2);
        console.log(depositResult);
        const withdrawResult = await (0, native_1.withdrawFromMegavault)(0, 1, 0);
        console.log(withdrawResult);
        const sendTokenPayload = {
            subaccountNumber: 0,
            amount: '10',
            recipient: 'dydx15ndn9c895f8ntck25qughtuck9spv2d9svw5qx',
        };
        const fees = await (0, native_1.simulateTransferNativeToken)(JSON.stringify(sendTokenPayload));
        console.log(fees);
        let tx = await (0, native_1.transferNativeToken)(JSON.stringify(sendTokenPayload));
        console.log(tx);
        let balances = await (0, native_1.getAccountBalances)();
        console.log(balances);
        const simulatePayload = {
            subaccountNumber: 0,
            amount: 20, // In USDC i.e. $20.00
        };
        let stdFee = await (0, native_1.simulateWithdraw)(JSON.stringify(simulatePayload));
        console.log(stdFee);
        const withdrawlPayload = {
            subaccountNumber: 0,
            amount: 20,
        };
        tx = await (0, native_1.withdraw)(JSON.stringify(withdrawlPayload));
        console.log(tx);
        balances = await (0, native_1.getAccountBalances)();
        console.log(balances);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const depositPayload = {
            subaccountNumber: 0,
            amount: 20,
        };
        const stringVal = JSON.stringify(depositPayload);
        stdFee = await (0, native_1.simulateDeposit)(stringVal);
        console.log(stdFee);
        tx = await (0, native_1.deposit)(stringVal);
        console.log(tx);
        const squidPayload = `
    {
      "msgTypeUrl": "/ibc.applications.transfer.v1.MsgTransfer",
      "msg": {
          "sourcePort": "transfer",
          "sourceChannel": "channel-0",
          "token": {
              "denom": "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5",
              "amount": "10000000"
          },
          "sender": "dydx16zfx8g4jg9vels3rsvcym490tkn5la304c57e9",
          "receiver": "noble16zfx8g4jg9vels3rsvcym490tkn5la305z0jpu",
          "timeoutTimestamp": {
              "low": -1208865792,
              "high": 393844701,
              "unsigned": false
          },
          "memo": "{\\"forward\\":{\\"receiver\\":\\"osmo1zl9ztmwe2wcdvv9std8xn06mdaqaqm789rutmazfh3z869zcax4sv0ctqw\\",\\"port\\":\\"transfer\\",\\"channel\\":\\"channel-10\\",\\"next\\":{\\"wasm\\":{\\"contract\\":\\"osmo1zl9ztmwe2wcdvv9std8xn06mdaqaqm789rutmazfh3z869zcax4sv0ctqw\\",\\"msg\\":{\\"swap_with_action\\":{\\"swap_msg\\":{\\"token_out_min_amount\\":\\"26039154\\",\\"path\\":[{\\"pool_id\\":\\"46\\",\\"token_out_denom\\":\\"ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE\\"}]},\\"after_swap_action\\":{\\"ibc_transfer\\":{\\"receiver\\":\\"axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5\\",\\"channel\\":\\"channel-3\\",\\"next_memo\\":{\\"destination_chain\\":\\"ethereum-2\\",\\"destination_address\\":\\"0x481A2AAE41cd34832dDCF5A79404538bb2c02bC8\\",\\"payload\\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,49,218,140,19,124,78,181,10,51,8,133,105,138,128,201,57,254,53,175,138,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,37,77,6,243,59,220,91,142,224,91,46,164,114,16,126,48,2,38,101,154,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,37,77,6,243,59,220,91,142,224,91,46,164,114,16,126,48,2,38,101,154,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,9,94,167,179,0,0,0,0,0,0,0,0,0,0,0,0,122,37,13,86,48,180,207,83,151,57,223,44,93,172,180,198,89,242,72,141,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,37,77,6,243,59,220,91,142,224,91,46,164,114,16,126,48,2,38,101,154,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,122,37,13,86,48,180,207,83,151,57,223,44,93,172,180,198,89,242,72,141,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,4,24,203,175,229,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,148,53,113,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,55,213,140,136,107,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,49,218,140,19,124,78,181,10,51,8,133,105,138,128,201,57,254,53,175,138,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,137,180,65,29,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,37,77,6,243,59,220,91,142,224,91,46,164,114,16,126,48,2,38,101,154,0,0,0,0,0,0,0,0,0,0,0,0,180,251,242,113,20,63,79,191,123,145,165,222,211,24,5,228,43,34,8,214,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,37,77,6,243,59,220,91,142,224,91,46,164,114,16,126,48,2,38,101,154,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\\"type\\":2}}},\\"local_fallback_address\\":\\"osmo16zfx8g4jg9vels3rsvcym490tkn5la3056f20q\\"}}}}}}"
      }
  }`;
        console.log(squidPayload);
        const encode = (str) => Buffer.from(str, 'binary').toString('base64');
        const encoded = encode(squidPayload);
        tx = await (0, native_1.withdrawToIBC)(0, '13', encoded);
        console.log(tx);
    }
    catch (error) {
        console.log(error.message);
    }
}
test()
    .then(() => { })
    .catch((error) => {
    console.log(error.message);
});
const error = new errors_1.UserError('client is not connected. Call connectClient() first');
const text = (0, native_1.wrappedError)(error);
console.log(text);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlX2V4YW1wbGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vZXhhbXBsZXMvbmF0aXZlX2V4YW1wbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0RBQW1EO0FBQ25ELHNEQUFzRDtBQUN0RCxrREFrQitCO0FBQy9CLDJDQUFvRTtBQUVwRSxLQUFLLFVBQVUsSUFBSTtJQUNqQixJQUFJO1FBQ0YsTUFBTSxZQUFZLEdBQUc7Ozs7Ozs7TUFPbkIsQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSx1QkFBYyxFQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFcEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLHNCQUFhLEVBQUMsOEJBQWtCLENBQUMsQ0FBQztRQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXBCLE1BQU0sT0FBTyxHQUFHOztLQUVmLENBQUM7UUFDRixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEsZUFBTSxFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFckIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLGdCQUFPLEVBQUMsbUJBQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSw4QkFBa0IsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFckIsTUFBTSxPQUFPLEdBQUcsaUJBQWlCLDZCQUFpQixLQUFLLENBQUM7UUFDeEQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLHFCQUFZLEVBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV2QixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsMkJBQWtCLEdBQUUsQ0FBQztRQUM3QyxP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