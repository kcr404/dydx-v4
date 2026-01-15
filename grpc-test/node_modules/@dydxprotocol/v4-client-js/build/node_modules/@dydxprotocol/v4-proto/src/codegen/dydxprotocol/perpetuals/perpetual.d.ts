/// <reference types="long" />
import * as _m0 from "protobufjs/minimal";
import { DeepPartial, Long } from "../../helpers";
export declare enum PerpetualMarketType {
    /** PERPETUAL_MARKET_TYPE_UNSPECIFIED - Unspecified market type. */
    PERPETUAL_MARKET_TYPE_UNSPECIFIED = 0,
    /** PERPETUAL_MARKET_TYPE_CROSS - Market type for cross margin perpetual markets. */
    PERPETUAL_MARKET_TYPE_CROSS = 1,
    /** PERPETUAL_MARKET_TYPE_ISOLATED - Market type for isolated margin perpetual markets. */
    PERPETUAL_MARKET_TYPE_ISOLATED = 2,
    UNRECOGNIZED = -1
}
export declare const PerpetualMarketTypeSDKType: typeof PerpetualMarketType;
export declare function perpetualMarketTypeFromJSON(object: any): PerpetualMarketType;
export declare function perpetualMarketTypeToJSON(object: PerpetualMarketType): string;
/** Perpetual represents a perpetual on the dYdX exchange. */
export interface Perpetual {
    /** PerpetualParams is the parameters of the perpetual. */
    params?: PerpetualParams;
    /**
     * The current index determined by the cumulative all-time
     * history of the funding mechanism. Starts at zero.
     */
    fundingIndex: Uint8Array;
    /** Total size of open long contracts, measured in base_quantums. */
    openInterest: Uint8Array;
}
/** Perpetual represents a perpetual on the dYdX exchange. */
export interface PerpetualSDKType {
    params?: PerpetualParamsSDKType;
    funding_index: Uint8Array;
    open_interest: Uint8Array;
}
/**
 * PerpetualParams represents the parameters of a perpetual on the dYdX
 * exchange.
 */
export interface PerpetualParams {
    /** Unique, sequentially-generated. */
    id: number;
    /** The name of the `Perpetual` (e.g. `BTC-USD`). */
    ticker: string;
    /**
     * The market associated with this `Perpetual`. It
     * acts as the oracle price for the purposes of calculating
     * collateral, margin requirements, and funding rates.
     */
    marketId: number;
    /**
     * The exponent for converting an atomic amount (`size = 1`)
     * to a full coin. For example, if `AtomicResolution = -8`
     * then a `PerpetualPosition` with `size = 1e8` is equivalent to
     * a position size of one full coin.
     */
    atomicResolution: number;
    /**
     * The default funding payment if there is no price premium. In
     * parts-per-million.
     */
    defaultFundingPpm: number;
    /** The liquidity_tier that this perpetual is associated with. */
    liquidityTier: number;
    /** The market type specifying if this perpetual is cross or isolated */
    marketType: PerpetualMarketType;
}
/**
 * PerpetualParams represents the parameters of a perpetual on the dYdX
 * exchange.
 */
export interface PerpetualParamsSDKType {
    id: number;
    ticker: string;
    market_id: number;
    atomic_resolution: number;
    default_funding_ppm: number;
    liquidity_tier: number;
    market_type: PerpetualMarketType;
}
/** MarketPremiums stores a list of premiums for a single perpetual market. */
export interface MarketPremiums {
    /** perpetual_id is the Id of the perpetual market. */
    perpetualId: number;
    /**
     * premiums is a list of premium values for a perpetual market. Since most
     * premiums are zeros under "stable" market conditions, only non-zero values
     * are stored in this list.
     */
    premiums: number[];
}
/** MarketPremiums stores a list of premiums for a single perpetual market. */
export interface MarketPremiumsSDKType {
    perpetual_id: number;
    premiums: number[];
}
/**
 * PremiumStore is a struct to store a perpetual premiums for all
 * perpetual markets. It stores a list of `MarketPremiums`, each of which
 * corresponds to a perpetual market and stores a list of non-zero premium
 * values for that market.
 * This struct can either be used to store `PremiumVotes` or
 * `PremiumSamples`.
 */
