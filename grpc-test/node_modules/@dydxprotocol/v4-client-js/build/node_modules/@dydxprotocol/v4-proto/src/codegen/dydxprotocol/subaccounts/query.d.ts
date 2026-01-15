import { PageRequest, PageRequestSDKType, PageResponse, PageResponseSDKType } from "../../cosmos/base/query/v1beta1/pagination";
import { Subaccount, SubaccountSDKType } from "./subaccount";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** QueryGetSubaccountRequest is request type for the Query RPC method. */
export interface QueryGetSubaccountRequest {
    owner: string;
    number: number;
}
/** QueryGetSubaccountRequest is request type for the Query RPC method. */
export interface QueryGetSubaccountRequestSDKType {
    owner: string;
    number: number;
}
/** QuerySubaccountResponse is response type for the Query RPC method. */
export interface QuerySubaccountResponse {
    subaccount?: Subaccount;
}
/** QuerySubaccountResponse is response type for the Query RPC method. */
export interface QuerySubaccountResponseSDKType {
    subaccount?: SubaccountSDKType;
}
/** QueryAllSubaccountRequest is request type for the Query RPC method. */
export interface QueryAllSubaccountRequest {
    pagination?: PageRequest;
}
/** QueryAllSubaccountRequest is request type for the Query RPC method. */
export interface QueryAllSubaccountRequestSDKType {
    pagination?: PageRequestSDKType;
}
/** QuerySubaccountAllResponse is response type for the Query RPC method. */
export interface QuerySubaccountAllResponse {
    subaccount: Subaccount[];
    pagination?: PageResponse;
}
/** QuerySubaccountAllResponse is response type for the Query RPC method. */
export interface QuerySubaccountAllResponseSDKType {
    subaccount: SubaccountSDKType[];
    pagination?: PageResponseSDKType;
}
/**
 * QueryGetWithdrawalAndTransfersBlockedInfoRequest is a request type for
 * fetching information about whether withdrawals and transfers are blocked for
 * a collateral pool associated with the passed in perpetual id.
 */
export interface QueryGetWithdrawalAndTransfersBlockedInfoRequest {
    perpetualId: number;
}
/**
 * QueryGetWithdrawalAndTransfersBlockedInfoRequest is a request type for
 * fetching information about whether withdrawals and transfers are blocked for
 * a collateral pool associated with the passed in perpetual id.
 */
export interface QueryGetWithdrawalAndTransfersBlockedInfoRequestSDKType {
    perpetual_id: number;
}
/**
 * QueryGetWithdrawalAndTransfersBlockedInfoRequest is a response type for
 * fetching information about whether withdrawals and transfers are blocked.
 */
export interface QueryGetWithdrawalAndTransfersBlockedInfoResponse {
    negativeTncSubaccountSeenAtBlock: number;
    chainOutageSeenAtBlock: number;
    withdrawalsAndTransfersUnblockedAtBlock: number;
}
/**
 * QueryGetWithdrawalAndTransfersBlockedInfoRequest is a response type for
 * fetching information about whether withdrawals and transfers are blocked.
 */
export interface QueryGetWithdrawalAndTransfersBlockedInfoResponseSDKType {
    negative_tnc_subaccount_seen_at_block: number;
    chain_outage_seen_at_block: number;
    withdrawals_and_transfers_unblocked_at_block: number;
}
/**
 * QueryCollateralPoolAddressRequest is the request type for fetching the
 * account address of the collateral pool associated with the passed in
 * perpetual id.
 */
export interface QueryCollateralPoolAddressRequest {
    /**
     * QueryCollateralPoolAddressRequest is the request type for fetching the
     * account address of the collateral pool associated with the passed in
     * perpetual id.
     */
    perpetualId: number;
}
/**
 * QueryCollateralPoolAddressRequest is the request type for fetching the
 * account address of the collateral pool associated with the passed in
 * perpetual id.
 */
export interface QueryCollateralPoolAddressRequestSDKType {
    perpetual_id: number;
}
/**
 * QueryCollateralPoolAddressResponse is a response type for fetching the
 * account address of the collateral pool associated with the passed in
 * perpetual id.
 */
export interface QueryCollateralPoolAddressResponse {
    collateralPoolAddress: string;
}
/**
 * QueryCollateralPoolAddressResponse is a response type for fetching the
 * account address of the collateral pool associated with the passed in
 * perpetual id.
 */
export interface QueryCollateralPoolAddressResponseSDKType {
    collateral_pool_address: string;
}
export declare const QueryGetSubaccountRequest: {
    encode(message: QueryGetSubaccountRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryGetSubaccountRequest;
    fromPartial(object: DeepPartial<QueryGetSubaccountRequest>): QueryGetSubaccountRequest;
};
export declare const QuerySubaccountResponse: {
    encode(message: QuerySubaccountResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QuerySubaccountResponse;
    fromPartial(object: DeepPartial<QuerySubaccountResponse>): QuerySubaccountResponse;
};
export declare const QueryAllSubaccountRequest: {
    encode(message: QueryAllSubaccountRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryAllSubaccountRequest;
    fromPartial(object: DeepPartial<QueryAllSubaccountRequest>): QueryAllSubaccountRequest;
};
export declare const QuerySubaccountAllResponse: {
    encode(message: QuerySubaccountAllResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QuerySubaccountAllResponse;
    fromPartial(object: DeepPartial<QuerySubaccountAllResponse>): QuerySubaccountAllResponse;
};
export declare const QueryGetWithdrawalAndTransfersBlockedInfoRequest: {
    encode(message: QueryGetWithdrawalAndTransfersBlockedInfoRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryGetWithdrawalAndTransfersBlockedInfoRequest;
    fromPartial(object: DeepPartial<QueryGetWithdrawalAndTransfersBlockedInfoRequest>): QueryGetWithdrawalAndTransfersBlockedInfoRequest;
};
export declare const QueryGetWithdrawalAndTransfersBlockedInfoResponse: {
    encode(message: QueryGetWithdrawalAndTransfersBlockedInfoResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryGetWithdrawalAndTransfersBlockedInfoResponse;
    fromPartial(object: DeepPartial<QueryGetWithdrawalAndTransfersBlockedInfoResponse>): QueryGetWithdrawalAndTransfersBlockedInfoResponse;
};
export declare const QueryCollateralPoolAddressRequest: {
    encode(message: QueryCollateralPoolAddressRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryCollateralPoolAddressRequest;
    fromPartial(object: DeepPartial<QueryCollateralPoolAddressRequest>): QueryCollateralPoolAddressRequest;
};
export declare const QueryCollateralPoolAddressResponse: {
    encode(message: QueryCollateralPoolAddressResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryCollateralPoolAddressResponse;
    fromPartial(object: DeepPartial<QueryCollateralPoolAddressResponse>): QueryCollateralPoolAddressResponse;
};
