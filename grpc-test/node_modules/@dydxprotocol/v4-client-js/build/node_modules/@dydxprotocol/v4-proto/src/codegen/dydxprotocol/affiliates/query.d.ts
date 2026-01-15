import { AffiliateTiers, AffiliateTiersSDKType, AffiliateWhitelist, AffiliateWhitelistSDKType } from "./affiliates";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/**
 * AffiliateInfoRequest is the request type for the Query/AffiliateInfo RPC
 * method.
 */
export interface AffiliateInfoRequest {
    address: string;
}
/**
 * AffiliateInfoRequest is the request type for the Query/AffiliateInfo RPC
 * method.
 */
export interface AffiliateInfoRequestSDKType {
    address: string;
}
/**
 * AffiliateInfoResponse is the response type for the Query/AffiliateInfo RPC
 * method.
 */
export interface AffiliateInfoResponse {
    /** Whether the address is a whitelisted affiliate (VIP). */
    isWhitelisted: boolean;
    /**
     * If `is_whiteslisted == false`, the affiliate's tier qualified through
     * regular affiliate program.
     */
    tier: number;
    /**
     * The affiliate's taker fee share in parts-per-million (for both VIP and
     * regular affiliate).
     */
    feeSharePpm: number;
    /** The affiliate's all-time referred volume in quote quantums. */
    referredVolume: Uint8Array;
    /** The affiliate's currently staked native tokens (in whole coins). */
    stakedAmount: Uint8Array;
}
/**
 * AffiliateInfoResponse is the response type for the Query/AffiliateInfo RPC
 * method.
 */
export interface AffiliateInfoResponseSDKType {
    is_whitelisted: boolean;
    tier: number;
    fee_share_ppm: number;
    referred_volume: Uint8Array;
    staked_amount: Uint8Array;
}
/** ReferredByRequest is the request type for the Query/ReferredBy RPC method. */
export interface ReferredByRequest {
    /** The address to query. */
    address: string;
}
/** ReferredByRequest is the request type for the Query/ReferredBy RPC method. */
export interface ReferredByRequestSDKType {
    address: string;
}
/** ReferredByResponse is the response type for the Query/ReferredBy RPC method. */
export interface ReferredByResponse {
    /** The affiliate's address that referred the queried address. */
    affiliateAddress: string;
}
/** ReferredByResponse is the response type for the Query/ReferredBy RPC method. */
export interface ReferredByResponseSDKType {
    affiliate_address: string;
}
/**
 * AllAffiliateTiersRequest is the request type for the Query/AllAffiliateTiers
 * RPC method.
 */
export interface AllAffiliateTiersRequest {
}
/**
 * AllAffiliateTiersRequest is the request type for the Query/AllAffiliateTiers
 * RPC method.
 */
export interface AllAffiliateTiersRequestSDKType {
}
/**
 * AllAffiliateTiersResponse is the response type for the
 * Query/AllAffiliateTiers RPC method.
 */
export interface AllAffiliateTiersResponse {
    /** All affiliate tiers information. */
    tiers?: AffiliateTiers;
}
/**
 * AllAffiliateTiersResponse is the response type for the
 * Query/AllAffiliateTiers RPC method.
 */
export interface AllAffiliateTiersResponseSDKType {
    tiers?: AffiliateTiersSDKType;
}
/**
 * AffiliateWhitelistRequest is the request type for the
 * Query/AffiliateWhitelist RPC method.
 */
export interface AffiliateWhitelistRequest {
}
/**
 * AffiliateWhitelistRequest is the request type for the
 * Query/AffiliateWhitelist RPC method.
 */
export interface AffiliateWhitelistRequestSDKType {
}
/**
 * AffiliateWhitelistResponse is the response type for the
 * Query/AffiliateWhitelist RPC method.
 */
export interface AffiliateWhitelistResponse {
    whitelist?: AffiliateWhitelist;
}
/**
 * AffiliateWhitelistResponse is the response type for the
 * Query/AffiliateWhitelist RPC method.
 */
export interface AffiliateWhitelistResponseSDKType {
    whitelist?: AffiliateWhitelistSDKType;
}
export declare const AffiliateInfoRequest: {
    encode(message: AffiliateInfoRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AffiliateInfoRequest;
    fromPartial(object: DeepPartial<AffiliateInfoRequest>): AffiliateInfoRequest;
};
export declare const AffiliateInfoResponse: {
    encode(message: AffiliateInfoResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AffiliateInfoResponse;
    fromPartial(object: DeepPartial<AffiliateInfoResponse>): AffiliateInfoResponse;
};
export declare const ReferredByRequest: {
    encode(message: ReferredByRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ReferredByRequest;
    fromPartial(object: DeepPartial<ReferredByRequest>): ReferredByRequest;
};
export declare const ReferredByResponse: {
    encode(message: ReferredByResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ReferredByResponse;
    fromPartial(object: DeepPartial<ReferredByResponse>): ReferredByResponse;
};
export declare const AllAffiliateTiersRequest: {
    encode(_: AllAffiliateTiersRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AllAffiliateTiersRequest;
    fromPartial(_: DeepPartial<AllAffiliateTiersRequest>): AllAffiliateTiersRequest;
};
export declare const AllAffiliateTiersResponse: {
    encode(message: AllAffiliateTiersResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AllAffiliateTiersResponse;
    fromPartial(object: DeepPartial<AllAffiliateTiersResponse>): AllAffiliateTiersResponse;
};
export declare const AffiliateWhitelistRequest: {
    encode(_: AffiliateWhitelistRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AffiliateWhitelistRequest;
    fromPartial(_: DeepPartial<AffiliateWhitelistRequest>): AffiliateWhitelistRequest;
};
export declare const AffiliateWhitelistResponse: {
    encode(message: AffiliateWhitelistResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AffiliateWhitelistResponse;
    fromPartial(object: DeepPartial<AffiliateWhitelistResponse>): AffiliateWhitelistResponse;
};
