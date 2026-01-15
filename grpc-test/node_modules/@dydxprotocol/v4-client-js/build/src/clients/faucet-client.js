"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaucetClient = void 0;
const rest_1 = __importDefault(require("./modules/rest"));
class FaucetClient extends rest_1.default {
    /**
     * @description For testnet only, add USDC to an subaccount
     *
     * @returns The HTTP response.
     */
    async fill(address, subaccountNumber, amount, headers) {
        const uri = '/faucet/tokens';
        return this.post(uri, {}, {
            address,
            subaccountNumber,
            amount,
        }, headers);
    }
    /**
     * @description For testnet only, add native tokens to an address
     * @param address destination address for native tokens
     * @param headers requestHeaders
     * @returns The HTTP response.
     */
    async fillNative(address, headers) {
        const uri = '/faucet/native-token';
        return this.post(uri, {}, {
            address,
        }, headers);
    }
}
exports.FaucetClient = FaucetClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmF1Y2V0LWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnRzL2ZhdWNldC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsMERBQXdDO0FBRXhDLE1BQWEsWUFBYSxTQUFRLGNBQVU7SUFDMUM7Ozs7T0FJRztJQUNJLEtBQUssQ0FBQyxJQUFJLENBQ2YsT0FBZSxFQUNmLGdCQUF3QixFQUN4QixNQUFjLEVBQ2QsT0FBWTtRQUVaLE1BQU0sR0FBRyxHQUFHLGdCQUFnQixDQUFDO1FBRTdCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FDZCxHQUFHLEVBQ0gsRUFBRSxFQUNGO1lBQ0UsT0FBTztZQUNQLGdCQUFnQjtZQUNoQixNQUFNO1NBQ1AsRUFDRCxPQUFPLENBQ1IsQ0FBQztJQUNKLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZSxFQUFFLE9BQVk7UUFDbkQsTUFBTSxHQUFHLEdBQUcsc0JBQXNCLENBQUM7UUFFbkMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUNkLEdBQUcsRUFDSCxFQUFFLEVBQ0Y7WUFDRSxPQUFPO1NBQ1IsRUFDRCxPQUFPLENBQ1IsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQTVDRCxvQ0E0Q0MifQ==