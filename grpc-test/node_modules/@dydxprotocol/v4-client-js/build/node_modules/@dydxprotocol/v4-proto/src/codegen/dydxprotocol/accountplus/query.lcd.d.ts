import { LCDClient } from "@osmonauts/lcd";
import { QueryParamsRequest, QueryParamsResponseSDKType, GetAuthenticatorRequest, GetAuthenticatorResponseSDKType, GetAuthenticatorsRequest, GetAuthenticatorsResponseSDKType } from "./query";
export declare class LCDQueryClient {
    req: LCDClient;
    constructor({ requestClient }: {
        requestClient: LCDClient;
    });
    params(_params?: QueryParamsRequest): Promise<QueryParamsResponseSDKType>;
    getAuthenticator(params: GetAuthenticatorRequest): Promise<GetAuthenticatorResponseSDKType>;
    getAuthenticators(params: GetAuthenticatorsRequest): Promise<GetAuthenticatorsResponseSDKType>;
}
