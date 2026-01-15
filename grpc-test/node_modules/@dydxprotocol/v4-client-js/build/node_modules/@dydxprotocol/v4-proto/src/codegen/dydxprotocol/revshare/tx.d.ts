import { MarketMapperRevenueShareParams, MarketMapperRevenueShareParamsSDKType } from "./params";
import { MarketMapperRevShareDetails, MarketMapperRevShareDetailsSDKType, UnconditionalRevShareConfig, UnconditionalRevShareConfigSDKType } from "./revshare";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** Message to set the market mapper revenue share */
export interface MsgSetMarketMapperRevenueShare {
    authority: string;
    /** Parameters for the revenue share */
    params?: MarketMapperRevenueShareParams;
}
/** Message to set the market mapper revenue share */
export interface MsgSetMarketMapperRevenueShareSDKType {
    authority: string;
    params?: MarketMapperRevenueShareParamsSDKType;
}
/** Response to a MsgSetMarketMapperRevenueShare */
export interface MsgSetMarketMapperRevenueShareResponse {
}
/** Response to a MsgSetMarketMapperRevenueShare */
export interface MsgSetMarketMapperRevenueShareResponseSDKType {
}
/**
 * Msg to set market mapper revenue share details (e.g. expiration timestamp)
 * for a specific market. To be used as an override for existing revenue share
 * settings set by the MsgSetMarketMapperRevenueShare msg
 */
export interface MsgSetMarketMapperRevShareDetailsForMarket {
    authority: string;
    /** The market ID for which to set the revenue share details */
    marketId: number;
    /** Parameters for the revenue share details */
    params?: MarketMapperRevShareDetails;
}
/**
 * Msg to set market mapper revenue share details (e.g. expiration timestamp)
 * for a specific market. To be used as an override for existing revenue share
 * settings set by the MsgSetMarketMapperRevenueShare msg
 */
export interface MsgSetMarketMapperRevShareDetailsForMarketSDKType {
    authority: string;
    market_id: number;
    params?: MarketMapperRevShareDetailsSDKType;
}
/** Response to a MsgSetMarketMapperRevShareDetailsForMarket */
export interface MsgSetMarketMapperRevShareDetailsForMarketResponse {
}
/** Response to a MsgSetMarketMapperRevShareDetailsForMarket */
export interface MsgSetMarketMapperRevShareDetailsForMarketResponseSDKType {
}
/** Message to update the unconditional revenue share config. */
export interface MsgUpdateUnconditionalRevShareConfig {
    authority: string;
    /** The config to update. */
    config?: UnconditionalRevShareConfig;
}
/** Message to update the unconditional revenue share config. */
export interface MsgUpdateUnconditionalRevShareConfigSDKType {
    authority: string;
    config?: UnconditionalRevShareConfigSDKType;
}
/** Response to MsgUpdateUnconditionalRevShareConfig */
export interface MsgUpdateUnconditionalRevShareConfigResponse {
}
/** Response to MsgUpdateUnconditionalRevShareConfig */
export interface MsgUpdateUnconditionalRevShareConfigResponseSDKType {
}
export declare const MsgSetMarketMapperRevenueShare: {
    encode(message: MsgSetMarketMapperRevenueShare, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetMarketMapperRevenueShare;
    fromPartial(object: DeepPartial<MsgSetMarketMapperRevenueShare>): MsgSetMarketMapperRevenueShare;
};
export declare const MsgSetMarketMapperRevenueShareResponse: {
    encode(_: MsgSetMarketMapperRevenueShareResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetMarketMapperRevenueShareResponse;
    fromPartial(_: DeepPartial<MsgSetMarketMapperRevenueShareResponse>): MsgSetMarketMapperRevenueShareResponse;
};
export declare const MsgSetMarketMapperRevShareDetailsForMarket: {
    encode(message: MsgSetMarketMapperRevShareDetailsForMarket, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetMarketMapperRevShareDetailsForMarket;
    fromPartial(object: DeepPartial<MsgSetMarketMapperRevShareDetailsForMarket>): MsgSetMarketMapperRevShareDetailsForMarket;
};
export declare const MsgSetMarketMapperRevShareDetailsForMarketResponse: {
    encode(_: MsgSetMarketMapperRevShareDetailsForMarketResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetMarketMapperRevShareDetailsForMarketResponse;
    fromPartial(_: DeepPartial<MsgSetMarketMapperRevShareDetailsForMarketResponse>): MsgSetMarketMapperRevShareDetailsForMarketResponse;
};
export declare const MsgUpdateUnconditionalRevShareConfig: {
    encode(message: MsgUpdateUnconditionalRevShareConfig, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateUnconditionalRevShareConfig;
    fromPartial(object: DeepPartial<MsgUpdateUnconditionalRevShareConfig>): MsgUpdateUnconditionalRevShareConfig;
};
export declare const MsgUpdateUnconditionalRevShareConfigResponse: {
    encode(_: MsgUpdateUnconditionalRevShareConfigResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateUnconditionalRevShareConfigResponse;
    fromPartial(_: DeepPartial<MsgUpdateUnconditionalRevShareConfigResponse>): MsgUpdateUnconditionalRevShareConfigResponse;
};
