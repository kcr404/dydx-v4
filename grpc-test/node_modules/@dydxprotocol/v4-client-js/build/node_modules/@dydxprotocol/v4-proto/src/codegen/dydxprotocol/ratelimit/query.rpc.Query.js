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
        this.listLimitParams = this.listLimitParams.bind(this);
        this.capacityByDenom = this.capacityByDenom.bind(this);
        this.allPendingSendPackets = this.allPendingSendPackets.bind(this);
    }
    listLimitParams(request = {}) {
        const data = query_1.ListLimitParamsRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.ratelimit.Query", "ListLimitParams", data);
        return promise.then(data => query_1.ListLimitParamsResponse.decode(new _m0.Reader(data)));
    }
    capacityByDenom(request) {
        const data = query_1.QueryCapacityByDenomRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.ratelimit.Query", "CapacityByDenom", data);
        return promise.then(data => query_1.QueryCapacityByDenomResponse.decode(new _m0.Reader(data)));
    }
    allPendingSendPackets(request = {}) {
        const data = query_1.QueryAllPendingSendPacketsRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.ratelimit.Query", "AllPendingSendPackets", data);
        return promise.then(data => query_1.QueryAllPendingSendPacketsResponse.decode(new _m0.Reader(data)));
    }
}
exports.QueryClientImpl = QueryClientImpl;
const createRpcQueryExtension = (base) => {
    const rpc = (0, stargate_1.createProtobufRpcClient)(base);
    const queryService = new QueryClientImpl(rpc);
    return {
        listLimitParams(request) {
            return queryService.listLimitParams(request);
        },
        capacityByDenom(request) {
            return queryService.capacityByDenom(request);
        },
        allPendingSendPackets(request) {
            return queryService.allPendingSendPackets(request);
        }
    };
};
exports.createRpcQueryExtension = createRpcQueryExtension;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnkucnBjLlF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BkeWR4cHJvdG9jb2wvdjQtcHJvdG8vc3JjL2NvZGVnZW4vZHlkeHByb3RvY29sL3JhdGVsaW1pdC9xdWVyeS5ycGMuUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSx3REFBMEM7QUFDMUMsK0NBQXdFO0FBQ3hFLG1DQUE0TTtBQWE1TSxNQUFhLGVBQWU7SUFHMUIsWUFBWSxHQUFRO1FBQ2xCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRCxlQUFlLENBQUMsVUFBa0MsRUFBRTtRQUNsRCxNQUFNLElBQUksR0FBRyw4QkFBc0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDN0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsOEJBQThCLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUYsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsK0JBQXVCLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVELGVBQWUsQ0FBQyxPQUFvQztRQUNsRCxNQUFNLElBQUksR0FBRyxtQ0FBMkIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsOEJBQThCLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUYsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsb0NBQTRCLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekYsQ0FBQztJQUVELHFCQUFxQixDQUFDLFVBQTZDLEVBQUU7UUFDbkUsTUFBTSxJQUFJLEdBQUcseUNBQWlDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3hFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDhCQUE4QixFQUFFLHVCQUF1QixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hHLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLDBDQUFrQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9GLENBQUM7Q0FFRjtBQTVCRCwwQ0E0QkM7QUFDTSxNQUFNLHVCQUF1QixHQUFHLENBQUMsSUFBaUIsRUFBRSxFQUFFO0lBQzNELE1BQU0sR0FBRyxHQUFHLElBQUEsa0NBQXVCLEVBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUMsT0FBTztRQUNMLGVBQWUsQ0FBQyxPQUFnQztZQUM5QyxPQUFPLFlBQVksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVELGVBQWUsQ0FBQyxPQUFvQztZQUNsRCxPQUFPLFlBQVksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVELHFCQUFxQixDQUFDLE9BQTJDO1lBQy9ELE9BQU8sWUFBWSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELENBQUM7S0FFRixDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBakJXLFFBQUEsdUJBQXVCLDJCQWlCbEMifQ==