"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LCDQueryClient = void 0;
class LCDQueryClient {
    constructor({ requestClient }) {
        this.req = requestClient;
        this.downtimeParams = this.downtimeParams.bind(this);
        this.allDowntimeInfo = this.allDowntimeInfo.bind(this);
    }
    /* Queries the DowntimeParams. */
    async downtimeParams(_params = {}) {
        const endpoint = `dydxprotocol/v4/blocktime/downtime_params`;
        return await this.req.get(endpoint);
    }
    /* Queries all recorded downtime info. */
    async allDowntimeInfo(_params = {}) {
        const endpoint = `dydxprotocol/v4/blocktime/all_downtime_info`;
        return await this.req.get(endpoint);
    }
}
exports.LCDQueryClient = LCDQueryClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnkubGNkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BkeWR4cHJvdG9jb2wvdjQtcHJvdG8vc3JjL2NvZGVnZW4vZHlkeHByb3RvY29sL2Jsb2NrdGltZS9xdWVyeS5sY2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBYSxjQUFjO0lBR3pCLFlBQVksRUFDVixhQUFhLEVBR2Q7UUFDQyxJQUFJLENBQUMsR0FBRyxHQUFHLGFBQWEsQ0FBQztRQUN6QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUNELGlDQUFpQztJQUdqQyxLQUFLLENBQUMsY0FBYyxDQUFDLFVBQXNDLEVBQUU7UUFDM0QsTUFBTSxRQUFRLEdBQUcsMkNBQTJDLENBQUM7UUFDN0QsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFxQyxRQUFRLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBQ0QseUNBQXlDO0lBR3pDLEtBQUssQ0FBQyxlQUFlLENBQUMsVUFBdUMsRUFBRTtRQUM3RCxNQUFNLFFBQVEsR0FBRyw2Q0FBNkMsQ0FBQztRQUMvRCxPQUFPLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQXNDLFFBQVEsQ0FBQyxDQUFDO0lBQzNFLENBQUM7Q0FFRjtBQTNCRCx3Q0EyQkMifQ==