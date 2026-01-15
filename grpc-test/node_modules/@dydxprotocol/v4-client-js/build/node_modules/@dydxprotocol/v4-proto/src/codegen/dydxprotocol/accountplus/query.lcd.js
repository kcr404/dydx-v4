"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LCDQueryClient = void 0;
class LCDQueryClient {
    constructor({ requestClient }) {
        this.req = requestClient;
        this.params = this.params.bind(this);
        this.getAuthenticator = this.getAuthenticator.bind(this);
        this.getAuthenticators = this.getAuthenticators.bind(this);
    }
    /* Parameters queries the parameters of the module. */
    async params(_params = {}) {
        const endpoint = `dydxprotocol/accountplus/params`;
        return await this.req.get(endpoint);
    }
    /* Queries a single authenticator by account and authenticator ID. */
    async getAuthenticator(params) {
        const endpoint = `dydxprotocol/accountplus/authenticator/${params.account}/${params.authenticatorId}`;
        return await this.req.get(endpoint);
    }
    /* Queries all authenticators for a given account. */
    async getAuthenticators(params) {
        const endpoint = `dydxprotocol/accountplus/authenticators/${params.account}`;
        return await this.req.get(endpoint);
    }
}
exports.LCDQueryClient = LCDQueryClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnkubGNkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BkeWR4cHJvdG9jb2wvdjQtcHJvdG8vc3JjL2NvZGVnZW4vZHlkeHByb3RvY29sL2FjY291bnRwbHVzL3F1ZXJ5LmxjZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxNQUFhLGNBQWM7SUFHekIsWUFBWSxFQUNWLGFBQWEsRUFHZDtRQUNDLElBQUksQ0FBQyxHQUFHLEdBQUcsYUFBYSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUNELHNEQUFzRDtJQUd0RCxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQThCLEVBQUU7UUFDM0MsTUFBTSxRQUFRLEdBQUcsaUNBQWlDLENBQUM7UUFDbkQsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUE2QixRQUFRLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBQ0QscUVBQXFFO0lBR3JFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUErQjtRQUNwRCxNQUFNLFFBQVEsR0FBRywwQ0FBMEMsTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdEcsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFrQyxRQUFRLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBQ0QscURBQXFEO0lBR3JELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxNQUFnQztRQUN0RCxNQUFNLFFBQVEsR0FBRywyQ0FBMkMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdFLE9BQU8sTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBbUMsUUFBUSxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUVGO0FBbkNELHdDQW1DQyJ9