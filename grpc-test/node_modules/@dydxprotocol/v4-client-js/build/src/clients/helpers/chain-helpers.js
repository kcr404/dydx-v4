"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateConditionalOrderTriggerSubticks = exports.calculateConditionType = exports.calculateClientMetadata = exports.calculateOrderFlags = exports.calculateTimeInForce = exports.calculateSide = exports.calculateSubticks = exports.calculateVaultQuantums = exports.calculateQuantums = exports.round = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const long_1 = __importDefault(require("long"));
const constants_1 = require("../constants");
const proto_includes_1 = require("../modules/proto-includes");
const types_1 = require("../types");
function round(input, base) {
    return (0, bignumber_js_1.default)(input)
        .div((0, bignumber_js_1.default)(base))
        .integerValue(bignumber_js_1.default.ROUND_FLOOR)
        .times((0, bignumber_js_1.default)(base))
        .toNumber();
}
exports.round = round;
function calculateQuantums(size, atomicResolution, stepBaseQuantums) {
    const rawQuantums = (0, bignumber_js_1.default)(size).times((0, bignumber_js_1.default)(10).pow((0, bignumber_js_1.default)(atomicResolution).negated()));
    const quantums = round(rawQuantums.toNumber(), stepBaseQuantums);
    // stepBaseQuantums functions as minimum order size
    const result = Math.max(quantums, stepBaseQuantums);
    return long_1.default.fromNumber(result);
}
exports.calculateQuantums = calculateQuantums;
function calculateVaultQuantums(size) {
    return BigInt((0, bignumber_js_1.default)(size).times(1000000).toFixed(0, bignumber_js_1.default.ROUND_FLOOR));
}
exports.calculateVaultQuantums = calculateVaultQuantums;
function calculateSubticks(price, atomicResolution, quantumConversionExponent, subticksPerTick) {
    const QUOTE_QUANTUMS_ATOMIC_RESOLUTION = -6;
    const exponent = atomicResolution - quantumConversionExponent - QUOTE_QUANTUMS_ATOMIC_RESOLUTION;
    const rawSubticks = (0, bignumber_js_1.default)(price).times((0, bignumber_js_1.default)(10).pow(exponent));
    const subticks = round(rawSubticks.toNumber(), subticksPerTick);
    const result = Math.max(subticks, subticksPerTick);
    return long_1.default.fromNumber(result);
}
exports.calculateSubticks = calculateSubticks;
function calculateSide(side) {
    return side === constants_1.OrderSide.BUY ? proto_includes_1.Order_Side.SIDE_BUY : proto_includes_1.Order_Side.SIDE_SELL;
}
exports.calculateSide = calculateSide;
function calculateTimeInForce(type, timeInForce, execution, postOnly) {
    switch (type) {
        case constants_1.OrderType.MARKET:
            switch (timeInForce) {
                case constants_1.OrderTimeInForce.FOK:
                    return proto_includes_1.Order_TimeInForce.TIME_IN_FORCE_FILL_OR_KILL;
                default:
                    return proto_includes_1.Order_TimeInForce.TIME_IN_FORCE_IOC;
            }
        case constants_1.OrderType.LIMIT:
            switch (timeInForce) {
                case constants_1.OrderTimeInForce.GTT:
                    if (postOnly == null) {
                        throw new Error('postOnly must be set if order type is LIMIT and timeInForce is GTT');
                    }
                    return postOnly
                        ? proto_includes_1.Order_TimeInForce.TIME_IN_FORCE_POST_ONLY
                        : proto_includes_1.Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED;
                case constants_1.OrderTimeInForce.FOK:
                    return proto_includes_1.Order_TimeInForce.TIME_IN_FORCE_FILL_OR_KILL;
                case constants_1.OrderTimeInForce.IOC:
                    return proto_includes_1.Order_TimeInForce.TIME_IN_FORCE_IOC;
                default:
                    throw new Error('Unexpected code path: timeInForce');
            }
        case constants_1.OrderType.STOP_LIMIT:
        case constants_1.OrderType.TAKE_PROFIT_LIMIT:
            if (execution == null) {
                throw new Error('execution must be set if order type is STOP_LIMIT or TAKE_PROFIT_LIMIT');
            }
            switch (execution) {
                case constants_1.OrderExecution.DEFAULT:
                    return proto_includes_1.Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED;
                case constants_1.OrderExecution.POST_ONLY:
                    return proto_includes_1.Order_TimeInForce.TIME_IN_FORCE_POST_ONLY;
                case constants_1.OrderExecution.FOK:
                    return proto_includes_1.Order_TimeInForce.TIME_IN_FORCE_FILL_OR_KILL;
                case constants_1.OrderExecution.IOC:
                    return proto_includes_1.Order_TimeInForce.TIME_IN_FORCE_IOC;
                default:
                    throw new Error('Unexpected code path: timeInForce');
            }
        case constants_1.OrderType.STOP_MARKET:
        case constants_1.OrderType.TAKE_PROFIT_MARKET:
            if (execution == null) {
                throw new Error('execution must be set if order type is STOP_MARKET or TAKE_PROFIT_MARKET');
            }
            switch (execution) {
                case constants_1.OrderExecution.DEFAULT:
                    throw new Error('Execution value DEFAULT not supported for STOP_MARKET or TAKE_PROFIT_MARKET');
                case constants_1.OrderExecution.POST_ONLY:
                    throw new Error('Execution value POST_ONLY not supported for STOP_MARKET or TAKE_PROFIT_MARKET');
                case constants_1.OrderExecution.FOK:
                    return proto_includes_1.Order_TimeInForce.TIME_IN_FORCE_FILL_OR_KILL;
                case constants_1.OrderExecution.IOC:
                    return proto_includes_1.Order_TimeInForce.TIME_IN_FORCE_IOC;
                default:
                    throw new Error('Unexpected code path: timeInForce');
            }
        default:
            throw new Error('Unexpected code path: timeInForce');
    }
}
exports.calculateTimeInForce = calculateTimeInForce;
function calculateOrderFlags(type, timeInForce) {
    switch (type) {
        case constants_1.OrderType.MARKET:
            return types_1.OrderFlags.SHORT_TERM;
        case constants_1.OrderType.LIMIT:
            if (timeInForce === undefined) {
                throw new Error('timeInForce must be set if orderType is LIMIT');
            }
            if (timeInForce === constants_1.OrderTimeInForce.GTT) {
                return types_1.OrderFlags.LONG_TERM;
            }
            else {
                return types_1.OrderFlags.SHORT_TERM;
            }
        case constants_1.OrderType.STOP_LIMIT:
        case constants_1.OrderType.TAKE_PROFIT_LIMIT:
        case constants_1.OrderType.STOP_MARKET:
        case constants_1.OrderType.TAKE_PROFIT_MARKET:
            return types_1.OrderFlags.CONDITIONAL;
        default:
            throw new Error('Unexpected code path: orderFlags');
    }
}
exports.calculateOrderFlags = calculateOrderFlags;
function calculateClientMetadata(orderType) {
    switch (orderType) {
        case constants_1.OrderType.MARKET:
        case constants_1.OrderType.STOP_MARKET:
        case constants_1.OrderType.TAKE_PROFIT_MARKET:
            return 1;
        default:
            return 0;
    }
}
exports.calculateClientMetadata = calculateClientMetadata;
function calculateConditionType(orderType) {
    switch (orderType) {
        case constants_1.OrderType.LIMIT:
            return proto_includes_1.Order_ConditionType.CONDITION_TYPE_UNSPECIFIED;
        case constants_1.OrderType.MARKET:
            return proto_includes_1.Order_ConditionType.CONDITION_TYPE_UNSPECIFIED;
        case constants_1.OrderType.STOP_LIMIT:
        case constants_1.OrderType.STOP_MARKET:
            return proto_includes_1.Order_ConditionType.CONDITION_TYPE_STOP_LOSS;
        case constants_1.OrderType.TAKE_PROFIT_LIMIT:
        case constants_1.OrderType.TAKE_PROFIT_MARKET:
            return proto_includes_1.Order_ConditionType.CONDITION_TYPE_TAKE_PROFIT;
        default:
            return proto_includes_1.Order_ConditionType.CONDITION_TYPE_UNSPECIFIED;
    }
}
exports.calculateConditionType = calculateConditionType;
function calculateConditionalOrderTriggerSubticks(orderType, atomicResolution, quantumConversionExponent, subticksPerTick, triggerPrice) {
    switch (orderType) {
        case constants_1.OrderType.LIMIT:
        case constants_1.OrderType.MARKET:
            return long_1.default.fromNumber(0);
        case constants_1.OrderType.STOP_LIMIT:
        case constants_1.OrderType.STOP_MARKET:
        case constants_1.OrderType.TAKE_PROFIT_LIMIT:
        case constants_1.OrderType.TAKE_PROFIT_MARKET:
            if (triggerPrice === undefined) {
                throw new Error('triggerPrice must be set if orderType is STOP_LIMIT, STOP_MARKET, TAKE_PROFIT_LIMIT, or TAKE_PROFIT_MARKET');
            }
            return calculateSubticks(triggerPrice, atomicResolution, quantumConversionExponent, subticksPerTick);
        default:
            return long_1.default.fromNumber(0);
    }
}
exports.calculateConditionalOrderTriggerSubticks = calculateConditionalOrderTriggerSubticks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4taGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnRzL2hlbHBlcnMvY2hhaW4taGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxnRUFBcUM7QUFDckMsZ0RBQXdCO0FBRXhCLDRDQUFzRjtBQUN0Riw4REFBK0Y7QUFDL0Ysb0NBQXNDO0FBRXRDLFNBQWdCLEtBQUssQ0FBQyxLQUFhLEVBQUUsSUFBWTtJQUMvQyxPQUFPLElBQUEsc0JBQVMsRUFBQyxLQUFLLENBQUM7U0FDcEIsR0FBRyxDQUFDLElBQUEsc0JBQVMsRUFBQyxJQUFJLENBQUMsQ0FBQztTQUNwQixZQUFZLENBQUMsc0JBQVMsQ0FBQyxXQUFXLENBQUM7U0FDbkMsS0FBSyxDQUFDLElBQUEsc0JBQVMsRUFBQyxJQUFJLENBQUMsQ0FBQztTQUN0QixRQUFRLEVBQUUsQ0FBQztBQUNoQixDQUFDO0FBTkQsc0JBTUM7QUFFRCxTQUFnQixpQkFBaUIsQ0FDL0IsSUFBWSxFQUNaLGdCQUF3QixFQUN4QixnQkFBd0I7SUFFeEIsTUFBTSxXQUFXLEdBQUcsSUFBQSxzQkFBUyxFQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FDdkMsSUFBQSxzQkFBUyxFQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFBLHNCQUFTLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUN6RCxDQUFDO0lBQ0YsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pFLG1EQUFtRDtJQUNuRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3BELE9BQU8sY0FBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBWkQsOENBWUM7QUFF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