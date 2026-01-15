"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgClientImpl = void 0;
const _m0 = __importStar(require("protobufjs/minimal"));
const tx_1 = require("./tx");
class MsgClientImpl {
    constructor(rpc) {
        this.rpc = rpc;
        this.depositToMegavault = this.depositToMegavault.bind(this);
        this.withdrawFromMegavault = this.withdrawFromMegavault.bind(this);
        this.updateDefaultQuotingParams = this.updateDefaultQuotingParams.bind(this);
        this.updateOperatorParams = this.updateOperatorParams.bind(this);
        this.setVaultParams = this.setVaultParams.bind(this);
        this.unlockShares = this.unlockShares.bind(this);
        this.allocateToVault = this.allocateToVault.bind(this);
        this.retrieveFromVault = this.retrieveFromVault.bind(this);
    }
    depositToMegavault(request) {
        const data = tx_1.MsgDepositToMegavault.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Msg", "DepositToMegavault", data);
        return promise.then(data => tx_1.MsgDepositToMegavaultResponse.decode(new _m0.Reader(data)));
    }
    withdrawFromMegavault(request) {
        const data = tx_1.MsgWithdrawFromMegavault.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Msg", "WithdrawFromMegavault", data);
        return promise.then(data => tx_1.MsgWithdrawFromMegavaultResponse.decode(new _m0.Reader(data)));
    }
    updateDefaultQuotingParams(request) {
        const data = tx_1.MsgUpdateDefaultQuotingParams.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Msg", "UpdateDefaultQuotingParams", data);
        return promise.then(data => tx_1.MsgUpdateDefaultQuotingParamsResponse.decode(new _m0.Reader(data)));
    }
    updateOperatorParams(request) {
        const data = tx_1.MsgUpdateOperatorParams.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Msg", "UpdateOperatorParams", data);
        return promise.then(data => tx_1.MsgUpdateOperatorParamsResponse.decode(new _m0.Reader(data)));
    }
    setVaultParams(request) {
        const data = tx_1.MsgSetVaultParams.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Msg", "SetVaultParams", data);
        return promise.then(data => tx_1.MsgSetVaultParamsResponse.decode(new _m0.Reader(data)));
    }
    unlockShares(request) {
        const data = tx_1.MsgUnlockShares.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Msg", "UnlockShares", data);
        return promise.then(data => tx_1.MsgUnlockSharesResponse.decode(new _m0.Reader(data)));
    }
    allocateToVault(request) {
        const data = tx_1.MsgAllocateToVault.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Msg", "AllocateToVault", data);
        return promise.then(data => tx_1.MsgAllocateToVaultResponse.decode(new _m0.Reader(data)));
    }
    retrieveFromVault(request) {
        const data = tx_1.MsgRetrieveFromVault.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Msg", "RetrieveFromVault", data);
        return promise.then(data => tx_1.MsgRetrieveFromVaultResponse.decode(new _m0.Reader(data)));
    }
}
exports.MsgClientImpl = MsgClientImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHgucnBjLm1zZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9AZHlkeHByb3RvY29sL3Y0LXByb3RvL3NyYy9jb2RlZ2VuL2R5ZHhwcm90b2NvbC92YXVsdC90eC5ycGMubXNnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esd0RBQTBDO0FBQzFDLDZCQUFvYztBQStCcGMsTUFBYSxhQUFhO0lBR3hCLFlBQVksR0FBUTtRQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFD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