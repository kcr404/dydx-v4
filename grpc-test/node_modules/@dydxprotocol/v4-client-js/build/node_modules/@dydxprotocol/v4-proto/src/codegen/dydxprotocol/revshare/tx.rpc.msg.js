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
        this.setMarketMapperRevenueShare = this.setMarketMapperRevenueShare.bind(this);
        this.setMarketMapperRevShareDetailsForMarket = this.setMarketMapperRevShareDetailsForMarket.bind(this);
        this.updateUnconditionalRevShareConfig = this.updateUnconditionalRevShareConfig.bind(this);
    }
    setMarketMapperRevenueShare(request) {
        const data = tx_1.MsgSetMarketMapperRevenueShare.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.revshare.Msg", "SetMarketMapperRevenueShare", data);
        return promise.then(data => tx_1.MsgSetMarketMapperRevenueShareResponse.decode(new _m0.Reader(data)));
    }
    setMarketMapperRevShareDetailsForMarket(request) {
        const data = tx_1.MsgSetMarketMapperRevShareDetailsForMarket.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.revshare.Msg", "SetMarketMapperRevShareDetailsForMarket", data);
        return promise.then(data => tx_1.MsgSetMarketMapperRevShareDetailsForMarketResponse.decode(new _m0.Reader(data)));
    }
    updateUnconditionalRevShareConfig(request) {
        const data = tx_1.MsgUpdateUnconditionalRevShareConfig.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.revshare.Msg", "UpdateUnconditionalRevShareConfig", data);
        return promise.then(data => tx_1.MsgUpdateUnconditionalRevShareConfigResponse.decode(new _m0.Reader(data)));
    }
}
exports.MsgClientImpl = MsgClientImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHgucnBjLm1zZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9AZHlkeHByb3RvY29sL3Y0LXByb3RvL3NyYy9jb2RlZ2VuL2R5ZHhwcm90b2NvbC9yZXZzaGFyZS90eC5ycGMubXNnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esd0RBQTBDO0FBQzFDLDZCQUFrUjtBQW1CbFIsTUFBYSxhQUFhO0lBR3hCLFlBQVksR0FBUTtRQUNsQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9FLElBQUksQ0FBQyx1Q0FBdUMsR0FBRyxJQUFJLENBQUMsdUNBQXVDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZHLElBQUksQ0FBQyxpQ0FBaUMsR0FBRyxJQUFJLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFFRCwyQkFBMkIsQ0FBQyxPQUF1QztRQUNqRSxNQUFNLElBQUksR0FBRyxtQ0FBOEIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDckUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUUsNkJBQTZCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkcsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsMkNBQXNDLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkcsQ0FBQztJQUVELHVDQUF1QyxDQUFDLE9BQW1EO1FBQ3pGLE1BQU0sSUFBSSxHQUFHLCtDQUEwQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNqRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSx5Q0FBeUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvRyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyx1REFBa0QsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRyxDQUFDO0lBRUQsaUNBQWlDLENBQUMsT0FBNkM7UUFDN0UsTUFBTSxJQUFJLEdBQUcseUNBQW9DLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzNFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLG1DQUFtQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pHLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGlEQUE0QyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pHLENBQUM7Q0FFRjtBQTVCRCxzQ0E0QkMifQ==