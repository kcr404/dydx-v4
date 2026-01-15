"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingModule = exports.VaultModule = exports.AffiliateModule = exports.DistributionModule = exports.BridgeModule = exports.StakingModule = exports.RewardsModule = exports.RateLimitModule = exports.FeeTierModule = exports.SubaccountsModule = exports.PricesModule = exports.PerpetualsModule = exports.ClobModule = exports.StatsModule = exports.GovV1Module = void 0;
exports.GovV1Module = __importStar(require("@dydxprotocol/v4-proto/src/codegen/cosmos/gov/v1/query"));
exports.StatsModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/stats/query"));
exports.ClobModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/clob/query"));
exports.PerpetualsModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/perpetuals/query"));
exports.PricesModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/prices/query"));
exports.SubaccountsModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/subaccounts/query"));
exports.FeeTierModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/feetiers/query"));
exports.RateLimitModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/ratelimit/query"));
exports.RewardsModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/rewards/query"));
exports.StakingModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/cosmos/staking/v1beta1/query"));
exports.BridgeModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/bridge/query"));
exports.DistributionModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/cosmos/distribution/v1beta1/query"));
exports.AffiliateModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/affiliates/query"));
exports.VaultModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/vault/query"));
exports.ListingModule = __importStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/listing/query"));
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/cosmos/base/abci/v1beta1/abci"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/cosmos/gov/v1/gov"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/clob/order"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/clob/tx"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/delaymsg/tx"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/perpetuals/tx"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/prices/tx"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/google/protobuf/any"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/subaccounts/subaccount"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/sending/tx"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/sending/transfer"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/assets/genesis"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/assets/asset"), exports);
__exportStar(require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/listing/tx"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG8taW5jbHVkZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2xpZW50cy9tb2R1bGVzL3Byb3RvLWluY2x1ZGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0dBQXNGO0FBQ3RGLDJHQUEyRjtBQUUzRix5R0FBeUY7QUFDekYscUhBQXFHO0FBQ3JHLDZHQUE2RjtBQUM3Rix1SEFBdUc7QUFDdkcsZ0hBQWdHO0FBQ2hHLG1IQUFtRztBQUNuRywrR0FBK0Y7QUFDL0YsaUhBQWlHO0FBQ2pHLDZHQUE2RjtBQUM3RiwySEFBMkc7QUFDM0csb0hBQW9HO0FBQ3BHLDJHQUEyRjtBQUMzRiwrR0FBK0Y7QUFFL0YsbUdBQWlGO0FBQ2pGLHVGQUFxRTtBQUNyRSw2RkFBMkU7QUFDM0UsMEZBQXdFO0FBQ3hFLDhGQUE0RTtBQUM1RSxnR0FBOEU7QUFDOUUsNEZBQTBFO0FBQzFFLHlGQUF1RTtBQUN2RSx5R0FBdUY7QUFDdkYsNkZBQTJFO0FBQzNFLG1HQUFpRjtBQUNqRixpR0FBK0U7QUFDL0UsK0ZBQTZFO0FBQzdFLDZGQUEyRSJ9