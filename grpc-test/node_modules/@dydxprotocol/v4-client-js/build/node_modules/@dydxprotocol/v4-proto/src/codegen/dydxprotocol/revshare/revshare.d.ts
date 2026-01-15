/// <reference types="long" />
import { Long, DeepPartial } from "../../helpers";
import * as _m0 from "protobufjs/minimal";
/**
 * MarketMapperRevShareDetails specifies any details associated with the market
 * mapper revenue share
 */
export interface MarketMapperRevShareDetails {
    /** Unix timestamp recorded when the market revenue share expires */
    expirationTs: Long;
}
/**
 * MarketMapperRevShareDetails specifies any details associated with the market
 * mapper revenue share
 */
export interface MarketMapperRevShareDetailsSDKType {
    expiration_ts: Long;
}
/**
 * UnconditionalRevShareConfig stores recipients that
 * receive a share of net revenue unconditionally.
 */
export interface UnconditionalRevShareConfig {
    /** Configs for each recipient. */
    configs: UnconditionalRevShareConfig_RecipientConfig[];
}
/**
 * UnconditionalRevShareConfig stores recipients that
 * receive a share of net revenue unconditionally.
 */
export interface UnconditionalRevShareConfigSDKType {
    configs: UnconditionalRevShareConfig_RecipientConfigSDKType[];
}
/** Describes the config of a recipient */
export interface UnconditionalRevShareConfig_RecipientConfig {
    /** Address of the recepient. */
    address: string;
    /** Percentage of net revenue to share with recipient, in parts-per-million. */
    sharePpm: number;
}
/** Describes the config of a recipient */
export interface UnconditionalRevShareConfig_RecipientConfigSDKType {
    address: string;
    share_ppm: number;
}
export declare const MarketMapperRevShareDetails: {
    encode(message: MarketMapperRevShareDetails, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MarketMapperRevShareDetails;
    fromPartial(object: DeepPartial<MarketMapperRevShareDetails>): MarketMapperRevShareDetails;
};
export declare const UnconditionalRevShareConfig: {
    encode(message: UnconditionalRevShareConfig, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UnconditionalRevShareConfig;
    fromPartial(object: DeepPartial<UnconditionalRevShareConfig>): UnconditionalRevShareConfig;
};
export declare const UnconditionalRevShareConfig_RecipientConfig: {
    encode(message: UnconditionalRevShareConfig_RecipientConfig, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UnconditionalRevShareConfig_RecipientConfig;
    fromPartial(object: DeepPartial<UnconditionalRevShareConfig_RecipientConfig>): UnconditionalRevShareConfig_RecipientConfig;
};
