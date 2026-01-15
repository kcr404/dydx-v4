"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAddress = exports.isStatefulOrder = exports.verifyOrderFlags = exports.validateTransferMessage = exports.validateBatchCancelOrderMessage = exports.validateCancelOrderMessage = exports.validatePlaceOrderMessage = void 0;
const bech32_1 = require("bech32");
const long_1 = __importDefault(require("long"));
const constants_1 = require("../clients/constants");
const types_1 = require("../clients/types");
const errors_1 = require("./errors");
/**
 * @describe validatePlaceOrderMessage validates that an order to place has fields that would be
 *  valid on-chain.
 */
function validatePlaceOrderMessage(subaccountNumber, order) {
    if (!verifyNumberIsUint32(order.clientId)) {
        return new errors_1.UserError(`clientId: ${order.clientId} is not a valid uint32`);
    }
    if (order.quantums.lessThanOrEqual(long_1.default.ZERO)) {
        return new errors_1.UserError(`quantums: ${order.quantums} cannot be <= 0`);
    }
    if (order.subticks.lessThanOrEqual(long_1.default.ZERO)) {
        return new errors_1.UserError(`subticks: ${order.subticks} cannot be <= 0`);
    }
    if (!verifySubaccountNumber(subaccountNumber)) {
        return new errors_1.UserError(`subaccountNumber: ${subaccountNumber} cannot be < 0 or > ${constants_1.MAX_SUBACCOUNT_NUMBER}`);
    }
    if (!isStatefulOrder(order.orderFlags) && !verifyGoodTilBlock(order.goodTilBlock)) {
        return new errors_1.UserError(`goodTilBlock: ${order.goodTilBlock} is not a valid uint32 or is 0`);
    }
    if (isStatefulOrder(order.orderFlags) && !verifyGoodTilBlockTime(order.goodTilBlockTime)) {
        return new errors_1.UserError(`goodTilBlockTime: ${order.goodTilBlockTime} is not a valid uint32 or is 0`);
    }
    return undefined;
}
exports.validatePlaceOrderMessage = validatePlaceOrderMessage;
/**
 * @describe validateCancelOrderMessage validates that an order to cancel has fields that would be
 *  valid on-chain.
 */
function validateCancelOrderMessage(subaccountNumber, order) {
    if (!verifyNumberIsUint32(order.clientId)) {
        return new errors_1.UserError(`clientId: ${order.clientId} is not a valid uint32`);
    }
    if (!isStatefulOrder(order.orderFlags) && !verifyGoodTilBlock(order.goodTilBlock)) {
        return new errors_1.UserError(`goodTilBlock: ${order.goodTilBlock} is not a valid uint32 or is 0`);
    }
    if (!isStatefulOrder(order.orderFlags) && order.goodTilBlockTime !== undefined) {
        return new errors_1.UserError(`goodTilBlockTime is ${order.goodTilBlockTime}, but should not be set for non-stateful orders`);
    }
    if (isStatefulOrder(order.orderFlags) && !verifyGoodTilBlockTime(order.goodTilBlockTime)) {
        return new errors_1.UserError(`goodTilBlockTime: ${order.goodTilBlockTime} is not a valid uint32 or is 0`);
    }
    if (isStatefulOrder(order.orderFlags) && order.goodTilBlock !== undefined) {
        return new errors_1.UserError(`goodTilBlock is ${order.goodTilBlock}, but should not be set for stateful orders`);
    }
    if (!verifySubaccountNumber(subaccountNumber)) {
        return new errors_1.UserError(`subaccountNumber: ${subaccountNumber} cannot be < 0 or > ${constants_1.MAX_SUBACCOUNT_NUMBER}`);
    }
    return undefined;
}
exports.validateCancelOrderMessage = validateCancelOrderMessage;
/**
 * @describe validateBatchCancelOrderMessage validates that orders to batch cancel have fields that would be
 *  valid on-chain.
 */
function validateBatchCancelOrderMessage(subaccountNumber, orders) {
    for (const orderBatch of orders.shortTermOrders) {
        for (const clientId of orderBatch.clientIds) {
            if (!verifyNumberIsUint32(clientId)) {
                return new errors_1.UserError(`clientId: ${clientId} is not a valid uint32`);
            }
        }
    }
    if (!verifyGoodTilBlock(orders.goodTilBlock)) {
        return new errors_1.UserError(`goodTilBlock: ${orders.goodTilBlock} is not a valid uint32 or is 0`);
    }
    if (!verifySubaccountNumber(subaccountNumber)) {
        return new errors_1.UserError(`subaccountNumber: ${subaccountNumber} cannot be < 0 or > ${constants_1.MAX_SUBACCOUNT_NUMBER}`);
    }
    return undefined;
}
exports.validateBatchCancelOrderMessage = validateBatchCancelOrderMessage;
/**
 * @describe validateTransferMessage validates that a transfer to place has fields that would be
 *  valid on-chain.
 */
