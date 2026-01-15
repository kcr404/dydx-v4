"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../src/lib/constants");
const helpers_1 = require("../../src/lib/helpers");
const constants_2 = require("../helpers/constants");
const chain_helpers_1 = require("../../src/clients/helpers/chain-helpers");
const long_1 = __importDefault(require("long"));
describe('helpers', () => {
    describe('calculateSubticks', () => {
        it('correctly handles decimals', () => {
            expect((0, chain_helpers_1.calculateSubticks)(8.45, -7, -9, 1000000)).toEqual(new long_1.default(845000000));
        });
    });
    describe('calculateQuantums', () => {
        it('correctly handles decimals', () => {
            expect((0, chain_helpers_1.calculateQuantums)(0.0003, -10, 1000000)).toEqual(new long_1.default(3000000));
        });
    });
    describe('convertPartialTransactionOptionsToFull', () => it.each([
        [
            'partial transactionOptions',
            {
                accountNumber: constants_2.defaultTransactionOptions.accountNumber,
                chainId: constants_2.defaultTransactionOptions.chainId,
            },
            { ...constants_2.defaultTransactionOptions, sequence: constants_1.DEFAULT_SEQUENCE },
        ],
        ['undefined transactionOptions', undefined, undefined],
    ])('convertPartialTransactionOptionsToFull: %s', (_name, partialTransactionOptions, expectedResult) => {
        const transactionOptions = (0, helpers_1.convertPartialTransactionOptionsToFull)(partialTransactionOptions);
        expect(expectedResult).toEqual(transactionOptions);
    }));
    describe('stripHexPrefix', () => {
        it('strips 0x prefix', () => {
            expect((0, helpers_1.stripHexPrefix)('0x123')).toEqual('123');
        });
        it('returns input if no prefix', () => {
            expect((0, helpers_1.stripHexPrefix)('10x23')).toEqual('10x23');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vX190ZXN0c19fL2xpYi9oZWxwZXJzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSx1REFBMkQ7QUFDM0QsbURBQStGO0FBQy9GLG9EQUFpRTtBQUNqRSwyRUFBK0Y7QUFDL0YsZ0RBQXdCO0FBRXhCLFFBQVEsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO0lBQ3ZCLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFDakMsRUFBRSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtZQUNwQyxNQUFNLENBQUMsSUFBQSxpQ0FBaUIsRUFBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxjQUFJLENBQUMsU0FBVyxDQUFDLENBQUMsQ0FBQztRQUNsRixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtRQUNqQyxFQUFFLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO1lBQ3BDLE1BQU0sQ0FBQyxJQUFBLGlDQUFpQixFQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGNBQUksQ0FBQyxPQUFTLENBQUMsQ0FBQyxDQUFDO1FBQy9FLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsd0NBQXdDLEVBQUUsR0FBRyxFQUFFLENBQ3RELEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFDTjtZQUNFLDRCQUE0QjtZQUM1QjtnQkFDRSxhQUFhLEVBQUUscUNBQXlCLENBQUMsYUFBYTtnQkFDdEQsT0FBTyxFQUFFLHFDQUF5QixDQUFDLE9BQU87YUFDM0M7WUFDRCxFQUFFLEdBQUcscUNBQXlCLEVBQUUsUUFBUSxFQUFFLDRCQUFnQixFQUFFO1NBQzdEO1FBQ0QsQ0FBQyw4QkFBOEIsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDO0tBQ3ZELENBQUMsQ0FDQSw0Q0FBNEMsRUFDNUMsQ0FDRSxLQUFhLEVBQ2IseUJBQWdFLEVBQ2hFLGNBQThDLEVBQzlDLEVBQUU7UUFDRixNQUFNLGtCQUFrQixHQUN0QixJQUFBLGdEQUFzQyxFQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDcEUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3JELENBQUMsQ0FDRixDQUFDLENBQUM7SUFFTCxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO1FBQzlCLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7WUFDMUIsTUFBTSxDQUFDLElBQUEsd0JBQWMsRUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7WUFDcEMsTUFBTSxDQUFDLElBQUEsd0JBQWMsRUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMifQ==