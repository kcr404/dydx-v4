"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LCDQueryClient = void 0;
const helpers_1 = require("../../helpers");
class LCDQueryClient {
    constructor({ requestClient }) {
        this.req = requestClient;
        this.subaccount = this.subaccount.bind(this);
        this.subaccountAll = this.subaccountAll.bind(this);
        this.getWithdrawalAndTransfersBlockedInfo = this.getWithdrawalAndTransfersBlockedInfo.bind(this);
        this.collateralPoolAddress = this.collateralPoolAddress.bind(this);
    }
    /* Queries a Subaccount by id */
    async subaccount(params) {
        const endpoint = `dydxprotocol/subaccounts/subaccount/${params.owner}/${params.number}`;
        return await this.req.get(endpoint);
    }
    /* Queries a list of Subaccount items. */
    async subaccountAll(params = {
        pagination: undefined
    }) {
        const options = {
            params: {}
        };
        if (typeof (params === null || params === void 0 ? void 0 : params.pagination) !== "undefined") {
            (0, helpers_1.setPaginationParams)(options, params.pagination);
        }
        const endpoint = `dydxprotocol/subaccounts/subaccount`;
        return await this.req.get(endpoint, options);
    }
    /* Queries information about whether withdrawal and transfers are blocked, and
     if so which block they are re-enabled on. */
    async getWithdrawalAndTransfersBlockedInfo(params) {
        const endpoint = `dydxprotocol/subaccounts/withdrawals_and_transfers_blocked_info/${params.perpetualId}`;
        return await this.req.get(endpoint);
    }
    /* Queries the collateral pool account address for a perpetual id. */
    async collateralPoolAddress(params) {
        const endpoint = `dydxprotocol/subaccounts/collateral_pool_address/${params.perpetualId}`;
        return await this.req.get(endpoint);
    }
}
exports.LCDQueryClient = LCDQueryClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnkubGNkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BkeWR4cHJvdG9jb2wvdjQtcHJvdG8vc3JjL2NvZGVnZW4vZHlkeHByb3RvY29sL3N1YmFjY291bnRzL3F1ZXJ5LmxjZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBb0Q7QUFHcEQsTUFBYSxjQUFjO0lBR3pCLFlBQVksRUFDVixhQUFhLEVBR2Q7UUFDQyxJQUFJLENBQUMsR0FBRyxHQUFHLGFBQWEsQ0FBQztRQUN6QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLG9DQUFvQyxHQUFHLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakcsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUNELGdDQUFnQztJQUdoQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWlDO1FBQ2hELE1BQU0sUUFBUSxHQUFHLHVDQUF1QyxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN4RixPQUFPLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQWlDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFDRCx5Q0FBeUM7SUFHekMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFvQztRQUN0RCxVQUFVLEVBQUUsU0FBUztLQUN0QjtRQUNDLE1BQU0sT0FBTyxHQUFRO1lBQ25CLE1BQU0sRUFBRSxFQUFFO1NBQ1gsQ0FBQztRQUVGLElBQUksT0FBTyxDQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxVQUFVLENBQUEsS0FBSyxXQUFXLEVBQUU7WUFDN0MsSUFBQSw2QkFBbUIsRUFBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ2pEO1FBRUQsTUFBTSxRQUFRLEdBQUcscUNBQXFDLENBQUM7UUFDdkQsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFvQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUNEO2lEQUM2QztJQUc3QyxLQUFLLENBQUMsb0NBQW9DLENBQUMsTUFBd0Q7UUFDakcsTUFBTSxRQUFRLEdBQUcsbUVBQW1FLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN6RyxPQUFPLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQTJELFFBQVEsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFDRCxxRUFBcUU7SUFHckUsS0FBSyxDQUFDLHFCQUFxQixDQUFDLE1BQXlDO1FBQ25FLE1BQU0sUUFBUSxHQUFHLG9EQUFvRCxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDMUYsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUE0QyxRQUFRLENBQUMsQ0FBQztJQUNqRixDQUFDO0NBRUY7QUF0REQsd0NBc0RDIn0=