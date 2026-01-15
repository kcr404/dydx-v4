"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = __importDefault(require("./rest"));
/**
 * @description REST endpoints for data unrelated to a particular address.
 */
class VaultClient extends rest_1.default {
    async getMegavaultHistoricalPnl(resolution) {
        const uri = '/v4/vault/v1/megavault/historicalPnl';
        return this.get(uri, { resolution });
    }
    async getVaultsHistoricalPnl(resolution) {
        const uri = '/v4/vault/v1/vaults/historicalPnl';
        return this.get(uri, { resolution });
    }
    async getMegavaultPositions() {
        const uri = '/v4/vault/v1/megavault/positions';
        return this.get(uri);
    }
}
exports.default = VaultClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2xpZW50cy9tb2R1bGVzL3ZhdWx0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEsa0RBQWdDO0FBRWhDOztHQUVHO0FBQ0gsTUFBcUIsV0FBWSxTQUFRLGNBQVU7SUFDakQsS0FBSyxDQUFDLHlCQUF5QixDQUFDLFVBQW1DO1FBQ2pFLE1BQU0sR0FBRyxHQUFHLHNDQUFzQyxDQUFDO1FBQ25ELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxLQUFLLENBQUMsc0JBQXNCLENBQUMsVUFBbUM7UUFDOUQsTUFBTSxHQUFHLEdBQUcsbUNBQW1DLENBQUM7UUFDaEQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELEtBQUssQ0FBQyxxQkFBcUI7UUFDekIsTUFBTSxHQUFHLEdBQUcsa0NBQWtDLENBQUM7UUFDL0MsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7Q0FDRjtBQWZELDhCQWVDIn0=