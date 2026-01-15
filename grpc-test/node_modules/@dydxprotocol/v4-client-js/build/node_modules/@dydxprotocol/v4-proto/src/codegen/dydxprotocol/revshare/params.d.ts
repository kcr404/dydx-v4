import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** MarketMappeRevenueShareParams represents params for the above message */
export interface MarketMapperRevenueShareParams {
    /** The address which will receive the revenue share payouts */
    address: string;
    /**
     * The fraction of the fees which will go to the above mentioned address.
     * In parts-per-million
     */
    revenueSharePpm: number;
    /**
     * This parameter defines how many days post market initiation will the
     * revenue share be applied for. After valid_days from market initiation
     * the revenue share goes down to 0
     */
    validDays: number;
}
/** MarketMappeRevenueShareParams represents params for the above message */
export interface MarketMapperRevenueShareParamsSDKType {
    address: string;
    revenue_share_ppm: number;
    valid_days: number;
}
export declare const MarketMapperRevenueShareParams: {
    encode(message: MarketMapperRevenueShareParams, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MarketMapperRevenueShareParams;
    fromPartial(object: DeepPartial<MarketMapperRevenueShareParams>): MarketMapperRevenueShareParams;
};
