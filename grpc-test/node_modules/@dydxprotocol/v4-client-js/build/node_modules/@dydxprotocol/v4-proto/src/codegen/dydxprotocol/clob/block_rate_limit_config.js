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
exports.MaxPerNBlocksRateLimit = exports.BlockRateLimitConfiguration = void 0;
const _m0 = __importStar(require("protobufjs/minimal"));
function createBaseBlockRateLimitConfiguration() {
    return {
        maxShortTermOrdersPerNBlocks: [],
        maxStatefulOrdersPerNBlocks: [],
        maxShortTermOrderCancellationsPerNBlocks: [],
        maxShortTermOrdersAndCancelsPerNBlocks: []
    };
}
exports.BlockRateLimitConfiguration = {
    encode(message, writer = _m0.Writer.create()) {
        for (const v of message.maxShortTermOrdersPerNBlocks) {
            exports.MaxPerNBlocksRateLimit.encode(v, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.maxStatefulOrdersPerNBlocks) {
            exports.MaxPerNBlocksRateLimit.encode(v, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.maxShortTermOrderCancellationsPerNBlocks) {
            exports.MaxPerNBlocksRateLimit.encode(v, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.maxShortTermOrdersAndCancelsPerNBlocks) {
            exports.MaxPerNBlocksRateLimit.encode(v, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBlockRateLimitConfiguration();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.maxShortTermOrdersPerNBlocks.push(exports.MaxPerNBlocksRateLimit.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.maxStatefulOrdersPerNBlocks.push(exports.MaxPerNBlocksRateLimit.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.maxShortTermOrderCancellationsPerNBlocks.push(exports.MaxPerNBlocksRateLimit.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.maxShortTermOrdersAndCancelsPerNBlocks.push(exports.MaxPerNBlocksRateLimit.decode(reader, reader.uint32()));
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
        const message = createBaseBlockRateLimitConfiguration();
        message.maxShortTermOrdersPerNBlocks = ((_a = object.maxShortTermOrdersPerNBlocks) === null || _a === void 0 ? void 0 : _a.map(e => exports.MaxPerNBlocksRateLimit.fromPartial(e))) || [];
        message.maxStatefulOrdersPerNBlocks = ((_b = object.maxStatefulOrdersPerNBlocks) === null || _b === void 0 ? void 0 : _b.map(e => exports.MaxPerNBlocksRateLimit.fromPartial(e))) || [];
        message.maxShortTermOrderCancellationsPerNBlocks = ((_c = object.maxShortTermOrderCancellationsPerNBlocks) === null || _c === void 0 ? void 0 : _c.map(e => exports.MaxPerNBlocksRateLimit.fromPartial(e))) || [];
        message.maxShortTermOrdersAndCancelsPerNBlocks = ((_d = object.maxShortTermOrdersAndCancelsPerNBlocks) === null || _d === void 0 ? void 0 : _d.map(e => exports.MaxPerNBlocksRateLimit.fromPartial(e))) || [];
        return message;
    }
};
function createBaseMaxPerNBlocksRateLimit() {
    return {
        numBlocks: 0,
        limit: 0
    };
}
exports.MaxPerNBlocksRateLimit = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.numBlocks !== 0) {
            writer.uint32(8).uint32(message.numBlocks);
        }
        if (message.limit !== 0) {
            writer.uint32(16).uint32(message.limit);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMaxPerNBlocksRateLimit();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.numBlocks = reader.uint32();
                    break;
                case 2:
                    message.limit = reader.uint32();
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
        const message = createBaseMaxPerNBlocksRateLimit();
        message.numBlocks = (_a = object.numBlocks) !== null && _a !== void 0 ? _a : 0;
        message.limit = (_b = object.limit) !== null && _b !== void 0 ? _b : 0;
        return message;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tfcmF0ZV9saW1pdF9jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQGR5ZHhwcm90b2NvbC92NC1wcm90by9zcmMvY29kZWdlbi9keWR4cHJvdG9jb2wvY2xvYi9ibG9ja19yYXRlX2xpbWl0X2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHdEQUEwQztBQWtFMUMsU0FBUyxxQ0FBcUM7SUFDNUMsT0FBTztRQUNMLDRCQUE0QixFQUFFLEVBQUU7UUFDaEMsMkJBQTJCLEVBQUUsRUFBRTtRQUMvQix3Q0FBd0MsRUFBRSxFQUFFO1FBQzVDLHNDQUFzQyxFQUFFLEVBQUU7S0FDM0MsQ0FBQztBQUNKLENBQUM7QUFFWSxRQUFBLDJCQUEyQixHQUFHO0lBQ3pDLE1BQU0sQ0FBQyxPQUFvQyxFQUFFLFNBQXFCLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ25GLEtBQUssTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLDRCQUE0QixFQUFFO1lBQ3BELDhCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFFLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3RFO1FBRUQsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsMkJBQTJCLEVBQUU7WUFDbkQsOEJBQXNCLENBQUMsTUFBTSxDQUFDLENBQUUsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDdEU7UUFFRCxLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyx3Q0FBd0MsRUFBRTtZQUNoRSw4QkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBRSxFQUFFLE1BQU0sQ0FB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