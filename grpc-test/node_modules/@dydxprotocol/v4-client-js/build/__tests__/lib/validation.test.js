"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../src/types");
const constants_1 = require("../../src/lib/constants");
const errors_1 = require("../../src/lib/errors");
const validation_1 = require("../../src/lib/validation");
const constants_2 = require("../helpers/constants");
const long_1 = __importDefault(require("long"));
const MAX_UINT_32_PLUS_1 = constants_1.MAX_UINT_32 + 1;
const MAX_SUBACCOUNT_NUMBER_PLUS_1 = constants_1.MAX_SUBACCOUNT_NUMBER + 1;
describe('Validations', () => {
    it.each([
        ['valid', constants_2.defaultOrder, undefined],
        ['0 value clientId', { ...constants_2.defaultOrder, clientId: 0 }, undefined],
        [
            'underflow clientId',
            { ...constants_2.defaultOrder, clientId: -1 },
            new errors_1.UserError(`clientId: ${-1} is not a valid uint32`),
        ],
        [
            'overflow clientId',
            { ...constants_2.defaultOrder, clientId: MAX_UINT_32_PLUS_1 },
            new errors_1.UserError(`clientId: ${MAX_UINT_32_PLUS_1} is not a valid uint32`),
        ],
        [
            'underflow quantums',
            { ...constants_2.defaultOrder, quantums: long_1.default.NEG_ONE },
            new errors_1.UserError(`quantums: ${-1} cannot be <= 0`),
        ],
        [
            'underflow goodTilBlock',
            { ...constants_2.defaultOrder, goodTilBlock: -1 },
            new errors_1.UserError(`goodTilBlock: ${-1} is not a valid uint32 or is 0`),
        ],
        [
            'overflow goodTilBlock',
            { ...constants_2.defaultOrder, goodTilBlock: MAX_UINT_32_PLUS_1 },
            new errors_1.UserError(`goodTilBlock: ${MAX_UINT_32_PLUS_1} is not a valid uint32 or is 0`),
        ],
        [
            '0 goodTilBlock',
            { ...constants_2.defaultOrder, goodTilBlock: 0 },
            new errors_1.UserError(`goodTilBlock: ${0} is not a valid uint32 or is 0`),
        ],
        [
            'underflow subticks',
            { ...constants_2.defaultOrder, subticks: long_1.default.NEG_ONE },
            new errors_1.UserError(`subticks: ${-1} cannot be <= 0`),
        ],
    ])('Validate order: %s', (_name, order, expectedError) => {
        const validationError = (0, validation_1.validatePlaceOrderMessage)(0, order);
        expect(validationError).toEqual(expectedError);
    });
    it.each([
        ['valid', constants_2.defaultCancelOrder, undefined],
        ['0 value clientId', { ...constants_2.defaultCancelOrder, clientId: 0 }, undefined],
        [
            'underflow clientId',
            { ...constants_2.defaultCancelOrder, clientId: -1 },
            new errors_1.UserError(`clientId: ${-1} is not a valid uint32`),
        ],
        [
            'overflow clientId',
            { ...constants_2.defaultCancelOrder, clientId: MAX_UINT_32_PLUS_1 },
            new errors_1.UserError(`clientId: ${MAX_UINT_32_PLUS_1} is not a valid uint32`),
        ],
        [
            'underflow goodTilBlock',
            { ...constants_2.defaultCancelOrder, goodTilBlock: -1 },
            new errors_1.UserError(`goodTilBlock: ${-1} is not a valid uint32 or is 0`),
        ],
        [
            'overflow goodTilBlock',
            { ...constants_2.defaultCancelOrder, goodTilBlock: MAX_UINT_32_PLUS_1 },
            new errors_1.UserError(`goodTilBlock: ${MAX_UINT_32_PLUS_1} is not a valid uint32 or is 0`),
        ],
        [
            '0 goodTilBlock',
            { ...constants_2.defaultCancelOrder, goodTilBlock: 0 },
            new errors_1.UserError(`goodTilBlock: ${0} is not a valid uint32 or is 0`),
        ],
        [
            'contains GoodTilBlockTime',
            { ...constants_2.defaultCancelOrder, goodTilBlockTime: 10 },
            new errors_1.UserError('goodTilBlockTime is 10, but should not be set for non-stateful orders'),
        ],
        [
            'stateful order - valid',
            {
                ...constants_2.defaultCancelOrder,
                orderFlags: types_1.OrderFlags.LONG_TERM,
                goodTilBlock: undefined,
                goodTilBlockTime: 10,
            },
            undefined,
        ],
        [
            'stateful order - undefined goodTilBlockTime',
            { ...constants_2.defaultCancelOrder, orderFlags: types_1.OrderFlags.LONG_TERM },
            new errors_1.UserError(`goodTilBlockTime: ${undefined} is not a valid uint32 or is 0`),
        ],
        [
            'stateful order - zero goodTilBlockTime',
            { ...constants_2.defaultCancelOrder, orderFlags: types_1.OrderFlags.LONG_TERM, goodTilBlockTime: 0 },
            new errors_1.UserError(`goodTilBlockTime: ${0} is not a valid uint32 or is 0`),
        ],
        [
            'stateful order - underflow goodTilBlockTime',
            { ...constants_2.defaultCancelOrder, orderFlags: types_1.OrderFlags.LONG_TERM, goodTilBlockTime: -1 },
            new errors_1.UserError(`goodTilBlockTime: ${-1} is not a valid uint32 or is 0`),
        ],
        [
            'stateful order - overflow goodTilBlockTime',
            {
                ...constants_2.defaultCancelOrder,
                orderFlags: types_1.OrderFlags.LONG_TERM,
                goodTilBlockTime: MAX_UINT_32_PLUS_1,
            },
            new errors_1.UserError(`goodTilBlockTime: ${MAX_UINT_32_PLUS_1} is not a valid uint32 or is 0`),
        ],
        [
            'stateful order - has GoodTilBlock',
            {
                ...constants_2.defaultCancelOrder,
                orderFlags: types_1.OrderFlags.LONG_TERM,
                goodTilBlock: 10,
                goodTilBlockTime: 10,
            },
            new errors_1.UserError('goodTilBlock is 10, but should not be set for stateful orders'),
        ],
    ])('Validate cancel order: %s', (_name, order, expectedError) => {
        const validationError = (0, validation_1.validateCancelOrderMessage)(0, order);
        expect(validationError).toEqual(expectedError);
    });
    it.each([
        ['valid', constants_2.defaultBatchCancelOrder, undefined],
        [
            'overflow clientId',
            {
                ...constants_2.defaultBatchCancelOrder,
                shortTermOrders: [
                    ...constants_2.defaultBatchCancelOrder.shortTermOrders,
                    {
                        clobPairId: types_1.ClobPairId.PERPETUAL_PAIR_ETH_USD,
                        clientIds: [MAX_UINT_32_PLUS_1],
                    },
                ],
            },
            new errors_1.UserError(`clientId: ${MAX_UINT_32_PLUS_1} is not a valid uint32`),
        ],
        [
            'underflow goodTilBlock',
            { ...constants_2.defaultBatchCancelOrder, goodTilBlock: -1 },
            new errors_1.UserError(`goodTilBlock: ${-1} is not a valid uint32 or is 0`),
        ],
        [
            'overflow goodTilBlock',
            { ...constants_2.defaultBatchCancelOrder, goodTilBlock: MAX_UINT_32_PLUS_1 },
            new errors_1.UserError(`goodTilBlock: ${MAX_UINT_32_PLUS_1} is not a valid uint32 or is 0`),
        ],
        [
            '0 goodTilBlock',
            { ...constants_2.defaultBatchCancelOrder, goodTilBlock: 0 },
            new errors_1.UserError(`goodTilBlock: ${0} is not a valid uint32 or is 0`),
        ],
    ])('Validate batch cancel orders: %s', (_name, orders, expectedError) => {
        const validationError = (0, validation_1.validateBatchCancelOrderMessage)(0, orders);
        expect(validationError).toEqual(expectedError);
    });
    it.each([
        ['valid', constants_2.defaultTransfer, undefined],
        [
            'underflow senderSubaccountNumber',
            { ...constants_2.defaultTransfer, sender: { owner: constants_2.TEST_ADDRESS, number: -1 } },
            new errors_1.UserError(`senderSubaccountNumber: ${-1} cannot be < 0 or > ${constants_1.MAX_SUBACCOUNT_NUMBER}`),
        ],
        [
            'exceeds max subaccount number - senderSubaccountNumber',
            { ...constants_2.defaultTransfer, sender: { owner: constants_2.TEST_ADDRESS, number: MAX_SUBACCOUNT_NUMBER_PLUS_1 } },
            new errors_1.UserError(`senderSubaccountNumber: ${MAX_SUBACCOUNT_NUMBER_PLUS_1} cannot be < 0 or > ${constants_1.MAX_SUBACCOUNT_NUMBER}`),
        ],
        [
            '0 senderSubaccountNumber',
            { ...constants_2.defaultTransfer, sender: { owner: constants_2.TEST_ADDRESS, number: 0 } },
            undefined,
        ],
        [
            'underflow recipientSubaccountNumber',
            { ...constants_2.defaultTransfer, recipient: { owner: constants_2.TEST_ADDRESS, number: -1 } },
            new errors_1.UserError(`recipientSubaccountNumber: ${-1} cannot be < 0 or > ${constants_1.MAX_SUBACCOUNT_NUMBER}`),
        ],
        [
            'exceeds max subaccount number - recipient.subaccountNumber',
            {
                ...constants_2.defaultTransfer,
                recipient: { owner: constants_2.TEST_ADDRESS, number: MAX_SUBACCOUNT_NUMBER_PLUS_1 },
            },
            new errors_1.UserError(`recipientSubaccountNumber: ${MAX_SUBACCOUNT_NUMBER_PLUS_1} cannot be < 0 or > ${constants_1.MAX_SUBACCOUNT_NUMBER}`),
        ],
        [
            '0 recipientSubaccountNumber',
            { ...constants_2.defaultTransfer, recipient: { owner: constants_2.TEST_ADDRESS, number: 0 } },
            undefined,
        ],
        [
            'non-zero asset id',
            { ...constants_2.defaultTransfer, assetId: 1 },
            new errors_1.UserError(`asset id: ${1} not supported`),
        ],
        [
            '0 amount',
            { ...constants_2.defaultTransfer, amount: long_1.default.ZERO },
            new errors_1.UserError(`amount: ${0} cannot be <= 0`),
        ],
        [
            'too short recipientAddress',
            {
                ...constants_2.defaultTransfer,
                recipient: {
                    owner: 'dydx14063jves4u9zhm7eja5ltf3t8zspxd92qnk23',
                    number: 0,
                },
            },
            new errors_1.UserError('Error: Invalid checksum for dydx14063jves4u9zhm7eja5ltf3t8zspxd92qnk23'),
        ],
        [
            'invalid recipientAddress',
            {
                ...constants_2.defaultTransfer,
                recipient: {
                    owner: 'fakeAddress1234',
                    number: 0,
                },
            },
            new errors_1.UserError('Error: Mixed-case string fakeAddress1234'),
        ],
    ])('Validate transfer: %s', (_name, transfer, expectedError) => {
        const validationError = (0, validation_1.validateTransferMessage)(transfer);
        expect(validationError).toEqual(expectedError);
    });
    it.each([
        ['valid', 'dydx17xpfvakm2amg962yls6f84z3kell8c5leqdyt2', true],
        ['invalid: does not start with dydx1', 'dydx27xpfvakm2amg962yls6f84z3kell8c5leqdyt2', false],
        ['invalid: too short', 'dydx17xpfvakm2amg962yls6f84z3kell8c5leqdyt', false],
        ['invalid: too long', 'dydx17xpfvakm2amg962yls6f84z3kell8c5leqdyt2s', false],
    ])('Validate address: %s', (_name, address, expectedResult) => {
        const validationResult = (0, validation_1.isValidAddress)(address);
        expect(validationResult).toEqual(expectedResult);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vX190ZXN0c19fL2xpYi92YWxpZGF0aW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0FPeUI7QUFDekIsdURBQTZFO0FBQzdFLGlEQUFpRDtBQUNqRCx5REFNa0M7QUFDbEMsb0RBTThCO0FBQzlCLGdEQUF3QjtBQUV4QixNQUFNLGtCQUFrQixHQUFXLHVCQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sNEJBQTRCLEdBQVcsaUNBQXFCLEdBQUcsQ0FBQyxDQUFDO0FBRXZFLFFBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO0lBQzNCLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFDTixDQUFDLE9BQU8sRUFBRSx3QkFBWSxFQUFFLFNBQVMsQ0FBQztRQUNsQyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsR0FBRyx3QkFBWSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUM7UUFDakU7WUFDRSxvQkFBb0I7WUFDcEIsRUFBRSxHQUFHLHdCQUFZLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ2pDLElBQUksa0JBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQztTQUN2RDtRQUNEO1lBQ0UsbUJBQW1CO1lBQ25CLEVBQUUsR0FBRyx3QkFBWSxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRTtZQUNqRCxJQUFJLGtCQUFTLENBQUMsYUFBYSxrQkFBa0Isd0JBQXdCLENBQUM7U0FDdkU7UUFDRDtZQUNFLG9CQUFvQjtZQUNwQixFQUFFLEdBQUcsd0JBQVksRUFBRSxRQUFRLEVBQUUsY0FBSSxDQUFDLE9BQU8sRUFBRTtZQUMzQyxJQUFJLGtCQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsaUJBQWlCLENBQUM7U0FDaEQ7UUFDRDtZQUNFLHdCQUF3QjtZQUN4QixFQUFFLEdBQUcsd0JBQVks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