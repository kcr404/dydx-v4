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
exports.ListingVaultDepositParams = void 0;
const _m0 = __importStar(require("protobufjs/minimal"));
function createBaseListingVaultDepositParams() {
    return {
        newVaultDepositAmount: new Uint8Array(),
        mainVaultDepositAmount: new Uint8Array(),
        numBlocksToLockShares: 0
    };
}
exports.ListingVaultDepositParams = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.newVaultDepositAmount.length !== 0) {
            writer.uint32(10).bytes(message.newVaultDepositAmount);
        }
        if (message.mainVaultDepositAmount.length !== 0) {
            writer.uint32(18).bytes(message.mainVaultDepositAmount);
        }
        if (message.numBlocksToLockShares !== 0) {
            writer.uint32(24).uint32(message.numBlocksToLockShares);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseListingVaultDepositParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.newVaultDepositAmount = reader.bytes();
                    break;
                case 2:
                    message.mainVaultDepositAmount = reader.bytes();
                    break;
                case 3:
                    message.numBlocksToLockShares = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        var _a, _b, _c;
        const message = createBaseListingVaultDepositParams();
        message.newVaultDepositAmount = (_a = object.newVaultDepositAmount) !== null && _a !== void 0 ? _a : new Uint8Array();
        message.mainVaultDepositAmount = (_b = object.mainVaultDepositAmount) !== null && _b !== void 0 ? _b : new Uint8Array();
        message.numBlocksToLockShares = (_c = object.numBlocksToLockShares) !== null && _c !== void 0 ? _c : 0;
        return message;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BkeWR4cHJvdG9jb2wvdjQtcHJvdG8vc3JjL2NvZGVnZW4vZHlkeHByb3RvY29sL2xpc3RpbmcvcGFyYW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsd0RBQTBDO0FBeUIxQyxTQUFTLG1DQUFtQztJQUMxQyxPQUFPO1FBQ0wscUJBQXFCLEVBQUUsSUFBSSxVQUFVLEVBQUU7UUFDdkMsc0JBQXNCLEVBQUUsSUFBSSxVQUFVLEVBQUU7UUFDeEMscUJBQXFCLEVBQUUsQ0FBQztLQUN6QixDQUFDO0FBQ0osQ0FBQztBQUVZLFFBQUEseUJBQXlCLEdBQUc7SUFDdkMsTUFBTSxDQUFDLE9BQWtDLEVBQUUsU0FBcUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDakYsSUFBSSxPQUFPLENBQUMscUJBQXFCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM5QyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztTQUN4RDtRQUVELElBQUksT0FBTyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDL0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7U0FDekQ7UUFFRCxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsS0FBSyxDQUFDLEVBQUU7WUFDdkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7U0FDekQ7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQThCLEVBQUUsTUFBZTtRQUNwRCxNQUFNLE1BQU0sR0FBRyxLQUFLLFlBQVksR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0UsSUFBSSxHQUFHLEdBQUcsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFDbEUsTUFBTSxPQUFPLEdBQUcsbUNBQW1DLEVBQUUsQ0FBQztRQUV0RCxPQUFPLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFO1lBQ3ZCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUU1QixRQUFRLEdBQUcsS0FBSyxDQUFDLEVBQUU7Z0JBQ2pCLEtBQUssQ0FBQztvQkFDSixPQUFPLENBQUMscUJBQXFCLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUMvQyxNQUFNO2dCQUVSLEtBQUssQ0FBQztvQkFDSixPQUFPLENBQUMsc0JBQXNCLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNoRCxNQUFNO2dCQUVSLEtBQUssQ0FBQztvQkFDSixPQUFPLENBQUMscUJBQXFCLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNoRCxNQUFNO2dCQUVSO29CQUNFLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUN6QixNQUFNO2FBQ1Q7U0FDRjtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxXQUFXLENBQUMsTUFBOEM7O1FBQ3hELE1BQU0sT0FBTyxHQUFHLG1DQUFtQyxFQUFFLENBQUM7UUFDdEQsT0FBTyxDQUFDLHFCQUFxQixHQUFHLE1BQUEsTUFBTSxDQUFDLHFCQUFxQixtQ0FBSSxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQ2pGLE9BQU8sQ0FBQyxzQkFBc0IsR0FBRyxNQUFBLE1BQU0sQ0FBQyxzQkFBc0IsbUNBQUksSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNuRixPQUFPLENBQUMscUJBQXFCLEdBQUcsTUFBQSxNQUFNLENBQUMscUJBQXFCLG1DQUFJLENBQUMsQ0FBQztRQUNsRSxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0NBRUYsQ0FBQyJ9