import { Response } from './lib/axios';
import RestClient from './modules/rest';
export declare class FaucetClient extends RestClient {
    /**
     * @description For testnet only, add USDC to an subaccount
     *
     * @returns The HTTP response.
     */
    fill(address: string, subaccountNumber: number, amount: number, headers?: {}): Promise<Response>;
    /**
     * @description For testnet only, add native tokens to an address
     * @param address destination address for native tokens
     * @param headers requestHeaders
     * @returns The HTTP response.
     */
    fillNative(address: string, headers?: {}): Promise<Response>;
}
