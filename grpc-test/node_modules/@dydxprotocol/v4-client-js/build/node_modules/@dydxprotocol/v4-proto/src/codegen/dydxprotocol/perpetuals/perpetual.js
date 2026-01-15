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
exports.LiquidityTier = exports.PremiumStore = exports.MarketPremiums = exports.PerpetualParams = exports.Perpetual = exports.perpetualMarketTypeToJSON = exports.perpetualMarketTypeFromJSON = exports.PerpetualMarketTypeSDKType = exports.PerpetualMarketType = void 0;
const _m0 = __importStar(require("protobufjs/minimal"));
const helpers_1 = require("../../helpers");
var PerpetualMarketType;
(function (PerpetualMarketType) {
    /** PERPETUAL_MARKET_TYPE_UNSPECIFIED - Unspecified market type. */
    PerpetualMarketType[PerpetualMarketType["PERPETUAL_MARKET_TYPE_UNSPECIFIED"] = 0] = "PERPETUAL_MARKET_TYPE_UNSPECIFIED";
    /** PERPETUAL_MARKET_TYPE_CROSS - Market type for cross margin perpetual markets. */
    PerpetualMarketType[PerpetualMarketType["PERPETUAL_MARKET_TYPE_CROSS"] = 1] = "PERPETUAL_MARKET_TYPE_CROSS";
    /** PERPETUAL_MARKET_TYPE_ISOLATED - Market type for isolated margin perpetual markets. */
    PerpetualMarketType[PerpetualMarketType["PERPETUAL_MARKET_TYPE_ISOLATED"] = 2] = "PERPETUAL_MARKET_TYPE_ISOLATED";
    PerpetualMarketType[PerpetualMarketType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(PerpetualMarketType = exports.PerpetualMarketType || (exports.PerpetualMarketType = {}));
exports.PerpetualMarketTypeSDKType = PerpetualMarketType;
function perpetualMarketTypeFromJSON(object) {
    switch (object) {
        case 0:
        case "PERPETUAL_MARKET_TYPE_UNSPECIFIED":
            return PerpetualMarketType.PERPETUAL_MARKET_TYPE_UNSPECIFIED;
        case 1:
        case "PERPETUAL_MARKET_TYPE_CROSS":
            return PerpetualMarketType.PERPETUAL_MARKET_TYPE_CROSS;
        case 2:
        case "PERPETUAL_MARKET_TYPE_ISOLATED":
            return PerpetualMarketType.PERPETUAL_MARKET_TYPE_ISOLATED;
        case -1:
        case "UNRECOGNIZED":
        default:
            return PerpetualMarketType.UNRECOGNIZED;
    }
}
exports.perpetualMarketTypeFromJSON = perpetualMarketTypeFromJSON;
function perpetualMarketTypeToJSON(object) {
    switch (object) {
        case PerpetualMarketType.PERPETUAL_MARKET_TYPE_UNSPECIFIED:
            return "PERPETUAL_MARKET_TYPE_UNSPECIFIED";
        case PerpetualMarketType.PERPETUAL_MARKET_TYPE_CROSS:
            return "PERPETUAL_MARKET_TYPE_CROSS";
        case PerpetualMarketType.PERPETUAL_MARKET_TYPE_ISOLATED:
            return "PERPETUAL_MARKET_TYPE_ISOLATED";
        case PerpetualMarketType.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.perpetualMarketTypeToJSON = perpetualMarketTypeToJSON;
function createBasePerpetual() {
    return {
        params: undefined,
        fundingIndex: new Uint8Array(),
        openInterest: new Uint8Array()
    };
}
exports.Perpetual = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.params !== undefined) {
            exports.PerpetualParams.encode(message.params, writer.uint32(10).fork()).ldelim();
        }
        if (message.fundingIndex.length !== 0) {
            writer.uint32(18).bytes(message.fundingIndex);
        }
        if (message.openInterest.length !== 0) {
            writer.uint32(26).bytes(message.openInterest);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePerpetual();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.params = exports.PerpetualParams.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.fundingIndex = reader.bytes();
                    break;
                case 3:
                    message.openInterest = reader.bytes();
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
        const message = createBasePerpetual();
        message.params = object.params !== undefined && object.params !== null ? exports.PerpetualParams.fromPartial(object.params) : undefined;
        message.fundingIndex = (_a = object.fundingIndex) !== null && _a !== void 0 ? _a : new Uint8Array();
        message.openInterest = (_b = object.openInterest) !== null && _b !== void 0 ? _b : new Uint8Array();
        return message;
    }
};
function createBasePerpetualParams() {
    return {
        id: 0,
        ticker: "",
        marketId: 0,
        atomicResolution: 0,
        defaultFundingPpm: 0,
        liquidityTier: 0,
        marketType: 0
    };
}
exports.PerpetualParams = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.id !== 0) {
            writer.uint32(8).uint32(message.id);
        }
        if (message.ticker !== "") {
            writer.uint32(18).string(message.ticker);
        }
        if (message.marketId !== 0) {
            writer.uint32(24).uint32(message.marketId);
        }
        if (message.atomicResolution !== 0) {
            writer.uint32(32).sint32(message.atomicResolution);
        }
        if (message.defaultFundingPpm !== 0) {
            writer.uint32(40).sint32(message.defaultFundingPpm);
        }
        if (message.liquidityTier !== 0) {
            writer.uint32(48).uint32(message.liquidityTier);
        }
        if (message.marketType !== 0) {
            writer.uint32(56).int32(message.marketType);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePerpetualParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint32();
                    break;
                case 2:
                    message.ticker = reader.string();
                    break;
                case 3:
                    message.marketId = reader.uint32();
                    break;
                case 4:
                    message.atomicResolution = reader.sint32();
                    break;
                case 5:
                    message.defaultFundingPpm = reader.sint32();
                    break;
                case 6:
                    message.liquidityTier = reader.uint32();
                    break;
                case 7:
                    message.marketType = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        var _a, _b, _c, _d, _e, _f, _g;
        const message = createBasePerpetualParams();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : 0;
        message.ticker = (_b = object.ticker) !== null && _b !== void 0 ? _b : "";
        message.marketId = (_c = object.marketId) !== null && _c !== void 0 ? _c : 0;
        message.atomicResolution = (_d = object.atomicResolution) !== null && _d !== void 0 ? _d : 0;
        message.defaultFundingPpm = (_e = object.defaultFundingPpm) !== null && _e !== void 0 ? _e : 0;
        message.liquidityTier = (_f = object.liquidityTier) !== null && _f !== void 0 ? _f : 0;
        message.marketType = (_g = object.marketType) !== null && _g !== void 0 ? _g : 0;
        return message;
    }
};
function createBaseMarketPremiums() {
    return {
        perpetualId: 0,
        premiums: []
    };
}
exports.MarketPremiums = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.perpetualId !== 0) {
            writer.uint32(8).uint32(message.perpetualId);
        }
        writer.uint32(18).fork();
        for (const v of message.premiums) {
            writer.sint32(v);
        }
        writer.ldelim();
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMarketPremiums();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.perpetualId = reader.uint32();
                    break;
                case 2:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.premiums.push(reader.sint32());
                        }
                    }
                    else {
                        message.premiums.push(reader.sint32());
                    }
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
        const message = createBaseMarketPremiums();
        message.perpetualId = (_a = object.perpetualId) !== null && _a !== void 0 ? _a : 0;
        message.premiums = ((_b = object.premiums) === null || _b === void 0 ? void 0 : _b.map(e => e)) || [];
        return message;
    }
};
function createBasePremiumStore() {
    return {
        allMarketPremiums: [],
        numPremiums: 0
    };
}
exports.PremiumStore = {
    encode(message, writer = _m0.Writer.create()) {
        for (const v of message.allMarketPremiums) {
            exports.MarketPremiums.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.numPremiums !== 0) {
            writer.uint32(16).uint32(message.numPremiums);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePremiumStore();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.allMarketPremiums.push(exports.MarketPremiums.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.numPremiums = reader.uint32();
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
        const message = createBasePremiumStore();
        message.allMarketPremiums = ((_a = object.allMarketPremiums) === null || _a === void 0 ? void 0 : _a.map(e => exports.MarketPremiums.fromPartial(e))) || [];
        message.numPremiums = (_b = object.numPremiums) !== null && _b !== void 0 ? _b : 0;
        return message;
    }
};
function createBaseLiquidityTier() {
    return {
        id: 0,
        name: "",
        initialMarginPpm: 0,
        maintenanceFractionPpm: 0,
        basePositionNotional: helpers_1.Long.UZERO,
        impactNotional: helpers_1.Long.UZERO,
        openInterestLowerCap: helpers_1.Long.UZERO,
        openInterestUpperCap: helpers_1.Long.UZERO
    };
}
exports.LiquidityTier = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.id !== 0) {
            writer.uint32(8).uint32(message.id);
        }
        if (message.name !== "") {
            writer.uint32(18).string(message.name);
        }
        if (message.initialMarginPpm !== 0) {
            writer.uint32(24).uint32(message.initialMarginPpm);
        }
        if (message.maintenanceFractionPpm !== 0) {
            writer.uint32(32).uint32(message.maintenanceFractionPpm);
        }
        if (!message.basePositionNotional.isZero()) {
            writer.uint32(40).uint64(message.basePositionNotional);
        }
        if (!message.impactNotional.isZero()) {
            writer.uint32(48).uint64(message.impactNotional);
        }
        if (!message.openInterestLowerCap.isZero()) {
            writer.uint32(56).uint64(message.openInterestLowerCap);
        }
        if (!message.openInterestUpperCap.isZero()) {
            writer.uint32(64).uint64(message.openInterestUpperCap);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseLiquidityTier();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint32();
                    break;
                case 2:
                    message.name = reader.string();
                    break;
                case 3:
                    message.initialMarginPpm = reader.uint32();
                    break;
                case 4:
                    message.maintenanceFractionPpm = reader.uint32();
                    break;
                case 5:
                    message.basePositionNotional = reader.uint64();
                    break;
                case 6:
                    message.impactNotional = reader.uint64();
                    break;
                case 7:
                    message.openInterestLowerCap = reader.uint64();
                    break;
                case 8:
                    message.openInterestUpperCap = reader.uint64();
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
        const message = createBaseLiquidityTier();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : 0;
        message.name = (_b = object.name) !== null && _b !== void 0 ? _b : "";
        message.initialMarginPpm = (_c = object.initialMarginPpm) !== null && _c !== void 0 ? _c : 0;
        message.maintenanceFractionPpm = (_d = object.maintenanceFractionPpm) !== null && _d !== void 0 ? _d : 0;
        message.basePositionNotional = object.basePositionNotional !== undefined && object.basePositionNotional !== null ? helpers_1.Long.fromValue(object.basePositionNotional) : helpers_1.Long.UZERO;
        message.impactNotional = object.impactNotional !== undefined && object.impactNotional !== null ? helpers_1.Long.fromValue(object.impactNotional) : helpers_1.Long.UZERO;
        message.openInterestLowerCap = object.openInterestLowerCap !== undefined && object.openInterestLowerCap !== null ? helpers_1.Long.fromValue(object.openInterestLowerCap) : helpers_1.Long.UZERO;
        message.openInterestUpperCap = object.openInterestUpperCap !== undefined && object.openInterestUpperCap !== null ? helpers_1.Long.fromValue(object.openInterestUpperCap) : helpers_1.Long.UZERO;
        return message;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVycGV0dWFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BkeWR4cHJvdG9jb2wvdjQtcHJvdG8vc3JjL2NvZGVnZW4vZHlkeHByb3RvY29sL3BlcnBldHVhbHMvcGVycGV0dWFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsd0RBQTBDO0FBQzFDLDJDQUFrRDtBQUNsRCxJQUFZLG1CQVVYO0FBVkQsV0FBWSxtQkFBbUI7SUFDN0IsbUVBQW1FO0lBQ25FLHVIQUFxQyxDQUFBO0lBRXJDLG9GQUFvRjtJQUNwRiwyR0FBK0IsQ0FBQTtJQUUvQiwwRkFBMEY7SUFDMUYsaUhBQWtDLENBQUE7SUFDbEMsOEVBQWlCLENBQUE7QUFDbkIsQ0FBQyxFQVZXLG1CQUFtQixHQUFuQiwyQkFBbUIsS0FBbkIsMkJBQW1CLFFBVTlCO0FBQ1ksUUFBQSwwQkFBMEIsR0FBRyxtQkFBbUIsQ0FBQztBQUM5RCxTQUFnQiwyQkFBMkIsQ0FBQyxNQUFXO0lBQ3JELFFBQVEsTUFBTSxFQUFFO1FBQ2QsS0FBSyxDQUFDLENBQUM7UUFDUCxLQUFLLG1DQUFtQztZQUN0QyxPQUFPLG1CQUFtQixDQUFDLGlDQUFpQyxDQUFDO1FBRS9ELEtBQUssQ0FBQyxDQUFDO1FBQ1AsS0FBSyw2QkFBNkI7WUFDaEMsT0FBTyxtQkFBbUIsQ0FBQywyQkFBMkIsQ0FBQztRQUV6RCxLQUFLLENBQUMsQ0FBQztRQUNQLEtBQUssZ0NBQWdDO1lBQ25DLE9BQU8sbUJBQW1CLENBQUMsOEJBQThCLENBQUM7UUFFNUQsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNSLEtBQUssY0FBYyxDQUFDO1FBQ3BCO1lBQ0UsT0FBTyxtQkFBbUIsQ0FBQyxZQUFZLENBQUM7S0FDM0M7QUFDSCxDQUFDO0FBbkJELGtFQW1CQztBQUNELFNBQWdCLHlCQUF5QixDQUFDLE1BQTJCO0lBQ25FLFFB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