function validateTransferMessage(transfer) {
    if (!verifySubaccountNumber(transfer.sender.number || 0)) {
        return new errors_1.UserError(`senderSubaccountNumber: ${transfer.sender.number || 0} cannot be < 0 or > ${constants_1.MAX_SUBACCOUNT_NUMBER}`);
    }
    if (!verifySubaccountNumber(transfer.recipient.number || 0)) {
        return new errors_1.UserError(`recipientSubaccountNumber: ${transfer.recipient.number || 0} cannot be < 0 or > ${constants_1.MAX_SUBACCOUNT_NUMBER}`);
    }
    if (transfer.assetId !== 0) {
        return new errors_1.UserError(`asset id: ${transfer.assetId} not supported`);
    }
    if (transfer.amount.lessThanOrEqual(long_1.default.ZERO)) {
        return new errors_1.UserError(`amount: ${transfer.amount} cannot be <= 0`);
    }
    const addressError = verifyIsBech32(transfer.recipient.owner);
    if (addressError !== undefined) {
        return new errors_1.UserError(addressError.toString());
    }
    return undefined;
}
exports.validateTransferMessage = validateTransferMessage;
function verifyGoodTilBlock(goodTilBlock) {
    if (goodTilBlock === undefined) {
        return false;
    }
    return verifyNumberIsUint32(goodTilBlock) && goodTilBlock > 0;
}
function verifyGoodTilBlockTime(goodTilBlockTime) {
    if (goodTilBlockTime === undefined) {
        return false;
    }
    return verifyNumberIsUint32(goodTilBlockTime) && goodTilBlockTime > 0;
}
function verifySubaccountNumber(subaccountNumber) {
    return subaccountNumber >= 0 && subaccountNumber <= constants_1.MAX_SUBACCOUNT_NUMBER;
}
function verifyNumberIsUint32(num) {
    return num >= 0 && num <= constants_1.MAX_UINT_32;
}
function verifyOrderFlags(orderFlags) {
    return (orderFlags === types_1.OrderFlags.SHORT_TERM ||
        orderFlags === types_1.OrderFlags.LONG_TERM ||
        orderFlags === types_1.OrderFlags.CONDITIONAL);
}
exports.verifyOrderFlags = verifyOrderFlags;
function isStatefulOrder(orderFlags) {
    return orderFlags === types_1.OrderFlags.LONG_TERM || orderFlags === types_1.OrderFlags.CONDITIONAL;
}
exports.isStatefulOrder = isStatefulOrder;
function verifyIsBech32(address) {
    try {
        (0, bech32_1.decode)(address);
    }
    catch (error) {
        return error;
    }
    return undefined;
}
function isValidAddress(address) {
    // An address is valid if it starts with `dydx1` and is Bech32 format.
    return address.startsWith('dydx1') && verifyIsBech32(address) === undefined;
}
exports.isValidAddress = isValidAddress;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdmFsaWRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxtQ0FBZ0M7QUFDaEMsZ0RBQXdCO0FBRXhCLG9EQUEwRTtBQUMxRSw0Q0FNMEI7QUFDMUIscUNBQXFDO0FBRXJDOzs7R0FHRztBQUNILFNBQWdCLHlCQUF5QixDQUN2QyxnQkFBd0IsRUFDeEIsS0FBa0I7SUFFbEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUN6QyxPQUFPLElBQUksa0JBQVMsQ0FBQyxhQUFhLEtBQUssQ0FBQyxRQUFRLHdCQUF3QixDQUFDLENBQUM7S0FDM0U7SUFDRCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUM3QyxPQUFPLElBQUksa0JBQVMsQ0FBQyxhQUFhLEtBQUssQ0FBQyxRQUFRLGlCQUFpQixDQUFDLENBQUM7S0FDcEU7SUFDRCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUM3QyxPQUFPLElBQUksa0JBQVMsQ0FBQyxhQUFhLEtBQUssQ0FBQyxRQUFRLGlCQUFpQixDQUFDLENBQUM7S0FDcEU7SUFDRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUM3QyxPQUFPLElBQUksa0JBQVMsQ0FDbEIscUJBQXFCLGdCQUFnQix1QkFBdUIsaUNBQXFCLEVBQUUsQ0FDcEYsQ0FBQztLQUNIO0lBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUU7UUFDakYsT0FBTyxJQUFJLGtCQUFTLENBQUMsaUJBQWlCLEtBQUssQ0FBQyxZQUFZ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