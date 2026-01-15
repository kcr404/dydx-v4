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
exports.OffChainUpdateV1 = exports.OrderReplaceV1 = exports.OrderUpdateV1 = exports.OrderRemoveV1 = exports.OrderPlaceV1 = exports.orderRemoveV1_OrderRemovalStatusToJSON = exports.orderRemoveV1_OrderRemovalStatusFromJSON = exports.OrderRemoveV1_OrderRemovalStatusSDKType = exports.OrderRemoveV1_OrderRemovalStatus = exports.orderPlaceV1_OrderPlacementStatusToJSON = exports.orderPlaceV1_OrderPlacementStatusFromJSON = exports.OrderPlaceV1_OrderPlacementStatusSDKType = exports.OrderPlaceV1_OrderPlacementStatus = void 0;
const clob_1 = require("../protocol/v1/clob");
const timestamp_1 = require("../../../google/protobuf/timestamp");
const _m0 = __importStar(require("protobufjs/minimal"));
const helpers_1 = require("../../../helpers");
/**
 * OrderPlacementStatus is an enum for the resulting status after an order is
 * placed.
 */
var OrderPlaceV1_OrderPlacementStatus;
(function (OrderPlaceV1_OrderPlacementStatus) {
    /** ORDER_PLACEMENT_STATUS_UNSPECIFIED - Default value, this is invalid and unused. */
    OrderPlaceV1_OrderPlacementStatus[OrderPlaceV1_OrderPlacementStatus["ORDER_PLACEMENT_STATUS_UNSPECIFIED"] = 0] = "ORDER_PLACEMENT_STATUS_UNSPECIFIED";
    /**
     * ORDER_PLACEMENT_STATUS_BEST_EFFORT_OPENED - A best effort opened order is one that has only been confirmed to be
     * placed on the dYdX node sending the off-chain update message.
     * The cases where this happens includes:
     * - The dYdX node places an order in it's in-memory orderbook during the
     *   CheckTx flow.
     * A best effort placed order may not have been placed on other dYdX
     * nodes including other dYdX validator nodes and may still be excluded in
     * future order matches.
     */
    OrderPlaceV1_OrderPlacementStatus[OrderPlaceV1_OrderPlacementStatus["ORDER_PLACEMENT_STATUS_BEST_EFFORT_OPENED"] = 1] = "ORDER_PLACEMENT_STATUS_BEST_EFFORT_OPENED";
    /**
     * ORDER_PLACEMENT_STATUS_OPENED - An opened order is one that is confirmed to be placed on all dYdX nodes
     * (discounting dishonest dYdX nodes) and will be included in any future
     * order matches.
     * This status is used internally by the indexer and will not be sent
     * out by protocol.
     */
    OrderPlaceV1_OrderPlacementStatus[OrderPlaceV1_OrderPlacementStatus["ORDER_PLACEMENT_STATUS_OPENED"] = 2] = "ORDER_PLACEMENT_STATUS_OPENED";
    OrderPlaceV1_OrderPlacementStatus[OrderPlaceV1_OrderPlacementStatus["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(OrderPlaceV1_OrderPlacementStatus = exports.OrderPlaceV1_OrderPlacementStatus || (exports.OrderPlaceV1_OrderPlacementStatus = {}));
exports.OrderPlaceV1_OrderPlacementStatusSDKType = OrderPlaceV1_OrderPlacementStatus;
function orderPlaceV1_OrderPlacementStatusFromJSON(object) {
    switch (object) {
        case 0:
        case "ORDER_PLACEMENT_STATUS_UNSPECIFIED":
            return OrderPlaceV1_OrderPlacementStatus.ORDER_PLACEMENT_STATUS_UNSPECIFIED;
        case 1:
        case "ORDER_PLACEMENT_STATUS_BEST_EFFORT_OPENED":
            return OrderPlaceV1_OrderPlacementStatus.ORDER_PLACEMENT_STATUS_BEST_EFFORT_OPENED;
        case 2:
        case "ORDER_PLACEMENT_STATUS_OPENED":
            return OrderPlaceV1_OrderPlacementStatus.ORDER_PLACEMENT_STATUS_OPENED;
        case -1:
        case "UNRECOGNIZED":
        default:
            return OrderPlaceV1_OrderPlacementStatus.UNRECOGNIZED;
    }
}
exports.orderPlaceV1_OrderPlacementStatusFromJSON = orderPlaceV1_OrderPlacementStatusFromJSON;
function orderPlaceV1_OrderPlacementStatusToJSON(object) {
    switch (object) {
        case OrderPlaceV1_OrderPlacementStatus.ORDER_PLACEMENT_STATUS_UNSPECIFIED:
            return "ORDER_PLACEMENT_STATUS_UNSPECIFIED";
        case OrderPlaceV1_OrderPlacementStatus.ORDER_PLACEMENT_STATUS_BEST_EFFORT_OPENED:
            return "ORDER_PLACEMENT_STATUS_BEST_EFFORT_OPENED";
        case OrderPlaceV1_OrderPlacementStatus.ORDER_PLACEMENT_STATUS_OPENED:
            return "ORDER_PLACEMENT_STATUS_OPENED";
        case OrderPlaceV1_OrderPlacementStatus.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.orderPlaceV1_OrderPlacementStatusToJSON = orderPlaceV1_OrderPlacementStatusToJSON;
/**
 * OrderRemovalStatus is an enum for the resulting status after an order is
 * removed.
 */
var OrderRemoveV1_OrderRemovalStatus;
(function (OrderRemoveV1_OrderRemovalStatus) {
    /** ORDER_REMOVAL_STATUS_UNSPECIFIED - Default value, this is invalid and unused. */
    OrderRemoveV1_OrderRemovalStatus[OrderRemoveV1_OrderRemovalStatus["ORDER_REMOVAL_STATUS_UNSPECIFIED"] = 0] = "ORDER_REMOVAL_STATUS_UNSPECIFIED";
    /**
     * ORDER_REMOVAL_STATUS_BEST_EFFORT_CANCELED - A best effort canceled order is one that has only been confirmed to be
     * removed on the dYdX node sending the off-chain update message.
     * The cases where this happens includes:
     * - the order was removed due to the dYdX node receiving a CancelOrder
     *   transaction for the order.
     * - the order was removed due to being undercollateralized during
     *   optimistic matching.
     * A best effort canceled order may not have been removed on other dYdX
     * nodes including other dYdX validator nodes and may still be included in
     * future order matches.
     */
    OrderRemoveV1_OrderRemovalStatus[OrderRemoveV1_OrderRemovalStatus["ORDER_REMOVAL_STATUS_BEST_EFFORT_CANCELED"] = 1] = "ORDER_REMOVAL_STATUS_BEST_EFFORT_CANCELED";
    /**
     * ORDER_REMOVAL_STATUS_CANCELED - A canceled order is one that is confirmed to be removed on all dYdX nodes
     * (discounting dishonest dYdX nodes) and will not be included in any future
     * order matches.
     * The cases where this happens includes:
     * - the order is expired.
     */
    OrderRemoveV1_OrderRemovalStatus[OrderRemoveV1_OrderRemovalStatus["ORDER_REMOVAL_STATUS_CANCELED"] = 2] = "ORDER_REMOVAL_STATUS_CANCELED";
    /** ORDER_REMOVAL_STATUS_FILLED - An order was fully-filled. Only sent by the Indexer for stateful orders. */
    OrderRemoveV1_OrderRemovalStatus[OrderRemoveV1_OrderRemovalStatus["ORDER_REMOVAL_STATUS_FILLED"] = 3] = "ORDER_REMOVAL_STATUS_FILLED";
    OrderRemoveV1_OrderRemovalStatus[OrderRemoveV1_OrderRemovalStatus["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(OrderRemoveV1_OrderRemovalStatus = exports.OrderRemoveV1_OrderRemovalStatus || (exports.OrderRemoveV1_OrderRemovalStatus = {}));
exports.OrderRemoveV1_OrderRemovalStatusSDKType = OrderRemoveV1_OrderRemovalStatus;
function orderRemoveV1_OrderRemovalStatusFromJSON(object) {
    switch (object) {
        case 0:
        case "ORDER_REMOVAL_STATUS_UNSPECIFIED":
            return OrderRemoveV1_OrderRemovalStatus.ORDER_REMOVAL_STATUS_UNSPECIFIED;
        case 1:
        case "ORDER_REMOVAL_STATUS_BEST_EFFORT_CANCELED":
            return OrderRemoveV1_OrderRemovalStatus.ORDER_REMOVAL_STATUS_BEST_EFFORT_CANCELED;
        case 2:
        case "ORDER_REMOVAL_STATUS_CANCELED":
            return OrderRemoveV1_OrderRemovalStatus.ORDER_REMOVAL_STATUS_CANCELED;
        case 3:
        case "ORDER_REMOVAL_STATUS_FILLED":
            return OrderRemoveV1_OrderRemovalStatus.ORDER_REMOVAL_STATUS_FILLED;
        case -1:
        case "UNRECOGNIZED":
        default:
            return OrderRemoveV1_OrderRemovalStatus.UNRECOGNIZED;
    }
}
exports.orderRemoveV1_OrderRemovalStatusFromJSON = orderRemoveV1_OrderRemovalStatusFromJSON;
function orderRemoveV1_OrderRemovalStatusToJSON(object) {
    switch (object) {
        case OrderRemoveV1_OrderRemovalStatus.ORDER_REMOVAL_STATUS_UNSPECIFIED:
            return "ORDER_REMOVAL_STATUS_UNSPECIFIED";
        case OrderRemoveV1_OrderRemovalStatus.ORDER_REMOVAL_STATUS_BEST_EFFORT_CANCELED:
            return "ORDER_REMOVAL_STATUS_BEST_EFFORT_CANCELED";
        case OrderRemoveV1_OrderRemovalStatus.ORDER_REMOVAL_STATUS_CANCELED:
            return "ORDER_REMOVAL_STATUS_CANCELED";
        case OrderRemoveV1_OrderRemovalStatus.ORDER_REMOVAL_STATUS_FILLED:
            return "ORDER_REMOVAL_STATUS_FILLED";
        case OrderRemoveV1_OrderRemovalStatus.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.orderRemoveV1_OrderRemovalStatusToJSON = orderRemoveV1_OrderRemovalStatusToJSON;
function createBaseOrderPlaceV1() {
    return {
        order: undefined,
        placementStatus: 0,
        timeStamp: undefined
    };
}
exports.OrderPlaceV1 = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.order !== undefined) {
            clob_1.IndexerOrder.encode(message.order, writer.uint32(10).fork()).ldelim();
        }
        if (message.placementStatus !== 0) {
            writer.uint32(16).int32(message.placementStatus);
        }
        if (message.timeStamp !== undefined) {
            timestamp_1.Timestamp.encode((0, helpers_1.toTimestamp)(message.timeStamp), writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOrderPlaceV1();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.order = clob_1.IndexerOrder.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.placementStatus = reader.int32();
                    break;
                case 3:
                    message.timeStamp = (0, helpers_1.fromTimestamp)(timestamp_1.Timestamp.decode(reader, reader.uint32()));
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
        const message = createBaseOrderPlaceV1();
        message.order = object.order !== undefined && object.order !== null ? clob_1.IndexerOrder.fromPartial(object.order) : undefined;
        message.placementStatus = (_a = object.placementStatus) !== null && _a !== void 0 ? _a : 0;
        message.timeStamp = (_b = object.timeStamp) !== null && _b !== void 0 ? _b : undefined;
        return message;
    }
};
function createBaseOrderRemoveV1() {
    return {
        removedOrderId: undefined,
        reason: 0,
        removalStatus: 0,
        timeStamp: undefined
    };
}
exports.OrderRemoveV1 = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.removedOrderId !== undefined) {
            clob_1.IndexerOrderId.encode(message.removedOrderId, writer.uint32(10).fork()).ldelim();
        }
        if (message.reason !== 0) {
            writer.uint32(16).int32(message.reason);
        }
        if (message.removalStatus !== 0) {
            writer.uint32(24).int32(message.removalStatus);
        }
        if (message.timeStamp !== undefined) {
            timestamp_1.Timestamp.encode((0, helpers_1.toTimestamp)(message.timeStamp), writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOrderRemoveV1();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.removedOrderId = clob_1.IndexerOrderId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.reason = reader.int32();
                    break;
                case 3:
                    message.removalStatus = reader.int32();
                    break;
                case 4:
                    message.timeStamp = (0, helpers_1.fromTimestamp)(timestamp_1.Timestamp.decode(reader, reader.uint32()));
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
        const message = createBaseOrderRemoveV1();
        message.removedOrderId = object.removedOrderId !== undefined && object.removedOrderId !== null ? clob_1.IndexerOrderId.fromPartial(object.removedOrderId) : undefined;
        message.reason = (_a = object.reason) !== null && _a !== void 0 ? _a : 0;
        message.removalStatus = (_b = object.removalStatus) !== null && _b !== void 0 ? _b : 0;
        message.timeStamp = (_c = object.timeStamp) !== null && _c !== void 0 ? _c : undefined;
        return message;
    }
};
function createBaseOrderUpdateV1() {
    return {
        orderId: undefined,
        totalFilledQuantums: helpers_1.Long.UZERO
    };
}
exports.OrderUpdateV1 = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.orderId !== undefined) {
            clob_1.IndexerOrderId.encode(message.orderId, writer.uint32(10).fork()).ldelim();
        }
        if (!message.totalFilledQuantums.isZero()) {
            writer.uint32(16).uint64(message.totalFilledQuantums);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOrderUpdateV1();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.orderId = clob_1.IndexerOrderId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.totalFilledQuantums = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseOrderUpdateV1();
        message.orderId = object.orderId !== undefined && object.orderId !== null ? clob_1.IndexerOrderId.fromPartial(object.orderId) : undefined;
        message.totalFilledQuantums = object.totalFilledQuantums !== undefined && object.totalFilledQuantums !== null ? helpers_1.Long.fromValue(object.totalFilledQuantums) : helpers_1.Long.UZERO;
        return message;
    }
};
function createBaseOrderReplaceV1() {
    return {
        oldOrderId: undefined,
        order: undefined,
        placementStatus: 0,
        timeStamp: undefined
    };
}
exports.OrderReplaceV1 = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.oldOrderId !== undefined) {
            clob_1.IndexerOrderId.encode(message.oldOrderId, writer.uint32(10).fork()).ldelim();
        }
        if (message.order !== undefined) {
            clob_1.IndexerOrder.encode(message.order, writer.uint32(18).fork()).ldelim();
        }
        if (message.placementStatus !== 0) {
            writer.uint32(24).int32(message.placementStatus);
        }
        if (message.timeStamp !== undefined) {
            timestamp_1.Timestamp.encode((0, helpers_1.toTimestamp)(message.timeStamp), writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOrderReplaceV1();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.oldOrderId = clob_1.IndexerOrderId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.order = clob_1.IndexerOrder.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.placementStatus = reader.int32();
                    break;
                case 4:
                    message.timeStamp = (0, helpers_1.fromTimestamp)(timestamp_1.Timestamp.decode(reader, reader.uint32()));
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
        const message = createBaseOrderReplaceV1();
        message.oldOrderId = object.oldOrderId !== undefined && object.oldOrderId !== null ? clob_1.IndexerOrderId.fromPartial(object.oldOrderId) : undefined;
        message.order = object.order !== undefined && object.order !== null ? clob_1.IndexerOrder.fromPartial(object.order) : undefined;
        message.placementStatus = (_a = object.placementStatus) !== null && _a !== void 0 ? _a : 0;
        message.timeStamp = (_b = object.timeStamp) !== null && _b !== void 0 ? _b : undefined;
        return message;
    }
};
function createBaseOffChainUpdateV1() {
    return {
        orderPlace: undefined,
        orderRemove: undefined,
        orderUpdate: undefined,
        orderReplace: undefined
    };
}
exports.OffChainUpdateV1 = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.orderPlace !== undefined) {
            exports.OrderPlaceV1.encode(message.orderPlace, writer.uint32(10).fork()).ldelim();
        }
        if (message.orderRemove !== undefined) {
            exports.OrderRemoveV1.encode(message.orderRemove, writer.uint32(18).fork()).ldelim();
        }
        if (message.orderUpdate !== undefined) {
            exports.OrderUpdateV1.encode(message.orderUpdate, writer.uint32(26).fork()).ldelim();
        }
        if (message.orderReplace !== undefined) {
            exports.OrderReplaceV1.encode(message.orderReplace, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOffChainUpdateV1();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.orderPlace = exports.OrderPlaceV1.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.orderRemove = exports.OrderRemoveV1.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.orderUpdate = exports.OrderUpdateV1.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.orderReplace = exports.OrderReplaceV1.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseOffChainUpdateV1();
        message.orderPlace = object.orderPlace !== undefined && object.orderPlace !== null ? exports.OrderPlaceV1.fromPartial(object.orderPlace) : undefined;
        message.orderRemove = object.orderRemove !== undefined && object.orderRemove !== null ? exports.OrderRemoveV1.fromPartial(object.orderRemove) : undefined;
        message.orderUpdate = object.orderUpdate !== undefined && object.orderUpdate !== null ? exports.OrderUpdateV1.fromPartial(object.orderUpdate) : undefined;
        message.orderReplace = object.orderReplace !== undefined && object.orderReplace !== null ? exports.OrderReplaceV1.fromPartial(object.orderReplace) : undefined;
        return message;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2ZmX2NoYWluX3VwZGF0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQGR5ZHhwcm90b2NvbC92NC1wcm90by9zcmMvY29kZWdlbi9keWR4cHJvdG9jb2wvaW5kZXhlci9vZmZfY2hhaW5fdXBkYXRlcy9vZmZfY2hhaW5fdXBkYXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhDQUErRztBQUMvRyxrRUFBK0Q7QUFFL0Qsd0RBQTBDO0FBQzFDLDhDQUFpRjtBQUNqRjs7O0dBR0c7QUFFSCxJQUFZLGlDQXlCWDtBQXpCRCxXQUFZLGlDQUFpQztJQUMzQyxzRkFBc0Y7SUFDdEYscUpBQXNDLENBQUE7SUFFdEM7Ozs7Ozs7OztPQVNHO0lBQ0gsbUtBQTZDLENBQUE7SUFFN0M7Ozs7OztPQU1HO0lBQ0gsMklBQWlDLENBQUE7SUFDakMsMEdBQWlCLENBQUE7QUFDbkIsQ0FBQyxFQXpCVyxpQ0FBaUMsR0FBakMseUNBQWlDLEtBQWpDLHlDQUFpQyxRQXlCNUM7QUFDWSxRQUFBLHdDQUF3QyxHQUFHLGlDQUFpQyxDQUFDO0FBQzFGLFNBQWdCLHlDQUF5QyxDQUFDLE1BQVc7SUFDbkUsUUFBUSxNQUFNLEVBQUU7UUFDZCxLQUFLLENBQUMsQ0FBQztRQUNQLEtBQUssb0NBQW9DO1lBQ3ZDLE9BQU8saUNBQWlDLENBQUMsa0NBQWtDLENBQUM7UUFFOUUsS0FBSyxDQUFDLENBQUM7UUFDUCxLQUFLLDJDQUEyQztZQUM5QyxPQUFPLGlDQUFpQyxDQUFDLHlDQUF5QyxDQUFDO1FBRXJGLEtBQUssQ0FBQyxDQUFDO1FBQ1AsS0FBSywrQkFBK0I7WUFDbEMsT0FBTyxpQ0FBaUMsQ0FBQyw2QkFBNkIsQ0FBQztRQUV6RSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ1IsS0FBSyxjQUFjLENBQUM7UUFDcEI7WUFDRSxPQUFPLGlDQUFp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LENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsb0JBQVksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDN0ksT0FBTyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxLQUFLLFNBQVMsSUFBSSxNQUFNLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMscUJBQWEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDbEosT0FBTyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxLQUFLLFNBQVMsSUFBSSxNQUFNLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMscUJBQWEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDbEosT0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxLQUFLLFNBQVMsSUFBSSxNQUFNLENBQUMsWUFBWSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsc0JBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDdkosT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztDQUVGLENBQUMifQ==