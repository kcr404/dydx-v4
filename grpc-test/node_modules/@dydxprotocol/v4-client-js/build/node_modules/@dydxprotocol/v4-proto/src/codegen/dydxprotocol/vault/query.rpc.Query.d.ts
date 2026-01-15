import { Rpc } from "../../helpers";
import { QueryClient } from "@cosmjs/stargate";
import { QueryParamsRequest, QueryParamsResponse, QueryVaultRequest, QueryVaultResponse, QueryAllVaultsRequest, QueryAllVaultsResponse, QueryMegavaultTotalSharesRequest, QueryMegavaultTotalSharesResponse, QueryMegavaultOwnerSharesRequest, QueryMegavaultOwnerSharesResponse, QueryMegavaultAllOwnerSharesRequest, QueryMegavaultAllOwnerSharesResponse, QueryVaultParamsRequest, QueryVaultParamsResponse, QueryMegavaultWithdrawalInfoRequest, QueryMegavaultWithdrawalInfoResponse } from "./query";
/** Query defines the gRPC querier service. */
export interface Query {
    /** Queries the Params. */
    params(request?: QueryParamsRequest): Promise<QueryParamsResponse>;
    /** Queries a Vault by type and number. */
    vault(request: QueryVaultRequest): Promise<QueryVaultResponse>;
    /** Queries all vaults. */
    allVaults(request?: QueryAllVaultsRequest): Promise<QueryAllVaultsResponse>;
    /** Queries total shares of megavault. */
    megavaultTotalShares(request?: QueryMegavaultTotalSharesRequest): Promise<QueryMegavaultTotalSharesResponse>;
    /** Queries owner shares of megavault. */
    megavaultOwnerShares(request: QueryMegavaultOwnerSharesRequest): Promise<QueryMegavaultOwnerSharesResponse>;
    /** Queries all owner shares of megavault. */
    megavaultAllOwnerShares(request?: QueryMegavaultAllOwnerSharesRequest): Promise<QueryMegavaultAllOwnerSharesResponse>;
    /** Queries vault params of a vault. */
    vaultParams(request: QueryVaultParamsRequest): Promise<QueryVaultParamsResponse>;
    /** Queries withdrawal info for megavault. */
    megavaultWithdrawalInfo(request: QueryMegavaultWithdrawalInfoRequest): Promise<QueryMegavaultWithdrawalInfoResponse>;
}
export declare class QueryClientImpl implements Query {
    private readonly rpc;
    constructor(rpc: Rpc);
    params(request?: QueryParamsRequest): Promise<QueryParamsResponse>;
    vault(request: QueryVaultRequest): Promise<QueryVaultResponse>;
    allVaults(request?: QueryAllVaultsRequest): Promise<QueryAllVaultsResponse>;
    megavaultTotalShares(request?: QueryMegavaultTotalSharesRequest): Promise<QueryMegavaultTotalSharesResponse>;
    megavaultOwnerShares(request: QueryMegavaultOwnerSharesRequest): Promise<QueryMegavaultOwnerSharesResponse>;
    megavaultAllOwnerShares(request?: QueryMegavaultAllOwnerSharesRequest): Promise<QueryMegavaultAllOwnerSharesResponse>;
    vaultParams(request: QueryVaultParamsRequest): Promise<QueryVaultParamsResponse>;
    megavaultWithdrawalInfo(request: QueryMegavaultWithdrawalInfoRequest): Promise<QueryMegavaultWithdrawalInfoResponse>;
}
export declare const createRpcQueryExtension: (base: QueryClient) => {
    params(request?: QueryParamsRequest): Promise<QueryParamsResponse>;
    vault(request: QueryVaultRequest): Promise<QueryVaultResponse>;
    allVaults(request?: QueryAllVaultsRequest): Promise<QueryAllVaultsResponse>;
    megavaultTotalShares(request?: QueryMegavaultTotalSharesRequest): Promise<QueryMegavaultTotalSharesResponse>;
    megavaultOwnerShares(request: QueryMegavaultOwnerSharesRequest): Promise<QueryMegavaultOwnerSharesResponse>;
    megavaultAllOwnerShares(request?: QueryMegavaultAllOwnerSharesRequest): Promise<QueryMegavaultAllOwnerSharesResponse>;
    vaultParams(request: QueryVaultParamsRequest): Promise<QueryVaultParamsResponse>;
    megavaultWithdrawalInfo(request: QueryMegavaultWithdrawalInfoRequest): Promise<QueryMegavaultWithdrawalInfoResponse>;
};
