/// <reference types="long" />
import * as _m0 from "protobufjs/minimal";
import { DeepPartial, Long } from "../../helpers";
/** AffiliateTiers defines the affiliate tiers. */
export interface AffiliateTiers {
    /** All affiliate tiers */
    tiers: AffiliateTiers_Tier[];
}
/** AffiliateTiers defines the affiliate tiers. */
export interface AffiliateTiersSDKType {
    tiers: AffiliateTiers_TierSDKType[];
}
/** Tier defines an affiliate tier. */
export interface AffiliateTiers_Tier {
    /** Required all-time referred volume in quote quantums. */
    reqReferredVolumeQuoteQuantums: Long;
    /** Required currently staked native tokens (in whole coins). */
    reqStakedWholeCoins: number;
    /** Taker fee share in parts-per-million. */
    takerFeeSharePpm: number;
}
/** Tier defines an affiliate tier. */
export interface AffiliateTiers_TierSDKType {
    req_referred_volume_quote_quantums: Long;
    req_staked_whole_coins: number;
    taker_fee_share_ppm: number;
}
/**
 * AffiliateWhitelist specifies the whitelisted affiliates.
 * If an address is in the whitelist, then the affiliate fee share in
 * this object will override fee share from the regular affiliate tiers above.
 */
export interface AffiliateWhitelist {
    /** All affiliate whitelist tiers. */
    tiers: AffiliateWhitelist_Tier[];
}
/**
 * AffiliateWhitelist specifies the whitelisted affiliates.
 * If an address is in the whitelist, then the affiliate fee share in
 * this object will override fee share from the regular affiliate tiers above.
 */
export interface AffiliateWhitelistSDKType {
    tiers: AffiliateWhitelist_TierSDKType[];
}
/** Tier defines an affiliate whitelist tier. */
export interface AffiliateWhitelist_Tier {
    /** List of unique whitelisted addresses. */
    addresses: string[];
    /** Taker fee share in parts-per-million. */
    takerFeeSharePpm: number;
}
/** Tier defines an affiliate whitelist tier. */
export interface AffiliateWhitelist_TierSDKType {
    addresses: string[];
    taker_fee_share_ppm: number;
}
export declare const AffiliateTiers: {
    encode(message: AffiliateTiers, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AffiliateTiers;
    fromPartial(object: DeepPartial<AffiliateTiers>): AffiliateTiers;
};
export declare const AffiliateTiers_Tier: {
    encode(message: AffiliateTiers_Tier, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AffiliateTiers_Tier;
    fromPartial(object: DeepPartial<AffiliateTiers_Tier>): AffiliateTiers_Tier;
};
export declare const AffiliateWhitelist: {
    encode(message: AffiliateWhitelist, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AffiliateWhitelist;
    fromPartial(object: DeepPartial<AffiliateWhitelist>): AffiliateWhitelist;
};
export declare const AffiliateWhitelist_Tier: {
    encode(message: AffiliateWhitelist_Tier, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AffiliateWhitelist_Tier;
    fromPartial(object: DeepPartial<AffiliateWhitelist_Tier>): AffiliateWhitelist_Tier;
};
