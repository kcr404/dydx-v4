import { ListingVaultDepositParams, ListingVaultDepositParamsSDKType } from "./params";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** Queries for the hard cap on listed markets */
export interface QueryMarketsHardCap {
}
/** Queries for the hard cap on listed markets */
export interface QueryMarketsHardCapSDKType {
}
/** Response type indicating the hard cap on listed markets */
export interface QueryMarketsHardCapResponse {
    /** Response type indicating the hard cap on listed markets */
    hardCap: number;
}
/** Response type indicating the hard cap on listed markets */
export interface QueryMarketsHardCapResponseSDKType {
    hard_cap: number;
}
/** Queries the listing vault deposit params */
export interface QueryListingVaultDepositParams {
}
/** Queries the listing vault deposit params */
export interface QueryListingVaultDepositParamsSDKType {
}
/** Response type for QueryListingVaultDepositParams */
export interface QueryListingVaultDepositParamsResponse {
    params?: ListingVaultDepositParams;
}
/** Response type for QueryListingVaultDepositParams */
export interface QueryListingVaultDepositParamsResponseSDKType {
    params?: ListingVaultDepositParamsSDKType;
}
export declare const QueryMarketsHardCap: {
    encode(_: QueryMarketsHardCap, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryMarketsHardCap;
    fromPartial(_: DeepPartial<QueryMarketsHardCap>): QueryMarketsHardCap;
};
export declare const QueryMarketsHardCapResponse: {
    encode(message: QueryMarketsHardCapResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryMarketsHardCapResponse;
    fromPartial(object: DeepPartial<QueryMarketsHardCapResponse>): QueryMarketsHardCapResponse;
};
export declare const QueryListingVaultDepositParams: {
    encode(_: QueryListingVaultDepositParams, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryListingVaultDepositParams;
    fromPartial(_: DeepPartial<QueryListingVaultDepositParams>): QueryListingVaultDepositParams;
};
export declare const QueryListingVaultDepositParamsResponse: {
    encode(message: QueryListingVaultDepositParamsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryListingVaultDepositParamsResponse;
    fromPartial(object: DeepPartial<QueryListingVaultDepositParamsResponse>): QueryListingVaultDepositParamsResponse;
};
