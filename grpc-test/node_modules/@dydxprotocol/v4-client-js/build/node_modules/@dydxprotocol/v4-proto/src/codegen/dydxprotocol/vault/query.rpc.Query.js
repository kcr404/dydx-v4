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
        this.params = this.params.bind(this);
        this.vault = this.vault.bind(this);
        this.allVaults = this.allVaults.bind(this);
        this.megavaultTotalShares = this.megavaultTotalShares.bind(this);
        this.megavaultOwnerShares = this.megavaultOwnerShares.bind(this);
        this.megavaultAllOwnerShares = this.megavaultAllOwnerShares.bind(this);
        this.vaultParams = this.vaultParams.bind(this);
        this.megavaultWithdrawalInfo = this.megavaultWithdrawalInfo.bind(this);
    }
    params(request = {}) {
        const data = query_1.QueryParamsRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Query", "Params", data);
        return promise.then(data => query_1.QueryParamsResponse.decode(new _m0.Reader(data)));
    }
    vault(request) {
        const data = query_1.QueryVaultRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Query", "Vault", data);
        return promise.then(data => query_1.QueryVaultResponse.decode(new _m0.Reader(data)));
    }
    allVaults(request = {
        pagination: undefined
    }) {
        const data = query_1.QueryAllVaultsRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Query", "AllVaults", data);
        return promise.then(data => query_1.QueryAllVaultsResponse.decode(new _m0.Reader(data)));
    }
    megavaultTotalShares(request = {}) {
        const data = query_1.QueryMegavaultTotalSharesRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Query", "MegavaultTotalShares", data);
        return promise.then(data => query_1.QueryMegavaultTotalSharesResponse.decode(new _m0.Reader(data)));
    }
    megavaultOwnerShares(request) {
        const data = query_1.QueryMegavaultOwnerSharesRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Query", "MegavaultOwnerShares", data);
        return promise.then(data => query_1.QueryMegavaultOwnerSharesResponse.decode(new _m0.Reader(data)));
    }
    megavaultAllOwnerShares(request = {
        pagination: undefined
    }) {
        const data = query_1.QueryMegavaultAllOwnerSharesRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Query", "MegavaultAllOwnerShares", data);
        return promise.then(data => query_1.QueryMegavaultAllOwnerSharesResponse.decode(new _m0.Reader(data)));
    }
    vaultParams(request) {
        const data = query_1.QueryVaultParamsRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Query", "VaultParams", data);
        return promise.then(data => query_1.QueryVaultParamsResponse.decode(new _m0.Reader(data)));
    }
    megavaultWithdrawalInfo(request) {
        const data = query_1.QueryMegavaultWithdrawalInfoRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.vault.Query", "MegavaultWithdrawalInfo", data);
        return promise.then(data => query_1.QueryMegavaultWithdrawalInfoResponse.decode(new _m0.Reader(data)));
    }
}
exports.QueryClientImpl = QueryClientImpl;
const createRpcQueryExtension = (base) => {
    const rpc = (0, stargate_1.createProtobufRpcClient)(base);
    const queryService = new QueryClientImpl(rpc);
    return {
        params(request) {
            return queryService.params(request);
        },
        vault(request) {
            return queryService.vault(request);
        },
        allVaults(request) {
            return queryService.allVaults(request);
        },
        megavaultTotalShares(request) {
            return queryService.megavaultTotalShares(request);
        },
        megavaultOwnerShares(request) {
            return queryService.megavaultOwnerShares(request);
        },
        megavaultAllOwnerShares(request) {
            return queryService.megavaultAllOwnerShares(request);
        },
        vaultParams(request) {
            return queryService.vaultParams(request);
        },
        megavaultWithdrawalInfo(request) {
            return queryService.megavaultWithdrawalInfo(request);
        }
    };
};
exports.createRpcQueryExtension = createRpcQueryExtension;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnkucnBjLlF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BkeWR4cHJvdG9jb2wvdjQtcHJvdG8vc3JjL2NvZGVnZW4vZHlkeHByb3RvY29sL3ZhdWx0L3F1ZXJ5LnJwYy5RdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHdEQUEwQztBQUMxQywrQ0FBd0U7QUFDeEUsbUNBQTJlO0FBNEIzZSxNQUFhLGVBQWU7SUFHMUIsWUFBWSxHQUFRO1FBQ2xCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsTUFBTSxDQUFDLFVBQThCLEVBQUU7UUFDckMsTUFBTSxJQUFJLEdBQUcsMEJBQWtCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQywyQkFBbUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQTBCO1FBQzlCLE1BQU0sSUFBSSxHQUFHLHlCQUFpQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN4RCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUUsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsMEJBQWtCLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVELFNBQVMsQ0FBQyxVQUFpQztRQUN6QyxVQUFVLEVBQUUsU0FBUztLQUN0QjtRQUNDLE1BQU0sSUFBSSxHQUFHLDZCQUFxQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM1RCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEYsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsOEJBQXNCLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVELG9CQUFvQixDQUFDLFVBQTRDLEVBQUU7UUFDakUsTUFBTSxJQUFJLEdBQUcsd0NBQWdDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLHNCQUFzQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNGLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHlDQUFpQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxPQUF5QztRQUM1RCxNQUFNLElBQUksR0FBRyx3Q0FBZ0MsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0YsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMseUNBQWlDLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUVELHVCQUF1QixDQUFDLFVBQStDO1FBQ3JFLFVBQVUsRUFBRSxTQUFTO0tBQ3RCO1FBQ0MsTUFBTSxJQUFJLEdBQUcsMkNBQW1DLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLHlCQUF5QixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlGLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLDRDQUFvQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBZ0M7UUFDMUMsTUFBTSxJQUFJLEdBQUcsK0JBQXVCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzlELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQ0FBd0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQsdUJBQXVCLENBQUMsT0FBNEM7UUFDbEUsTUFBTSxJQUFJLEdBQUcsMkNBQW1DLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLHlCQUF5QixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlGLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLDRDQUFvQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7Q0FFRjtBQW5FRCwwQ0FtRUM7QUFDTSxNQUFNLHVCQUF1QixHQUFHLENBQUMsSUFBaUIsRUFBRSxFQUFFO0lBQzNELE1BQU0sR0FBRyxHQUFHLElBQUEsa0NBQXVCLEVBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUMsT0FBTztRQUNMLE1BQU0sQ0FBQyxPQUE0QjtZQUNqQyxPQUFPLFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELEtBQUssQ0FBQyxPQUEwQjtZQUM5QixPQUFPLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELFNBQVMsQ0FBQyxPQUErQjtZQUN2QyxPQUFPLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELG9CQUFvQixDQUFDLE9BQTBDO1lBQzdELE9BQU8sWUFBWSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxPQUF5QztZQUM1RCxPQUFPLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQsdUJBQXVCLENBQUMsT0FBNkM7WUFDbkUsT0FBTyxZQUFZLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELFdBQVcsQ0FBQyxPQUFnQztZQUMxQyxPQUFPLFlBQVksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELHVCQUF1QixDQUFDLE9BQTRDO1lBQ2xFLE9BQU8sWUFBWSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZELENBQUM7S0FFRixDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBckNXLFFBQUEsdUJBQXVCLDJCQXFDbEMifQ==