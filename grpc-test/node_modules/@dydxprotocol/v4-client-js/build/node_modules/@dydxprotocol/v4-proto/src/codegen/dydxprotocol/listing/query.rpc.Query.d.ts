import { Rpc } from "../../helpers";
import { QueryClient } from "@cosmjs/stargate";
import { QueryMarketsHardCap, QueryMarketsHardCapResponse, QueryListingVaultDepositParams, QueryListingVaultDepositParamsResponse } from "./query";
/** Query defines the gRPC querier service. */
export interface Query {
    /** Queries for the hard cap number of listed markets */
    marketsHardCap(request?: QueryMarketsHardCap): Promise<QueryMarketsHardCapResponse>;
    /** Queries the listing vault deposit params */
    listingVaultDepositParams(request?: QueryListingVaultDepositParams): Promise<QueryListingVaultDepositParamsResponse>;
}
export declare class QueryClientImpl implements Query {
    private readonly rpc;
    constructor(rpc: Rpc);
    marketsHardCap(request?: QueryMarketsHardCap): Promise<QueryMarketsHardCapResponse>;
    listingVaultDepositParams(request?: QueryListingVaultDepositParams): Promise<QueryListingVaultDepositParamsResponse>;
}
export declare const createRpcQueryExtension: (base: QueryClient) => {
    marketsHardCap(request?: QueryMarketsHardCap): Promise<QueryMarketsHardCapResponse>;
    listingVaultDepositParams(request?: QueryListingVaultDepositParams): Promise<QueryListingVaultDepositParamsResponse>;
};
