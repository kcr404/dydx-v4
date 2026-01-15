"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NobleClient = void 0;
const proto_signing_1 = require("@cosmjs/proto-signing");
const stargate_1 = require("@cosmjs/stargate");
const constants_1 = require("./constants");
const cctpProto_1 = require("./lib/cctpProto");
class NobleClient {
    constructor(restEndpoint, defaultClientMemo) {
        this.restEndpoint = restEndpoint;
        this.defaultClientMemo = defaultClientMemo;
    }
    get isConnected() {
        return Boolean(this.stargateClient);
    }
    async connect(wallet) {
        if ((wallet === null || wallet === void 0 ? void 0 : wallet.offlineSigner) === undefined) {
            throw new Error('Wallet signer not found');
        }
        this.wallet = wallet;
        this.stargateClient = await stargate_1.SigningStargateClient.connectWithSigner(this.restEndpoint, wallet.offlineSigner, {
            registry: new proto_signing_1.Registry([
                ['/circle.cctp.v1.MsgDepositForBurn', cctpProto_1.MsgDepositForBurn],
                ['/circle.cctp.v1.MsgDepositForBurnWithCaller', cctpProto_1.MsgDepositForBurnWithCaller],
                ...stargate_1.defaultRegistryTypes,
            ]),
        });
    }
    getAccountBalances() {
        var _a;
        if (!this.stargateClient || ((_a = this.wallet) === null || _a === void 0 ? void 0 : _a.address) === undefined) {
            throw new Error('stargateClient not initialized');
        }
        return this.stargateClient.getAllBalances(this.wallet.address);
    }
    getAccountBalance(denom) {
        var _a;
        if (!this.stargateClient || ((_a = this.wallet) === null || _a === void 0 ? void 0 : _a.address) === undefined) {
            throw new Error('stargateClient not initialized');
        }
        return this.stargateClient.getBalance(this.wallet.address, denom);
    }
    async IBCTransfer(message) {
        const tx = await this.send([message]);
        return tx;
    }
    async send(messages, gasPrice = stargate_1.GasPrice.fromString('0.1uusdc'), memo) {
        var _a;
        if (!this.stargateClient) {
            throw new Error('NobleClient stargateClient not initialized');
        }
        if (((_a = this.wallet) === null || _a === void 0 ? void 0 : _a.address) === undefined) {
            throw new Error('NobleClient wallet not initialized');
        }
        // Simulate to get the gas estimate
        const fee = await this.simulateTransaction(messages, gasPrice, memo !== null && memo !== void 0 ? memo : this.defaultClientMemo);
        // Sign and broadcast the transaction
        return this.stargateClient.signAndBroadcast(this.wallet.address, messages, fee, memo !== null && memo !== void 0 ? memo : this.defaultClientMemo);
    }
    async simulateTransaction(messages, gasPrice = stargate_1.GasPrice.fromString('0.1uusdc'), memo) {
        var _a, _b;
        if (!this.stargateClient) {
            throw new Error('NobleClient stargateClient not initialized');
        }
        if (((_a = this.wallet) === null || _a === void 0 ? void 0 : _a.address) === undefined) {
            throw new Error('NobleClient wallet not initialized');
        }
        // Get simulated response
        const gasEstimate = await this.stargateClient.simulate((_b = this.wallet) === null || _b === void 0 ? void 0 : _b.address, messages, memo);
        // Calculate and return the fee
        return (0, stargate_1.calculateFee)(Math.floor(gasEstimate * constants_1.GAS_MULTIPLIER), gasPrice);
    }
}
exports.NobleClient = NobleClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9ibGUtY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaWVudHMvbm9ibGUtY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlEQUFxRTtBQUNyRSwrQ0FRMEI7QUFFMUIsMkNBQTZDO0FBQzdDLCtDQUFpRjtBQUdqRixNQUFhLFdBQVc7SUFNdEIsWUFBWSxZQUFvQixFQUFFLGlCQUEwQjtRQUMxRCxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7SUFDN0MsQ0FBQztJQUVELElBQUksV0FBVztRQUNiLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFtQjtRQUMvQixJQUFJLENBQUEsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLGFBQWEsTUFBSyxTQUFTLEVBQUU7WUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1NBQzVDO1FBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLGdDQUFxQixDQUFDLGlCQUFpQixDQUNqRSxJQUFJLENBQUMsWUFBWSxFQUNqQixNQUFNLENBQUMsYUFBYSxFQUNwQjtZQUNFLFFBQVEsRUFBRSxJQUFJLHdCQUFRLENBQUM7Z0JBQ3JCLENBQUMsbUNBQW1DLEVBQUUsNkJBQWlCLENBQUM7Z0JBQ3hELENBQUMsNkNBQTZDLEVBQUUsdUNBQTJCLENBQUM7Z0JBQzVFLEdBQUcsK0JBQW9CO2FBQ3hCLENBQUM7U0FDSCxDQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsa0JBQWtCOztRQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFBLE1BQUEsSUFBSSxDQUFDLE1BQU0sMENB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