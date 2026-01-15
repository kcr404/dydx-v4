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
        this.affiliateInfo = this.affiliateInfo.bind(this);
        this.referredBy = this.referredBy.bind(this);
        this.allAffiliateTiers = this.allAffiliateTiers.bind(this);
        this.affiliateWhitelist = this.affiliateWhitelist.bind(this);
    }
    affiliateInfo(request) {
        const data = query_1.AffiliateInfoRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.affiliates.Query", "AffiliateInfo", data);
        return promise.then(data => query_1.AffiliateInfoResponse.decode(new _m0.Reader(data)));
    }
    referredBy(request) {
        const data = query_1.ReferredByRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.affiliates.Query", "ReferredBy", data);
        return promise.then(data => query_1.ReferredByResponse.decode(new _m0.Reader(data)));
    }
    allAffiliateTiers(request = {}) {
        const data = query_1.AllAffiliateTiersRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.affiliates.Query", "AllAffiliateTiers", data);
        return promise.then(data => query_1.AllAffiliateTiersResponse.decode(new _m0.Reader(data)));
    }
    affiliateWhitelist(request = {}) {
        const data = query_1.AffiliateWhitelistRequest.encode(request).finish();
        const promise = this.rpc.request("dydxprotocol.affiliates.Query", "AffiliateWhitelist", data);
        return promise.then(data => query_1.AffiliateWhitelistResponse.decode(new _m0.Reader(data)));
    }
}
exports.QueryClientImpl = QueryClientImpl;
const createRpcQueryExtension = (base) => {
    const rpc = (0, stargate_1.createProtobufRpcClient)(base);
    const queryService = new QueryClientImpl(rpc);
    return {
        affiliateInfo(request) {
            return queryService.affiliateInfo(request);
        },
        referredBy(request) {
            return queryService.referredBy(request);
        },
        allAffiliateTiers(request) {
            return queryService.allAffiliateTiers(request);
        },
        affiliateWhitelist(request) {
            return queryService.affiliateWhitelist(request);
        }
    };
};
exports.createRpcQueryExtension = createRpcQueryExtension;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnkucnBjLlF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BkeWR4cHJvdG9jb2wvdjQtcHJvdG8vc3JjL2NvZGVnZW4vZHlkeHByb3RvY29sL2FmZmlsaWF0ZXMvcXVlcnkucnBjLlF1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esd0RBQTBDO0FBQzFDLCtDQUF3RTtBQUN4RSxtQ0FBeU47QUFnQnpOLE1BQWEsZUFBZTtJQUcxQixZQUFZLEdBQVE7UUFDbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELGFBQWEsQ0FBQyxPQUE2QjtRQUN6QyxNQUFNLElBQUksR0FBRyw0QkFBb0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDM0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pGLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLDZCQUFxQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFRCxVQUFVLENBQUMsT0FBMEI7UUFDbkMsTUFBTSxJQUFJLEdBQUcseUJBQWlCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3hELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLCtCQUErQixFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQywwQkFBa0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRUQsaUJBQWlCLENBQUMsVUFBb0MsRUFBRTtRQUN0RCxNQUFNLElBQUksR0FBRyxnQ0FBd0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDL0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0YsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsaUNBQXlCLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUVELGtCQUFrQixDQUFDLFVBQXFDLEVBQUU7UUFDeEQsTUFBTSxJQUFJLEdBQUcsaUNBQXlCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2hFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLCtCQUErQixFQUFFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlGLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGtDQUEwQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7Q0FFRjtBQW5DRCwwQ0FtQ0M7QUFDTSxNQUFNLHVCQUF1QixHQUFHLENBQUMsSUFBaUIsRUFBRSxFQUFFO0lBQzNELE1BQU0sR0FBRyxHQUFHLElBQUEsa0NBQXVCLEVBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUMsT0FBTztRQUNMLGFBQWEsQ0FBQyxPQUE2QjtZQUN6QyxPQUFPLFlBQVksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELFVBQVUsQ0FBQyxPQUEwQjtZQUNuQyxPQUFPLFlBQVksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVELGlCQUFpQixDQUFDLE9BQWtDO1lBQ2xELE9BQU8sWUFBWSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFRCxrQkFBa0IsQ0FBQyxPQUFtQztZQUNwRCxPQUFPLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxDQUFDO0tBRUYsQ0FBQztBQUNKLENBQUMsQ0FBQztBQXJCVyxRQUFBLHVCQUF1QiwyQkFxQmxDIn0=