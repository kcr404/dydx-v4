import { AffiliateTiers, AffiliateTiersSDKType, AffiliateWhitelist, AffiliateWhitelistSDKType } from "./affiliates";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** Message to register a referee-affiliate relationship */
export interface MsgRegisterAffiliate {
    /** Address of the referee */
    referee: string;
    /** Address of the affiliate */
    affiliate: string;
}
/** Message to register a referee-affiliate relationship */
export interface MsgRegisterAffiliateSDKType {
    referee: string;
    affiliate: string;
}
/** Response to MsgRegisterAffiliate */
export interface MsgRegisterAffiliateResponse {
}
/** Response to MsgRegisterAffiliate */
export interface MsgRegisterAffiliateResponseSDKType {
}
/** Message to update affiliate tiers */
export interface MsgUpdateAffiliateTiers {
    /** Authority sending this message. Will be sent by gov */
    authority: string;
    /** Updated affiliate tiers information */
    tiers?: AffiliateTiers;
}
/** Message to update affiliate tiers */
export interface MsgUpdateAffiliateTiersSDKType {
    authority: string;
    tiers?: AffiliateTiersSDKType;
}
/** Response to MsgUpdateAffiliateTiers */
export interface MsgUpdateAffiliateTiersResponse {
}
/** Response to MsgUpdateAffiliateTiers */
export interface MsgUpdateAffiliateTiersResponseSDKType {
}
/** Message to update affiliate whitelist */
export interface MsgUpdateAffiliateWhitelist {
    /** Authority sending this message. Will be sent by gov */
    authority: string;
    /** Updated affiliate whitelist information */
    whitelist?: AffiliateWhitelist;
}
/** Message to update affiliate whitelist */
export interface MsgUpdateAffiliateWhitelistSDKType {
    authority: string;
    whitelist?: AffiliateWhitelistSDKType;
}
/** Response to MsgUpdateAffiliateWhitelist */
export interface MsgUpdateAffiliateWhitelistResponse {
}
/** Response to MsgUpdateAffiliateWhitelist */
export interface MsgUpdateAffiliateWhitelistResponseSDKType {
}
export declare const MsgRegisterAffiliate: {
    encode(message: MsgRegisterAffiliate, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgRegisterAffiliate;
    fromPartial(object: DeepPartial<MsgRegisterAffiliate>): MsgRegisterAffiliate;
};
export declare const MsgRegisterAffiliateResponse: {
    encode(_: MsgRegisterAffiliateResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgRegisterAffiliateResponse;
    fromPartial(_: DeepPartial<MsgRegisterAffiliateResponse>): MsgRegisterAffiliateResponse;
};
export declare const MsgUpdateAffiliateTiers: {
    encode(message: MsgUpdateAffiliateTiers, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateAffiliateTiers;
    fromPartial(object: DeepPartial<MsgUpdateAffiliateTiers>): MsgUpdateAffiliateTiers;
};
export declare const MsgUpdateAffiliateTiersResponse: {
    encode(_: MsgUpdateAffiliateTiersResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateAffiliateTiersResponse;
    fromPartial(_: DeepPartial<MsgUpdateAffiliateTiersResponse>): MsgUpdateAffiliateTiersResponse;
};
export declare const MsgUpdateAffiliateWhitelist: {
    encode(message: MsgUpdateAffiliateWhitelist, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateAffiliateWhitelist;
    fromPartial(object: DeepPartial<MsgUpdateAffiliateWhitelist>): MsgUpdateAffiliateWhitelist;
};
export declare const MsgUpdateAffiliateWhitelistResponse: {
    encode(_: MsgUpdateAffiliateWhitelistResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateAffiliateWhitelistResponse;
    fromPartial(_: DeepPartial<MsgUpdateAffiliateWhitelistResponse>): MsgUpdateAffiliateWhitelistResponse;
};
