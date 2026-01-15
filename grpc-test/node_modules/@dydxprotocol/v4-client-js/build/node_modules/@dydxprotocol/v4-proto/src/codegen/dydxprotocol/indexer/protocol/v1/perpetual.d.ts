/**
 * Market type of perpetual.
 * Defined in perpetual.
 */
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
