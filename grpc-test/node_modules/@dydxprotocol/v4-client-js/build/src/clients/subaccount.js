"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubaccountInfo = void 0;
const constants_1 = require("./constants");
class SubaccountInfo {
    constructor(wallet, subaccountNumber = 0) {
        if (subaccountNumber < 0 || subaccountNumber > constants_1.MAX_SUBACCOUNT_NUMBER) {
            throw new Error(`Subaccount number must be between 0 and ${constants_1.MAX_SUBACCOUNT_NUMBER}`);
        }
        this.wallet = wallet;
        this.subaccountNumber = subaccountNumber;
    }
    get address() {
        const address = this.wallet.address;
        if (address !== undefined) {
            return address;
        }
        else {
            throw new Error('Address not set');
        }
    }
}
exports.SubaccountInfo = SubaccountInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViYWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnRzL3N1YmFjY291bnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQW9EO0FBR3BELE1BQWEsY0FBYztJQUt6QixZQUFZLE1BQW1CLEVBQUUsbUJBQTJCLENBQUM7UUFDM0QsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLElBQUksZ0JBQWdCLEdBQUcsaUNBQXFCLEVBQUU7WUFDcEUsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsaUNBQXFCLEVBQUUsQ0FBQyxDQUFDO1NBQ3JGO1FBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0lBQzNDLENBQUM7SUFFRCxJQUFJLE9BQU87UUFDVCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNwQyxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDekIsT0FBTyxPQUFPLENBQUM7U0FDaEI7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUNwQztJQUNILENBQUM7Q0FDRjtBQXJCRCx3Q0FxQkMifQ==