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
exports.IndexerOrder = exports.IndexerOrderId = exports.clobPairStatusToJSON = exports.clobPairStatusFromJSON = exports.ClobPairStatusSDKType = exports.ClobPairStatus = exports.indexerOrder_ConditionTypeToJSON = exports.indexerOrder_ConditionTypeFromJSON = exports.IndexerOrder_ConditionTypeSDKType = exports.IndexerOrder_ConditionType = exports.indexerOrder_TimeInForceToJSON = exports.indexerOrder_TimeInForceFromJSON = exports.IndexerOrder_TimeInForceSDKType = exports.IndexerOrder_TimeInForce = exports.indexerOrder_SideToJSON = exports.indexerOrder_SideFromJSON = exports.IndexerOrder_SideSDKType = exports.IndexerOrder_Side = void 0;
const subaccount_1 = require("./subaccount");
const _m0 = __importStar(require("protobufjs/minimal"));
const helpers_1 = require("../../../../helpers");
/**
 * Represents the side of the orderbook the order will be placed on.
 * Note that Side.SIDE_UNSPECIFIED is an invalid order and cannot be
 * placed on the orderbook.
 */
var IndexerOrder_Side;
(function (IndexerOrder_Side) {
    /** SIDE_UNSPECIFIED - Default value. This value is invalid and unused. */
    IndexerOrder_Side[IndexerOrder_Side["SIDE_UNSPECIFIED"] = 0] = "SIDE_UNSPECIFIED";
    /** SIDE_BUY - SIDE_BUY is used to represent a BUY order. */
    IndexerOrder_Side[IndexerOrder_Side["SIDE_BUY"] = 1] = "SIDE_BUY";
    /** SIDE_SELL - SIDE_SELL is used to represent a SELL order. */
    IndexerOrder_Side[IndexerOrder_Side["SIDE_SELL"] = 2] = "SIDE_SELL";
    IndexerOrder_Side[IndexerOrder_Side["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(IndexerOrder_Side = exports.IndexerOrder_Side || (exports.IndexerOrder_Side = {}));
exports.IndexerOrder_SideSDKType = IndexerOrder_Side;
function indexerOrder_SideFromJSON(object) {
    switch (object) {
        case 0:
        case "SIDE_UNSPECIFIED":
            return IndexerOrder_Side.SIDE_UNSPECIFIED;
        case 1:
        case "SIDE_BUY":
            return IndexerOrder_Side.SIDE_BUY;
        case 2:
        case "SIDE_SELL":
            return IndexerOrder_Side.SIDE_SELL;
        case -1:
        case "UNRECOGNIZED":
        default:
            return IndexerOrder_Side.UNRECOGNIZED;
    }
}
exports.indexerOrder_SideFromJSON = indexerOrder_SideFromJSON;
function indexerOrder_SideToJSON(object) {
    switch (object) {
        case IndexerOrder_Side.SIDE_UNSPECIFIED:
            return "SIDE_UNSPECIFIED";
        case IndexerOrder_Side.SIDE_BUY:
            return "SIDE_BUY";
        case IndexerOrder_Side.SIDE_SELL:
            return "SIDE_SELL";
        case IndexerOrder_Side.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.indexerOrder_SideToJSON = indexerOrder_SideToJSON;
/**
 * TimeInForce indicates how long an order will remain active before it
 * is executed or expires.
 */
var IndexerOrder_TimeInForce;
(function (IndexerOrder_TimeInForce) {
    /**
     * TIME_IN_FORCE_UNSPECIFIED - TIME_IN_FORCE_UNSPECIFIED represents the default behavior where an
     * order will first match with existing orders on the book, and any
     * remaining size will be added to the book as a maker order.
     */
    IndexerOrder_TimeInForce[IndexerOrder_TimeInForce["TIME_IN_FORCE_UNSPECIFIED"] = 0] = "TIME_IN_FORCE_UNSPECIFIED";
    /**
     * TIME_IN_FORCE_IOC - TIME_IN_FORCE_IOC enforces that an order only be matched with
     * maker orders on the book. If the order has remaining size after
     * matching with existing orders on the book, the remaining size
     * is not placed on the book.
     */
    IndexerOrder_TimeInForce[IndexerOrder_TimeInForce["TIME_IN_FORCE_IOC"] = 1] = "TIME_IN_FORCE_IOC";
    /**
     * TIME_IN_FORCE_POST_ONLY - TIME_IN_FORCE_POST_ONLY enforces that an order only be placed
     * on the book as a maker order. Note this means that validators will cancel
     * any newly-placed post only orders that would cross with other maker
     * orders.
     */
    IndexerOrder_TimeInForce[IndexerOrder_TimeInForce["TIME_IN_FORCE_POST_ONLY"] = 2] = "TIME_IN_FORCE_POST_ONLY";
    /**
     * TIME_IN_FORCE_FILL_OR_KILL - TIME_IN_FORCE_FILL_OR_KILL enforces that an order will either be filled
     * completely and immediately by maker orders on the book or canceled if the
     * entire amount can‘t be matched.
     */
    IndexerOrder_TimeInForce[IndexerOrder_TimeInForce["TIME_IN_FORCE_FILL_OR_KILL"] = 3] = "TIME_IN_FORCE_FILL_OR_KILL";
    IndexerOrder_TimeInForce[IndexerOrder_TimeInForce["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(IndexerOrder_TimeInForce = exports.IndexerOrder_TimeInForce || (exports.IndexerOrder_TimeInForce = {}));
exports.IndexerOrder_TimeInForceSDKType = IndexerOrder_TimeInForce;
function indexerOrder_TimeInForceFromJSON(object) {
    switch (object) {
        case 0:
        case "TIME_IN_FORCE_UNSPECIFIED":
            return IndexerOrder_TimeInForce.TIME_IN_FORCE_UNSPECIFIED;
        case 1:
        case "TIME_IN_FORCE_IOC":
            return IndexerOrder_TimeInForce.TIME_IN_FORCE_IOC;
        case 2:
        case "TIME_IN_FORCE_POST_ONLY":
            return IndexerOrder_TimeInForce.TIME_IN_FORCE_POST_ONLY;
        case 3:
        case "TIME_IN_FORCE_FILL_OR_KILL":
            return IndexerOrder_TimeInForce.TIME_IN_FORCE_FILL_OR_KILL;
        case -1:
        case "UNRECOGNIZED":
        default:
            return IndexerOrder_TimeInForce.UNRECOGNIZED;
    }
}
exports.indexerOrder_TimeInForceFromJSON = indexerOrder_TimeInForceFromJSON;
function indexerOrder_TimeInForceToJSON(object) {
    switch (object) {
        case IndexerOrder_TimeInForce.TIME_IN_FORCE_UNSPECIFIED:
            return "TIME_IN_FORCE_UNSPECIFIED";
        case IndexerOrder_TimeInForce.TIME_IN_FORCE_IOC:
            return "TIME_IN_FORCE_IOC";
        case IndexerOrder_TimeInForce.TIME_IN_FORCE_POST_ONLY:
            return "TIME_IN_FORCE_POST_ONLY";
        case IndexerOrder_TimeInForce.TIME_IN_FORCE_FILL_OR_KILL:
            return "TIME_IN_FORCE_FILL_OR_KILL";
        case IndexerOrder_TimeInForce.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.indexerOrder_TimeInForceToJSON = indexerOrder_TimeInForceToJSON;
var IndexerOrder_ConditionType;
(function (IndexerOrder_ConditionType) {
    /**
     * CONDITION_TYPE_UNSPECIFIED - CONDITION_TYPE_UNSPECIFIED represents the default behavior where an
     * order will be placed immediately on the orderbook.
     */
    IndexerOrder_ConditionType[IndexerOrder_ConditionType["CONDITION_TYPE_UNSPECIFIED"] = 0] = "CONDITION_TYPE_UNSPECIFIED";
    /**
     * CONDITION_TYPE_STOP_LOSS - CONDITION_TYPE_STOP_LOSS represents a stop order. A stop order will
     * trigger when the oracle price moves at or above the trigger price for
     * buys, and at or below the trigger price for sells.
     */
    IndexerOrder_ConditionType[IndexerOrder_ConditionType["CONDITION_TYPE_STOP_LOSS"] = 1] = "CONDITION_TYPE_STOP_LOSS";
    /**
     * CONDITION_TYPE_TAKE_PROFIT - CONDITION_TYPE_TAKE_PROFIT represents a take profit order. A take profit
     * order will trigger when the oracle price moves at or below the trigger
     * price for buys and at or above the trigger price for sells.
     */
    IndexerOrder_ConditionType[IndexerOrder_ConditionType["CONDITION_TYPE_TAKE_PROFIT"] = 2] = "CONDITION_TYPE_TAKE_PROFIT";
    IndexerOrder_ConditionType[IndexerOrder_ConditionType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(IndexerOrder_ConditionType = exports.IndexerOrder_ConditionType || (exports.IndexerOrder_ConditionType = {}));
exports.IndexerOrder_ConditionTypeSDKType = IndexerOrder_ConditionType;
function indexerOrder_ConditionTypeFromJSON(object) {
    switch (object) {
        case 0:
        case "CONDITION_TYPE_UNSPECIFIED":
            return IndexerOrder_ConditionType.CONDITION_TYPE_UNSPECIFIED;
        case 1:
        case "CONDITION_TYPE_STOP_LOSS":
            return IndexerOrder_ConditionType.CONDITION_TYPE_STOP_LOSS;
        case 2:
        case "CONDITION_TYPE_TAKE_PROFIT":
            return IndexerOrder_ConditionType.CONDITION_TYPE_TAKE_PROFIT;
        case -1:
        case "UNRECOGNIZED":
        default:
            return IndexerOrder_ConditionType.UNRECOGNIZED;
    }
}
exports.indexerOrder_ConditionTypeFromJSON = indexerOrder_ConditionTypeFromJSON;
function indexerOrder_ConditionTypeToJSON(object) {
    switch (object) {
        case IndexerOrder_ConditionType.CONDITION_TYPE_UNSPECIFIED:
            return "CONDITION_TYPE_UNSPECIFIED";
        case IndexerOrder_ConditionType.CONDITION_TYPE_STOP_LOSS:
            return "CONDITION_TYPE_STOP_LOSS";
        case IndexerOrder_ConditionType.CONDITION_TYPE_TAKE_PROFIT:
            return "CONDITION_TYPE_TAKE_PROFIT";
        case IndexerOrder_ConditionType.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.indexerOrder_ConditionTypeToJSON = indexerOrder_ConditionTypeToJSON;
/**
 * Status of the CLOB.
 * Defined in clob.clob_pair
 */
var ClobPairStatus;
(function (ClobPairStatus) {
    /** CLOB_PAIR_STATUS_UNSPECIFIED - Default value. This value is invalid and unused. */
    ClobPairStatus[ClobPairStatus["CLOB_PAIR_STATUS_UNSPECIFIED"] = 0] = "CLOB_PAIR_STATUS_UNSPECIFIED";
    /**
     * CLOB_PAIR_STATUS_ACTIVE - CLOB_PAIR_STATUS_ACTIVE behavior is unfinalized.
     * TODO(DEC-600): update this documentation.
     */
    ClobPairStatus[ClobPairStatus["CLOB_PAIR_STATUS_ACTIVE"] = 1] = "CLOB_PAIR_STATUS_ACTIVE";
    /**
     * CLOB_PAIR_STATUS_PAUSED - CLOB_PAIR_STATUS_PAUSED behavior is unfinalized.
     * TODO(DEC-600): update this documentation.
     */
    ClobPairStatus[ClobPairStatus["CLOB_PAIR_STATUS_PAUSED"] = 2] = "CLOB_PAIR_STATUS_PAUSED";
    /**
     * CLOB_PAIR_STATUS_CANCEL_ONLY - CLOB_PAIR_STATUS_CANCEL_ONLY behavior is unfinalized.
     * TODO(DEC-600): update this documentation.
     */
    ClobPairStatus[ClobPairStatus["CLOB_PAIR_STATUS_CANCEL_ONLY"] = 3] = "CLOB_PAIR_STATUS_CANCEL_ONLY";
    /**
     * CLOB_PAIR_STATUS_POST_ONLY - CLOB_PAIR_STATUS_POST_ONLY behavior is unfinalized.
     * TODO(DEC-600): update this documentation.
     */
    ClobPairStatus[ClobPairStatus["CLOB_PAIR_STATUS_POST_ONLY"] = 4] = "CLOB_PAIR_STATUS_POST_ONLY";
    /**
     * CLOB_PAIR_STATUS_INITIALIZING - CLOB_PAIR_STATUS_INITIALIZING represents a newly-added clob pair.
     * Clob pairs in this state only accept orders which are
     * both short-term and post-only.
     */
    ClobPairStatus[ClobPairStatus["CLOB_PAIR_STATUS_INITIALIZING"] = 5] = "CLOB_PAIR_STATUS_INITIALIZING";
    /**
     * CLOB_PAIR_STATUS_FINAL_SETTLEMENT - CLOB_PAIR_STATUS_FINAL_SETTLEMENT represents a clob pair that has been
     * deactivated. Clob pairs in this state do not accept new orders and trading
     * is blocked. All open positions are closed and open stateful orders canceled
     * by the protocol when the clob pair transitions to this status. All
     * short-term orders are left to expire.
     */
    ClobPairStatus[ClobPairStatus["CLOB_PAIR_STATUS_FINAL_SETTLEMENT"] = 6] = "CLOB_PAIR_STATUS_FINAL_SETTLEMENT";
    ClobPairStatus[ClobPairStatus["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ClobPairStatus = exports.ClobPairStatus || (exports.ClobPairStatus = {}));
exports.ClobPairStatusSDKType = ClobPairStatus;
function clobPairStatusFromJSON(object) {
    switch (object) {
        case 0:
        case "CLOB_PAIR_STATUS_UNSPECIFIED":
            return ClobPairStatus.CLOB_PAIR_STATUS_UNSPECIFIED;
        case 1:
        case "CLOB_PAIR_STATUS_ACTIVE":
            return ClobPairStatus.CLOB_PAIR_STATUS_ACTIVE;
        case 2:
        case "CLOB_PAIR_STATUS_PAUSED":
            return ClobPairStatus.CLOB_PAIR_STATUS_PAUSED;
        case 3:
        case "CLOB_PAIR_STATUS_CANCEL_ONLY":
            return ClobPairStatus.CLOB_PAIR_STATUS_CANCEL_ONLY;
        case 4:
        case "CLOB_PAIR_STATUS_POST_ONLY":
            return ClobPairStatus.CLOB_PAIR_STATUS_POST_ONLY;
        case 5:
        case "CLOB_PAIR_STATUS_INITIALIZING":
            return ClobPairStatus.CLOB_PAIR_STATUS_INITIALIZING;
        case 6:
        case "CLOB_PAIR_STATUS_FINAL_SETTLEMENT":
            return ClobPairStatus.CLOB_PAIR_STATUS_FINAL_SETTLEMENT;
        case -1:
        case "UNRECOGNIZED":
        default:
            return ClobPairStatus.UNRECOGNIZED;
    }
}
exports.clobPairStatusFromJSON = clobPairStatusFromJSON;
function clobPairStatusToJSON(object) {
    switch (object) {
        case ClobPairStatus.CLOB_PAIR_STATUS_UNSPECIFIED:
            return "CLOB_PAIR_STATUS_UNSPECIFIED";
        case ClobPairStatus.CLOB_PAIR_STATUS_ACTIVE:
            return "CLOB_PAIR_STATUS_ACTIVE";
        case ClobPairStatus.CLOB_PAIR_STATUS_PAUSED:
            return "CLOB_PAIR_STATUS_PAUSED";
        case ClobPairStatus.CLOB_PAIR_STATUS_CANCEL_ONLY:
            return "CLOB_PAIR_STATUS_CANCEL_ONLY";
        case ClobPairStatus.CLOB_PAIR_STATUS_POST_ONLY:
            return "CLOB_PAIR_STATUS_POST_ONLY";
        case ClobPairStatus.CLOB_PAIR_STATUS_INITIALIZING:
            return "CLOB_PAIR_STATUS_INITIALIZING";
        case ClobPairStatus.CLOB_PAIR_STATUS_FINAL_SETTLEMENT:
            return "CLOB_PAIR_STATUS_FINAL_SETTLEMENT";
        case ClobPairStatus.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.clobPairStatusToJSON = clobPairStatusToJSON;
function createBaseIndexerOrderId() {
    return {
        subaccountId: undefined,
        clientId: 0,
        orderFlags: 0,
        clobPairId: 0
    };
}
exports.IndexerOrderId = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.subaccountId !== undefined) {
            subaccount_1.IndexerSubaccountId.encode(message.subaccountId, writer.uint32(10).fork()).ldelim();
        }
        if (message.clientId !== 0) {
            writer.uint32(21).fixed32(message.clientId);
        }
        if (message.orderFlags !== 0) {
            writer.uint32(24).uint32(message.orderFlags);
        }
        if (message.clobPairId !== 0) {
            writer.uint32(32).uint32(message.clobPairId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseIndexerOrderId();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.subaccountId = subaccount_1.IndexerSubaccountId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.clientId = reader.fixed32();
                    break;
                case 3:
                    message.orderFlags = reader.uint32();
                    break;
                case 4:
                    message.clobPairId = reader.uint32();
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
        const message = createBaseIndexerOrderId();
        message.subaccountId = object.subaccountId !== undefined && object.subaccountId !== null ? subaccount_1.IndexerSubaccountId.fromPartial(object.subaccountId) : undefined;
        message.clientId = (_a = object.clientId) !== null && _a !== void 0 ? _a : 0;
        message.orderFlags = (_b = object.orderFlags) !== null && _b !== void 0 ? _b : 0;
        message.clobPairId = (_c = object.clobPairId) !== null && _c !== void 0 ? _c : 0;
        return message;
    }
};
function createBaseIndexerOrder() {
    return {
        orderId: undefined,
        side: 0,
        quantums: helpers_1.Long.UZERO,
        subticks: helpers_1.Long.UZERO,
        goodTilBlock: undefined,
        goodTilBlockTime: undefined,
        timeInForce: 0,
        reduceOnly: false,
        clientMetadata: 0,
        conditionType: 0,
        conditionalOrderTriggerSubticks: helpers_1.Long.UZERO
    };
}
exports.IndexerOrder = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.orderId !== undefined) {
            exports.IndexerOrderId.encode(message.orderId, writer.uint32(10).fork()).ldelim();
        }
        if (message.side !== 0) {
            writer.uint32(16).int32(message.side);
        }
        if (!message.quantums.isZero()) {
            writer.uint32(24).uint64(message.quantums);
        }
        if (!message.subticks.isZero()) {
            writer.uint32(32).uint64(message.subticks);
        }
        if (message.goodTilBlock !== undefined) {
            writer.uint32(40).uint32(message.goodTilBlock);
        }
        if (message.goodTilBlockTime !== undefined) {
            writer.uint32(53).fixed32(message.goodTilBlockTime);
        }
        if (message.timeInForce !== 0) {
            writer.uint32(56).int32(message.timeInForce);
        }
        if (message.reduceOnly === true) {
            writer.uint32(64).bool(message.reduceOnly);
        }
        if (message.clientMetadata !== 0) {
            writer.uint32(72).uint32(message.clientMetadata);
        }
        if (message.conditionType !== 0) {
            writer.uint32(80).int32(message.conditionType);
        }
        if (!message.conditionalOrderTriggerSubticks.isZero()) {
            writer.uint32(88).uint64(message.conditionalOrderTriggerSubticks);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseIndexerOrder();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.orderId = exports.IndexerOrderId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.side = reader.int32();
                    break;
                case 3:
                    message.quantums = reader.uint64();
                    break;
                case 4:
                    message.subticks = reader.uint64();
                    break;
                case 5:
                    message.goodTilBlock = reader.uint32();
                    break;
                case 6:
                    message.goodTilBlockTime = reader.fixed32();
                    break;
                case 7:
                    message.timeInForce = reader.int32();
                    break;
                case 8:
                    message.reduceOnly = reader.bool();
                    break;
                case 9:
                    message.clientMetadata = reader.uint32();
                    break;
                case 10:
                    message.conditionType = reader.int32();
                    break;
                case 11:
                    message.conditionalOrderTriggerSubticks = reader.uint64();
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
        const message = createBaseIndexerOrder();
        message.orderId = object.orderId !== undefined && object.orderId !== null ? exports.IndexerOrderId.fromPartial(object.orderId) : undefined;
        message.side = (_a = object.side) !== null && _a !== void 0 ? _a : 0;
        message.quantums = object.quantums !== undefined && object.quantums !== null ? helpers_1.Long.fromValue(object.quantums) : helpers_1.Long.UZERO;
        message.subticks = object.subticks !== undefined && object.subticks !== null ? helpers_1.Long.fromValue(object.subticks) : helpers_1.Long.UZERO;
        message.goodTilBlock = (_b = object.goodTilBlock) !== null && _b !== void 0 ? _b : undefined;
        message.goodTilBlockTime = (_c = object.goodTilBlockTime) !== null && _c !== void 0 ? _c : undefined;
        message.timeInForce = (_d = object.timeInForce) !== null && _d !== void 0 ? _d : 0;
        message.reduceOnly = (_e = object.reduceOnly) !== null && _e !== void 0 ? _e : false;
        message.clientMetadata = (_f = object.clientMetadata) !== null && _f !== void 0 ? _f : 0;
        message.conditionType = (_g = object.conditionType) !== null && _g !== void 0 ? _g : 0;
        message.conditionalOrderTriggerSubticks = object.conditionalOrderTriggerSubticks !== undefined && object.conditionalOrderTriggerSubticks !== null ? helpers_1.Long.fromValue(object.conditionalOrderTriggerSubticks) : helpers_1.Long.UZERO;
        return message;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9AZHlkeHByb3RvY29sL3Y0LXByb3RvL3NyYy9jb2RlZ2VuL2R5ZHhwcm90b2NvbC9pbmRleGVyL3Byb3RvY29sL3YxL2Nsb2IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBK0U7QUFDL0Usd0RBQTBDO0FBQzFDLGlEQUF3RDtBQUN4RDs7OztHQUlHO0FBRUgsSUFBWSxpQkFVWDtBQVZELFdBQVksaUJBQWlCO0lBQzNCLDBFQUEwRTtJQUMxRSxpRkFBb0IsQ0FBQTtJQUVwQiw0REFBNEQ7SUFDNUQsaUVBQVksQ0FBQTtJQUVaLCtEQUErRDtJQUMvRCxtRUFBYSxDQUFBO0lBQ2IsMEVBQWlCLENBQUE7QUFDbkIsQ0FBQyxFQVZXLGlCQUFpQixHQUFqQix5QkFBaUIsS0FBakIseUJBQWlCLFFBVTVCO0FBQ1ksUUFBQSx3QkFBd0IsR0FBRyxpQkFBaUIsQ0FBQztBQUMxRCxTQUFnQix5QkFBeUIsQ0FBQyxNQUFXO0lBQ25ELFFBQVEsTUFBTSxFQUFFO1FBQ2QsS0FBSyxDQUFDLENBQUM7UUFDUCxLQUFLLGtCQUFrQjtZQUNyQixPQUFPLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDO1FBRTVDLEtBQUssQ0FBQyxDQUFDO1FBQ1AsS0FBSyxVQUFVO1lBQ2IsT0FBTyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7UUFFcEMsS0FBSyxDQUFDLENBQUM7UUFDUCxLQUFLLFdBQVc7WUFDZCxPQUFPLGlCQUFpQixDQUFDLFNBQVMsQ0FBQztRQUVyQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ1IsS0FBSyxjQUFjLENBQUM7UUFDcEI7WUFDRSxPQUFPLGlCQUFpQixDQUFDLFlBQVksQ0FBQztLQUN6QztBQUNILENBQUM7QUFuQkQsOERBbUJDO0FBQ0QsU0FBZ0IsdUJBQXVCLENB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