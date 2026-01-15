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
exports.VaultId = exports.vaultStatusToJSON = exports.vaultStatusFromJSON = exports.VaultStatusSDKType = exports.VaultStatus = exports.vaultTypeToJSON = exports.vaultTypeFromJSON = exports.VaultTypeSDKType = exports.VaultType = void 0;
const _m0 = __importStar(require("protobufjs/minimal"));
/** VaultType represents different types of vaults. */
var VaultType;
(function (VaultType) {
    /** VAULT_TYPE_UNSPECIFIED - Default value, invalid and unused. */
    VaultType[VaultType["VAULT_TYPE_UNSPECIFIED"] = 0] = "VAULT_TYPE_UNSPECIFIED";
    /** VAULT_TYPE_CLOB - Vault is associated with a CLOB pair. */
    VaultType[VaultType["VAULT_TYPE_CLOB"] = 1] = "VAULT_TYPE_CLOB";
    VaultType[VaultType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(VaultType = exports.VaultType || (exports.VaultType = {}));
exports.VaultTypeSDKType = VaultType;
function vaultTypeFromJSON(object) {
    switch (object) {
        case 0:
        case "VAULT_TYPE_UNSPECIFIED":
            return VaultType.VAULT_TYPE_UNSPECIFIED;
        case 1:
        case "VAULT_TYPE_CLOB":
            return VaultType.VAULT_TYPE_CLOB;
        case -1:
        case "UNRECOGNIZED":
        default:
            return VaultType.UNRECOGNIZED;
    }
}
exports.vaultTypeFromJSON = vaultTypeFromJSON;
function vaultTypeToJSON(object) {
    switch (object) {
        case VaultType.VAULT_TYPE_UNSPECIFIED:
            return "VAULT_TYPE_UNSPECIFIED";
        case VaultType.VAULT_TYPE_CLOB:
            return "VAULT_TYPE_CLOB";
        case VaultType.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.vaultTypeToJSON = vaultTypeToJSON;
/** VaultStatus represents the status of a vault. */
var VaultStatus;
(function (VaultStatus) {
    /** VAULT_STATUS_UNSPECIFIED - Default value, invalid and unused. */
    VaultStatus[VaultStatus["VAULT_STATUS_UNSPECIFIED"] = 0] = "VAULT_STATUS_UNSPECIFIED";
    /**
     * VAULT_STATUS_DEACTIVATED - Don’t place orders. Does not count toward global vault balances.
     * A vault can only be set to this status if its equity is non-positive.
     */
    VaultStatus[VaultStatus["VAULT_STATUS_DEACTIVATED"] = 1] = "VAULT_STATUS_DEACTIVATED";
    /** VAULT_STATUS_STAND_BY - Don’t place orders. Does count towards global vault balances. */
    VaultStatus[VaultStatus["VAULT_STATUS_STAND_BY"] = 2] = "VAULT_STATUS_STAND_BY";
    /** VAULT_STATUS_QUOTING - Places orders on both sides of the book. */
    VaultStatus[VaultStatus["VAULT_STATUS_QUOTING"] = 3] = "VAULT_STATUS_QUOTING";
    /** VAULT_STATUS_CLOSE_ONLY - Only place orders that close the position. */
    VaultStatus[VaultStatus["VAULT_STATUS_CLOSE_ONLY"] = 4] = "VAULT_STATUS_CLOSE_ONLY";
    VaultStatus[VaultStatus["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(VaultStatus = exports.VaultStatus || (exports.VaultStatus = {}));
exports.VaultStatusSDKType = VaultStatus;
function vaultStatusFromJSON(object) {
    switch (object) {
        case 0:
        case "VAULT_STATUS_UNSPECIFIED":
            return VaultStatus.VAULT_STATUS_UNSPECIFIED;
        case 1:
        case "VAULT_STATUS_DEACTIVATED":
            return VaultStatus.VAULT_STATUS_DEACTIVATED;
        case 2:
        case "VAULT_STATUS_STAND_BY":
            return VaultStatus.VAULT_STATUS_STAND_BY;
        case 3:
        case "VAULT_STATUS_QUOTING":
            return VaultStatus.VAULT_STATUS_QUOTING;
        case 4:
        case "VAULT_STATUS_CLOSE_ONLY":
            return VaultStatus.VAULT_STATUS_CLOSE_ONLY;
        case -1:
        case "UNRECOGNIZED":
        default:
            return VaultStatus.UNRECOGNIZED;
    }
}
exports.vaultStatusFromJSON = vaultStatusFromJSON;
function vaultStatusToJSON(object) {
    switch (object) {
        case VaultStatus.VAULT_STATUS_UNSPECIFIED:
            return "VAULT_STATUS_UNSPECIFIED";
        case VaultStatus.VAULT_STATUS_DEACTIVATED:
            return "VAULT_STATUS_DEACTIVATED";
        case VaultStatus.VAULT_STATUS_STAND_BY:
            return "VAULT_STATUS_STAND_BY";
        case VaultStatus.VAULT_STATUS_QUOTING:
            return "VAULT_STATUS_QUOTING";
        case VaultStatus.VAULT_STATUS_CLOSE_ONLY:
            return "VAULT_STATUS_CLOSE_ONLY";
        case VaultStatus.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.vaultStatusToJSON = vaultStatusToJSON;
function createBaseVaultId() {
    return {
        type: 0,
        number: 0
    };
}
exports.VaultId = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.type !== 0) {
            writer.uint32(8).int32(message.type);
        }
        if (message.number !== 0) {
            writer.uint32(16).uint32(message.number);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseVaultId();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.type = reader.int32();
                    break;
                case 2:
                    message.number = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseVaultId();
        message.type = (_a = object.type) !== null && _a !== void 0 ? _a : 0;
        message.number = (_b = object.number) !== null && _b !== void 0 ? _b : 0;
        return message;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQGR5ZHhwcm90b2NvbC92NC1wcm90by9zcmMvY29kZWdlbi9keWR4cHJvdG9jb2wvdmF1bHQvdmF1bHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3REFBMEM7QUFFMUMsc0RBQXNEO0FBRXRELElBQVksU0FPWDtBQVBELFdBQVksU0FBUztJQUNuQixrRUFBa0U7SUFDbEUsNkVBQTBCLENBQUE7SUFFMUIsOERBQThEO0lBQzlELCtEQUFtQixDQUFBO0lBQ25CLDBEQUFpQixDQUFBO0FBQ25CLENBQUMsRUFQVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQU9wQjtBQUNZLFFBQUEsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO0FBQzFDLFNBQWdCLGlCQUFpQixDQUFDLE1BQVc7SUFDM0MsUUFBUSxNQUFNLEVBQUU7UUFDZCxLQUFLLENBQUMsQ0FBQztRQUNQLEtBQUssd0JBQXdCO1lBQzNCLE9BQU8sU0FBUyxDQUFDLHNCQUFzQixDQUFDO1FBRTFDLEtBQUssQ0FBQyxDQUFDO1FBQ1AsS0FBSyxpQkFBaUI7WUFDcEIsT0FBTyxTQUFTLENBQUMsZUFBZSxDQUFDO1FBRW5DLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDUixLQUFLLGNBQWMsQ0FBQztRQUNwQjtZQUNFLE9BQU8sU0FBUyxDQUFDLFlBQVksQ0FBQztLQUNqQztBQUNILENBQUM7QUFmRCw4Q0FlQztBQUNELFNBQWdCLGVBQWUsQ0FBQyxNQUFpQjtJQUMvQyxRQUFRLE1BQU0sRUFBRTtRQUNkLEtBQUssU0FBUyxDQUFDLHNCQUFzQjtZQUNuQyxPQUFPLHdCQUF3QixDQUFDO1FBRWxDLEtBQUssU0FBUyxDQUFDLGVBQWU7WUFDNUIsT0FBTyxpQkFBaUIsQ0FBQztRQUUzQixLQUFLLFNBQVMsQ0FBQyxZQUFZLENB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