"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perpetualMarketTypeToJSON = exports.perpetualMarketTypeFromJSON = exports.PerpetualMarketTypeSDKType = exports.PerpetualMarketType = void 0;
/**
 * Market type of perpetual.
 * Defined in perpetual.
 */
var PerpetualMarketType;
(function (PerpetualMarketType) {
    /** PERPETUAL_MARKET_TYPE_UNSPECIFIED - Unspecified market type. */
    PerpetualMarketType[PerpetualMarketType["PERPETUAL_MARKET_TYPE_UNSPECIFIED"] = 0] = "PERPETUAL_MARKET_TYPE_UNSPECIFIED";
    /** PERPETUAL_MARKET_TYPE_CROSS - Market type for cross margin perpetual markets. */
    PerpetualMarketType[PerpetualMarketType["PERPETUAL_MARKET_TYPE_CROSS"] = 1] = "PERPETUAL_MARKET_TYPE_CROSS";
    /** PERPETUAL_MARKET_TYPE_ISOLATED - Market type for isolated margin perpetual markets. */
    PerpetualMarketType[PerpetualMarketType["PERPETUAL_MARKET_TYPE_ISOLATED"] = 2] = "PERPETUAL_MARKET_TYPE_ISOLATED";
    PerpetualMarketType[PerpetualMarketType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(PerpetualMarketType = exports.PerpetualMarketType || (exports.PerpetualMarketType = {}));
exports.PerpetualMarketTypeSDKType = PerpetualMarketType;
function perpetualMarketTypeFromJSON(object) {
    switch (object) {
        case 0:
        case "PERPETUAL_MARKET_TYPE_UNSPECIFIED":
            return PerpetualMarketType.PERPETUAL_MARKET_TYPE_UNSPECIFIED;
        case 1:
        case "PERPETUAL_MARKET_TYPE_CROSS":
            return PerpetualMarketType.PERPETUAL_MARKET_TYPE_CROSS;
        case 2:
        case "PERPETUAL_MARKET_TYPE_ISOLATED":
            return PerpetualMarketType.PERPETUAL_MARKET_TYPE_ISOLATED;
        case -1:
        case "UNRECOGNIZED":
        default:
            return PerpetualMarketType.UNRECOGNIZED;
    }
}
exports.perpetualMarketTypeFromJSON = perpetualMarketTypeFromJSON;
function perpetualMarketTypeToJSON(object) {
    switch (object) {
        case PerpetualMarketType.PERPETUAL_MARKET_TYPE_UNSPECIFIED:
            return "PERPETUAL_MARKET_TYPE_UNSPECIFIED";
        case PerpetualMarketType.PERPETUAL_MARKET_TYPE_CROSS:
            return "PERPETUAL_MARKET_TYPE_CROSS";
        case PerpetualMarketType.PERPETUAL_MARKET_TYPE_ISOLATED:
            return "PERPETUAL_MARKET_TYPE_ISOLATED";
        case PerpetualMarketType.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.perpetualMarketTypeToJSON = perpetualMarketTypeToJSON;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVycGV0dWFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BkeWR4cHJvdG9jb2wvdjQtcHJvdG8vc3JjL2NvZGVnZW4vZHlkeHByb3RvY29sL2luZGV4ZXIvcHJvdG9jb2wvdjEvcGVycGV0dWFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7R0FHRztBQUNILElBQVksbUJBVVg7QUFWRCxXQUFZLG1CQUFtQjtJQUM3QixtRUFBbUU7SUFDbkUsdUhBQXFDLENBQUE7SUFFckMsb0ZBQW9GO0lBQ3BGLDJHQUErQixDQUFBO0lBRS9CLDBGQUEwRjtJQUMxRixpSEFBa0MsQ0FBQTtJQUNsQyw4RUFBaUIsQ0FBQTtBQUNuQixDQUFDLEVBVlcsbUJBQW1CLEdBQW5CLDJCQUFtQixLQUFuQiwyQkFBbUIsUUFVOUI7QUFDWSxRQUFBLDBCQUEwQixHQUFHLG1CQUFtQixDQUFDO0FBQzlELFNBQWdCLDJCQUEyQixDQUFDLE1BQVc7SUFDckQsUUFBUSxNQUFNLEVBQUU7UUFDZCxLQUFLLENBQUMsQ0FBQztRQUNQLEtBQUssbUNBQW1DO1lBQ3RDLE9BQU8sbUJBQW1CLENBQUMsaUNBQWlDLENBQUM7UUFFL0QsS0FBSyxDQUFDLENBQUM7UUFDUCxLQUFLLDZCQUE2QjtZQUNoQyxPQUFPLG1CQUFtQixDQUFDLDJCQUEyQixDQUFDO1FBRXpELEtBQUssQ0FBQyxDQUFDO1FBQ1AsS0FBSyxnQ0FBZ0M7WUFDbkMsT0FBTyxtQkFBbUIsQ0FBQyw4QkFBOEIsQ0FBQztRQUU1RCxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ1IsS0FBSyxjQUFjLENBQUM7UUFDcEI7WUFDRSxPQUFPLG1CQUFtQixDQUFDLFlBQVksQ0FBQztLQUMzQztBQUNILENBQUM7QUFuQkQsa0VBbUJDO0FBQ0QsU0FBZ0IseUJBQXlCLENBQUMsTUFBMkI7SUFDbkUsUUFBUSxNQUFNLEVBQUU7UUFDZCxLQUFLLG1CQUFtQixDQUFDLGlDQUFpQztZQUN4RCxPQUFPLG1DQUFtQyxDQUFDO1FBRTdDLEtBQUssbUJBQW1CLENBQUMsMkJBQTJCO1lBQ2xELE9BQU8sNkJBQTZCLENBQUM7UUFFdkMsS0FBSyxtQkFBbUIsQ0FBQyw4QkFBOEI7WUFDckQsT0FBTyxnQ0FBZ0MsQ0FBQztRQUUxQyxLQUFLLG1CQUFtQixDQUFDLFlBQVksQ0FBQztRQUN0QztZQUNFLE9BQU8sY0FBYyxDQUFDO0tBQ3pCO0FBQ0gsQ0FBQztBQWZELDhEQWVDIn0=