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
exports.LiquidateSubaccountsResponse = exports.LiquidateSubaccountsRequest = void 0;
const subaccount_1 = require("../../subaccounts/subaccount");
const liquidations_1 = require("../../clob/liquidations");
const _m0 = __importStar(require("protobufjs/minimal"));
function createBaseLiquidateSubaccountsRequest() {
    return {
        blockHeight: 0,
        liquidatableSubaccountIds: [],
        negativeTncSubaccountIds: [],
        subaccountOpenPositionInfo: []
    };
}
exports.LiquidateSubaccountsRequest = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.blockHeight !== 0) {
            writer.uint32(8).uint32(message.blockHeight);
        }
        for (const v of message.liquidatableSubaccountIds) {
            subaccount_1.SubaccountId.encode(v, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.negativeTncSubaccountIds) {
            subaccount_1.SubaccountId.encode(v, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.subaccountOpenPositionInfo) {
            liquidations_1.SubaccountOpenPositionInfo.encode(v, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseLiquidateSubaccountsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.blockHeight = reader.uint32();
                    break;
                case 2:
                    message.liquidatableSubaccountIds.push(subaccount_1.SubaccountId.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.negativeTncSubaccountIds.push(subaccount_1.SubaccountId.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.subaccountOpenPositionInfo.push(liquidations_1.SubaccountOpenPositionInfo.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        var _a, _b, _c, _d;
        const message = createBaseLiquidateSubaccountsRequest();
        message.blockHeight = (_a = object.blockHeight) !== null && _a !== void 0 ? _a : 0;
        message.liquidatableSubaccountIds = ((_b = object.liquidatableSubaccountIds) === null || _b === void 0 ? void 0 : _b.map(e => subaccount_1.SubaccountId.fromPartial(e))) || [];
        message.negativeTncSubaccountIds = ((_c = object.negativeTncSubaccountIds) === null || _c === void 0 ? void 0 : _c.map(e => subaccount_1.SubaccountId.fromPartial(e))) || [];
        message.subaccountOpenPositionInfo = ((_d = object.subaccountOpenPositionInfo) === null || _d === void 0 ? void 0 : _d.map(e => liquidations_1.SubaccountOpenPositionInfo.fromPartial(e))) || [];
        return message;
    }
};
function createBaseLiquidateSubaccountsResponse() {
    return {};
}
exports.LiquidateSubaccountsResponse = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseLiquidateSubaccountsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(_) {
        const message = createBaseLiquidateSubaccountsResponse();
        return message;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlxdWlkYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQGR5ZHhwcm90b2NvbC92NC1wcm90by9zcmMvY29kZWdlbi9keWR4cHJvdG9jb2wvZGFlbW9ucy9saXF1aWRhdGlvbi9saXF1aWRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZEQUFpRjtBQUNqRiwwREFBd0c7QUFDeEcsd0RBQTBDO0FBOEMxQyxTQUFTLHFDQUFxQztJQUM1QyxPQUFPO1FBQ0wsV0FBVyxFQUFFLENBQUM7UUFDZCx5QkFBeUIsRUFBRSxFQUFFO1FBQzdCLHdCQUF3QixFQUFFLEVBQUU7UUFDNUIsMEJBQTBCLEVBQUUsRUFBRTtLQUMvQixDQUFDO0FBQ0osQ0FBQztBQUVZLFFBQUEsMkJBQTJCLEdBQUc7SUFDekMsTUFBTSxDQUFDLE9BQW9DLEVBQUUsU0FBcUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDbkYsSUFBSSxPQUFPLENBQUMsV0FBVyxLQUFLLENBQUMsRUFBRTtZQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDOUM7UUFFRCxLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRTtZQUNqRCx5QkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFFLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQzVEO1FBRUQsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsd0JBQXdCLEVBQUU7WUFDaEQseUJBQVksQ0FBQyxNQUFNLENBQUMsQ0FBRSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUM1RDtRQUVELEtBQUssTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLDBCQUEwQixFQUFFO1lBQ2xELHlDQUEwQixDQUFDLE1BQU0sQ0FBQyxDQUFFLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQzFFO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUE4QixFQUFFLE1BQWU7UUFDcEQsTUFBTSxNQUFNLEdBQUcsS0FBSyxZQUFZLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNFLElBQUksR0FBRyxHQUFHLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO1FBQ2xFLE1BQU0sT0FBTyxHQUFHLHFDQUFxQyxFQUFFLENBQUM7UUFFeEQsT0FBTyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRTtZQUN2QixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFNUIsUUFBUSxHQUFHLEtBQUssQ0FBQyxFQUFFO2dCQUNqQixLQUFLLENBQUM7b0JBQ0osT0FBTyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ3RDLE1BQU07Z0JBRVIsS0FBSyxDQUFDO29CQUNKLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMseUJBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3JGLE1BQU07Z0JBRVIsS0FBSyxDQUFDO29CQUNKLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMseUJBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3BGLE1BQU07Z0JBRVIsS0FBSyxDQUFDO29CQUNKLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMseUNBQTBCLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNwRyxNQUFNO2dCQUVSO29CQUNFLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUN6QixNQUFNO2FBQ1Q7U0FDRjtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxXQUFXLENBQUMsTUFBZ0Q7O1FBQzFELE1BQU0sT0FBTyxHQUFHLHFDQUFxQyxFQUFFLENBQUM7UUFDeEQsT0FBTyxDQUFDLFdBQVcsR0FBRyxNQUFBLE1BQU0sQ0FBQyxXQUFXLG1DQUFJLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMseUJBQXlCLEdBQUcsQ0FBQSxNQUFBLE1BQU0sQ0FBQyx5QkFBeUIsMENBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMseUJBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSSxFQUFFLENBQUM7UUFDbEgsT0FBTyxDQUFDLHdCQUF3QixHQUFHLENBQUEsTUFBQSxNQUFNLENBQUMsd0JBQXdCLDBDQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLHlCQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksRUFBRSxDQUFDO1FBQ2hILE9BQU8sQ0FBQywwQkFBMEIsR0FBRyxDQUFBLE1BQUEsTUFBTSxDQUFDLDBCQUEwQiwwQ0FBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyx5Q0FBMEIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSSxFQUFFLENBQUM7UUFDbEksT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztDQUVGLENBQUM7QUFFRixTQUFTLHNDQUFzQztJQUM3QyxPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUM7QUFFWSxRQUFBLDRCQUE0QixHQUFHO0lBQzFDLE1BQU0sQ0FBQyxDQUErQixFQUFFLFNBQXFCLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQzlFLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBOEIsRUFBRSxNQUFlO1FBQ3BELE1BQU0sTUFBTSxHQUFHLEtBQUssWUFBWSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzRSxJQUFJLEdBQUcsR0FBRyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUNsRSxNQUFNLE9BQU8sR0FBRyxzQ0FBc0MsRUFBRSxDQUFDO1FBRXpELE9BQU8sTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUU7WUFDdkIsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRTVCLFFBQVEsR0FBRyxLQUFLLENBQUMsRUFBRTtnQkFDakI7b0JBQ0UsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3pCLE1BQU07YUFDVDtTQUNGO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELFdBQVcsQ0FBQyxDQUE0QztRQUN0RCxNQUFNLE9BQU8sR0FBRyxzQ0FBc0MsRUFBRSxDQUFDO1FBQ3pELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7Q0FFRixDQUFDIn0=