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
exports.createRpcQueryExtension = exports.QueryClientImpl = void 0;
const _m0 = __importStar(require("protobufjs/minimal"));
const stargate_1 = require("@cosmjs/stargate");
const query_1 = require("./query");
class QueryClientImpl {
    constructor(rpc) {
        this.rpc = rpc;
        this.subaccount = this.subaccount.bind(this);
        this.subaccountAll = this.subaccountAll.bind(this);
        this.getWithdrawalAndTransfersBlockedInfo = this.getWithdrawalAndTransfersBlockedInfo.bind(this);
        this.collateralPoolAddress = this.collateralPoolAddress.bind(this);
    }
    subaccount(request) {
        const data = query_1.QueryGetSubaccountRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.subaccounts.Query", "Subaccount", data);
        return promise.then(data => query_1.QuerySubaccountResponse.decode(new _m0.Reader(data)));
    }
    subaccountAll(request = {
        pagination: undefined
    }) {
        const data = query_1.QueryAllSubaccountRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.subaccounts.Query", "SubaccountAll", data);
        return promise.then(data => query_1.QuerySubaccountAllResponse.decode(new _m0.Reader(data)));
    }
    getWithdrawalAndTransfersBlockedInfo(request) {
        const data = query_1.QueryGetWithdrawalAndTransfersBlockedInfoRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.subaccounts.Query", "GetWithdrawalAndTransfersBlockedInfo", data);
        return promise.then(data => query_1.QueryGetWithdrawalAndTransfersBlockedInfoResponse.decode(new _m0.Reader(data)));
    }
    collateralPoolAddress(request) {
        const data = query_1.QueryCollateralPoolAddressRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.subaccounts.Query", "CollateralPoolAddress", data);
        return promise.then(data => query_1.QueryCollateralPoolAddressResponse.decode(new _m0.Reader(data)));
    }
}
exports.QueryClientImpl = QueryClientImpl;
const createRpcQueryExtension = (base) => {
    const rpc = (0, stargate_1.createProtobufRpcClient)(base);
    const queryService = new QueryClientImpl(rpc);
    return {
        subaccount(request) {
            return queryService.subaccount(request);
        },
        subaccountAll(request) {
            return queryService.subaccountAll(request);
        },
        getWithdrawalAndTransfersBlockedInfo(request) {
            return queryService.getWithdrawalAndTransfersBlockedInfo(request);
        },
        collateralPoolAddress(request) {
            return queryService.collateralPoolAddress(request);
        }
    };
};
exports.createRpcQueryExtension = createRpcQueryExtension;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnkucnBjLlF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BkeWR4cHJvdG9jb2wvdjQtcHJvdG8vc3JjL2NvZGVnZW4vZHlkeHByb3RvY29sL3N1YmFjY291bnRzL3F1ZXJ5LnJwYy5RdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHdEQUEwQztBQUMxQywrQ0FBd0U7QUFDeEUsbUNBQWdUO0FBbUJoVCxNQUFhLGVBQWU7SUFHMUIsWUFBWSxHQUFRO1FBQ2xCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxvQ0FBb0MsR0FBRyxJQUFJLENBQUMsb0NBQW9DLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRCxVQUFVLENBQUMsT0FBa0M7UUFDM0MsTUFBTSxJQUFJLEdBQUcsaUNBQXlCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2hFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdDQUFnQyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2RixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQywrQkFBdUIsQ0FBQyxNQUFNLENBQUMs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