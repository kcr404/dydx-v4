"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToPrimitives = exports.generateQueryPath = void 0;
const long_1 = __importDefault(require("long"));
/* eslint-disable @typescript-eslint/no-explicit-any */
function generateQueryPath(url, params) {
    const definedEntries = Object.entries(params).filter(([_key, value]) => value !== undefined);
    if (!definedEntries.length) {
        return url;
    }
    const paramsString = definedEntries
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
    return `${url}?${paramsString}`;
}
exports.generateQueryPath = generateQueryPath;
function parseToPrimitives(x) {
    if (typeof x === 'number' || typeof x === 'string' || typeof x === 'boolean' || x === null) {
        return x;
    }
    if (Array.isArray(x)) {
        return x.map((item) => parseToPrimitives(item));
    }
    if (long_1.default.isLong(x)) {
        return x.toString();
    }
    if (x instanceof Uint8Array) {
        return bytesToBigInt(x).toString();
    }
    if (x instanceof Date) {
        return x.toString();
    }
    if (typeof x === 'object') {
        const parsedObj = {};
        // eslint-disable-next-line no-restricted-syntax
        for (const key in x) {
            if (Object.prototype.hasOwnProperty.call(x, key)) {
                parsedObj[key] = parseToPrimitives(x[key]);
            }
        }
        return parsedObj;
    }
    if (typeof x === 'bigint') {
        return x.toString();
    }
    throw new Error(`Unsupported data type: ${typeof x}`);
}
exports.parseToPrimitives = parseToPrimitives;
/**
 * Converts a byte array (representing an arbitrary-size signed integer) into a bigint.
 * @param u Array of bytes represented as a Uint8Array.
 */
function bytesToBigInt(u) {
    if (u.length <= 1) {
        return BigInt(0);
    }
    // eslint-disable-next-line no-bitwise
    const negated = (u[0] & 1) === 1;
    const hex = Buffer.from(u.slice(1)).toString('hex');
    const abs = BigInt(`0x${hex}`);
    return negated ? -abs : abs;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC1oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NsaWVudHMvaGVscGVycy9yZXF1ZXN0LWhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0RBQXdCO0FBRXhCLHVEQUF1RDtBQUN2RCxTQUFnQixpQkFBaUIsQ0FBQyxHQUFXLEVBQUUsTUFBVTtJQUN2RCxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FDbEQsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQW9CLEVBQUUsRUFBRSxDQUFDLEtBQUssS0FBSyxTQUFTLENBQzFELENBQUM7SUFFRixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRTtRQUMxQixPQUFPLEdBQUcsQ0FBQztLQUNaO0lBRUQsTUFBTSxZQUFZLEdBQUcsY0FBYztTQUNoQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQW9CLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1NBQzNELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNiLE9BQU8sR0FBRyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7QUFDbEMsQ0FBQztBQWJELDhDQWFDO0FBRUQsU0FBZ0IsaUJBQWlCLENBQUksQ0FBSTtJQUN2QyxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssU0FBUyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDMUYsT0FBTyxDQUFDLENBQUM7S0FDVjtJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNwQixPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFNLENBQUM7S0FDdEQ7SUFFRCxJQUFJLGNBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDbEIsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFPLENBQUM7S0FDMUI7SUFFRCxJQUFJLENBQUMsWUFBWSxVQUFVLEVBQUU7UUFDM0IsT0FBTyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFPLENBQUM7S0FDekM7SUFFRCxJQUFJLENBQUMsWUFBWSxJQUFJLEVBQUU7UUFDckIsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFPLENBQUM7S0FDMUI7SUFFRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsRUFBRTtRQUN6QixNQUFNLFNBQVMsR0FBMkIsRUFBRSxDQUFDO1FBQzdDLGdEQUFnRDtRQUNoRCxLQUFLLE1BQU0sR0FBRyxJQUFJLENBQUMsRUFBRTtZQUNuQixJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ2hELFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxpQkFBaUIsQ0FBRSxDQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUNyRDtTQUNGO1FBQ0QsT0FBTyxTQUFjLENBQUM7S0FDdkI7SUFFRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsRUFBRTtRQUN6QixPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQU8sQ0FBQztLQUMxQjtJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBckNELDhDQXFDQztBQUVEOzs7R0FHRztBQUNILFNBQVMsYUFBYSxDQUFDLENBQWE7SUFDbEMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtRQUNqQixPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsQjtJQUNELHNDQUFzQztJQUN0QyxNQUFNLE9BQU8sR0FBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUMsTUFBTSxHQUFHLEdBQVcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVELE1BQU0sR0FBRyxHQUFXLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDdkMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDOUIsQ0FBQyJ9