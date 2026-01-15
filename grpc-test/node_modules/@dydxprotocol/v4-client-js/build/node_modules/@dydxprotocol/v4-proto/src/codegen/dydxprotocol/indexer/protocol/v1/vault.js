"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vaultStatusToJSON = exports.vaultStatusFromJSON = exports.VaultStatusSDKType = exports.VaultStatus = void 0;
/** VaultStatus represents the status of a vault. */
var VaultStatus;
(function (VaultStatus) {
    /** VAULT_STATUS_UNSPECIFIED - Default value, invalid and unused. */
    VaultStatus[VaultStatus["VAULT_STATUS_UNSPECIFIED"] = 0] = "VAULT_STATUS_UNSPECIFIED";
    /** VAULT_STATUS_DEACTIVATED - Don’t place orders. Does not count toward global vault balances. */
    VaultStatus[VaultStatus["VAULT_STATUS_DEACTIVATED"] = 1] = "VAULT_STATUS_DEACTIVATED";
    /** VAULT_STATUS_STAND_BY - Don’t place orders. Does count towards global vault balances. */
    VaultStatus[VaultStatus["VAULT_STATUS_STAND_BY"] = 2] = "VAULT_STATUS_STAND_BY";
    /** VAULT_STATUS_QUOTING - Places orders on both sides of the book. */
    VaultStatus[VaultStatus["VAULT_STATUS_QUOTING"] = 3] = "VAULT_STATUS_QUOTING";
    /** VAULT_STATUS_CLOSE_ONLY - Only place orders that close the position. */
    VaultStatus[VaultStatus["VAULT_STATUS_CLOSE_ONLY"] = 4] = "VAULT_STATUS_CLOSE_ONLY";
    VaultStatus[VaultStatus["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(VaultStatus = exports.VaultStatus || (exports.VaultStatus = {}));
exports.VaultStatusSDKType = VaultStatus;
function vaultStatusFromJSON(object) {
    switch (object) {
        case 0:
        case "VAULT_STATUS_UNSPECIFIED":
            return VaultStatus.VAULT_STATUS_UNSPECIFIED;
        case 1:
        case "VAULT_STATUS_DEACTIVATED":
            return VaultStatus.VAULT_STATUS_DEACTIVATED;
        case 2:
        case "VAULT_STATUS_STAND_BY":
            return VaultStatus.VAULT_STATUS_STAND_BY;
        case 3:
        case "VAULT_STATUS_QUOTING":
            return VaultStatus.VAULT_STATUS_QUOTING;
        case 4:
        case "VAULT_STATUS_CLOSE_ONLY":
            return VaultStatus.VAULT_STATUS_CLOSE_ONLY;
        case -1:
        case "UNRECOGNIZED":
        default:
            return VaultStatus.UNRECOGNIZED;
    }
}
exports.vaultStatusFromJSON = vaultStatusFromJSON;
function vaultStatusToJSON(object) {
    switch (object) {
        case VaultStatus.VAULT_STATUS_UNSPECIFIED:
            return "VAULT_STATUS_UNSPECIFIED";
        case VaultStatus.VAULT_STATUS_DEACTIVATED:
            return "VAULT_STATUS_DEACTIVATED";
        case VaultStatus.VAULT_STATUS_STAND_BY:
            return "VAULT_STATUS_STAND_BY";
        case VaultStatus.VAULT_STATUS_QUOTING:
            return "VAULT_STATUS_QUOTING";
        case VaultStatus.VAULT_STATUS_CLOSE_ONLY:
            return "VAULT_STATUS_CLOSE_ONLY";
        case VaultStatus.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.vaultStatusToJSON = vaultStatusToJSON;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQGR5ZHhwcm90b2NvbC92NC1wcm90by9zcmMvY29kZWdlbi9keWR4cHJvdG9jb2wvaW5kZXhlci9wcm90b2NvbC92MS92YXVsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvREFBb0Q7QUFDcEQsSUFBWSxXQWdCWDtBQWhCRCxXQUFZLFdBQVc7SUFDckIsb0VBQW9FO0lBQ3BFLHFGQUE0QixDQUFBO0lBRTVCLGtHQUFrRztJQUNsRyxxRkFBNEIsQ0FBQTtJQUU1Qiw0RkFBNEY7SUFDNUYsK0VBQXlCLENBQUE7SUFFekIsc0VBQXNFO0lBQ3RFLDZFQUF3QixDQUFBO0lBRXhCLDJFQUEyRTtJQUMzRSxtRkFBMkIsQ0FBQTtJQUMzQiw4REFBaUIsQ0FBQTtBQUNuQixDQUFDLEVBaEJXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBZ0J0QjtBQUNZLFFBQUEsa0JBQWtCLEdBQUcsV0FBVyxDQUFDO0FBQzlDLFNBQWdCLG1CQUFtQixDQUFDLE1BQVc7SUFDN0MsUUFBUSxNQUFNLEVBQUU7UUFDZCxLQUFLLENBQUMsQ0FBQztRQUNQLEtBQUssMEJBQTBCO1lBQzdCLE9BQU8sV0FBVyxDQUFDLHdCQUF3QixDQUFDO1FBRTlDLEtBQUssQ0FBQyxDQUFDO1FBQ1AsS0FBSywwQkFBMEI7WUFDN0IsT0FBTyxXQUFXLENBQUMsd0JBQXdCLENBQUM7UUFFOUMsS0FBSyxDQUFDLENBQUM7UUFDUCxLQUFLLHVCQUF1QjtZQUMxQixPQUFPLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQztRQUUzQyxLQUFLLENBQUMsQ0FBQztRQUNQLEtBQUssc0JBQXNCO1lBQ3pCLE9BQU8sV0FBVyxDQUFDLG9CQUFvQixDQUFDO1FBRTFDLEtBQUssQ0FBQyxDQUFDO1FBQ1AsS0FBSyx5QkFBeUI7WUFDNUIsT0FBTyxXQUFXLENBQUMsdUJBQXVCLENBQUM7UUFFN0MsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNSLEtBQUssY0FBYyxDQUFDO1FBQ3BCO1lBQ0UsT0FBTyxXQUFXLENBQUMsWUFBWSxDQUFDO0tBQ25DO0FBQ0gsQ0FBQztBQTNCRCxrREEyQkM7QUFDRCxTQUFnQixpQkFBaUIsQ0FBQyxNQUFtQjtJQUNuRCxRQUFRLE1BQU0sRUFBRTtRQUNkLEtBQUssV0FBVyxDQUFDLHdCQUF3QjtZQUN2QyxPQUFPLDBCQUEwQixDQUFDO1FBRXBDLEtBQUssV0FBVyxDQUFDLHdCQUF3QjtZQUN2QyxPQUFPLDBCQUEwQixDQUFDO1FBRXBDLEtBQUssV0FBVyxDQUFDLHFCQUFxQjtZQUNwQyxPQUFPLHVCQUF1QixDQUFDO1FBRWpDLEtBQUssV0FBVyxDQUFDLG9CQUFvQjtZQUNuQyxPQUFPLHNCQUFzQixDQUFDO1FBRWhDLEtBQUssV0FBVyxDQUFDLHVCQUF1QjtZQUN0QyxPQUFPLHlCQUF5QixDQUFDO1FBRW5DLEtBQUssV0FBVyxDQUFDLFlBQVksQ0FBQztRQUM5QjtZQUNFLE9BQU8sY0FBYyxDQUFDO0tBQ3pCO0FBQ0gsQ0FBQztBQXJCRCw4Q0FxQkMifQ==