export interface PremiumStore {
    /**
     * all_market_premiums a list of `MarketPremiums`, each corresponding to
     * a perpetual market.
     */
    allMarketPremiums: MarketPremiums[];
    /**
     * number of rounds where premium values were added. This value indicates
     * the total number of premiums (zeros and non-zeros) for each
     * `MarketPremiums` struct. Note that in the edge case a perpetual market was
     * added in the middle of a epoch, we don't keep a seperate count for that
     * market. This means we treat this market as having zero premiums before it
     * was added.
     */
    numPremiums: number;
}
/**
 * PremiumStore is a struct to store a perpetual premiums for all
 * perpetual markets. It stores a list of `MarketPremiums`, each of which
 * corresponds to a perpetual market and stores a list of non-zero premium
 * values for that market.
 * This struct can either be used to store `PremiumVotes` or
 * `PremiumSamples`.
 */
export interface PremiumStoreSDKType {
    all_market_premiums: MarketPremiumsSDKType[];
    num_premiums: number;
}
/** LiquidityTier stores margin information. */
export interface LiquidityTier {
    /** Unique id. */
    id: number;
    /** The name of the tier purely for mnemonic purposes, e.g. "Gold". */
    name: string;
    /**
     * The margin fraction needed to open a position.
     * In parts-per-million.
     */
    initialMarginPpm: number;
    /**
     * The fraction of the initial-margin that the maintenance-margin is,
     * e.g. 50%. In parts-per-million.
     */
    maintenanceFractionPpm: number;
    /**
     * The maximum position size at which the margin requirements are
     * not increased over the default values. Above this position size,
     * the margin requirements increase at a rate of sqrt(size).
     *
     * Deprecated since v3.x.
     */
    /** @deprecated */
    basePositionNotional: Long;
    /**
     * The impact notional amount (in quote quantums) is used to determine impact
     * bid/ask prices and its recommended value is 500 USDC / initial margin
     * fraction.
     * - Impact bid price = average execution price for a market sell of the
     * impact notional value.
     * - Impact ask price = average execution price for a market buy of the
     * impact notional value.
     */
    impactNotional: Long;
    /**
     * Lower cap for Open Interest Margin Fracton (OIMF), in quote quantums.
     * IMF is not affected when OI <= open_interest_lower_cap.
     */
    openInterestLowerCap: Long;
    /**
     * Upper cap for Open Interest Margin Fracton (OIMF), in quote quantums.
     * IMF scales linearly to 100% as OI approaches open_interest_upper_cap.
     * If zero, then the IMF does not scale with OI.
     */
    openInterestUpperCap: Long;
}
/** LiquidityTier stores margin information. */
export interface LiquidityTierSDKType {
    id: number;
    name: string;
    initial_margin_ppm: number;
    maintenance_fraction_ppm: number;
    /** @deprecated */
    base_position_notional: Long;
    impact_notional: Long;
    open_interest_lower_cap: Long;
    open_interest_upper_cap: Long;
}
export declare const Perpetual: {
    encode(message: Perpetual, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Perpetual;
    fromPartial(object: DeepPartial<Perpetual>): Perpetual;
};
export declare const PerpetualParams: {
    encode(message: PerpetualParams, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PerpetualParams;
    fromPartial(object: DeepPartial<PerpetualParams>): PerpetualParams;
};
export declare const MarketPremiums: {
    encode(message: MarketPremiums, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MarketPremiums;
    fromPartial(object: DeepPartial<MarketPremiums>): MarketPremiums;
};
export declare const PremiumStore: {
    encode(message: PremiumStore, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PremiumStore;
    fromPartial(object: DeepPartial<PremiumStore>): PremiumStore;
};
export declare const LiquidityTier: {
    encode(message: LiquidityTier, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): LiquidityTier;
    fromPartial(object: DeepPartial<LiquidityTier>): LiquidityTier;
};
