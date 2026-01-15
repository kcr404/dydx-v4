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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRPCMsgClient = void 0;
const createRPCMsgClient = async ({ rpc }) => ({
    cosmos: {
        auth: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/auth/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        authz: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/authz/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        bank: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/bank/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        circuit: {
            v1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/circuit/v1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        consensus: {
            v1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/consensus/v1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        crisis: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/crisis/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        distribution: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/distribution/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        evidence: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/evidence/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        feegrant: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/feegrant/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        gov: {
            v1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/gov/v1/tx.rpc.msg")))).MsgClientImpl(rpc),
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/gov/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        group: {
            v1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/group/v1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        mint: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/mint/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        nft: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/nft/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        slashing: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/slashing/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        staking: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/staking/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        upgrade: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/upgrade/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        },
        vesting: {
            v1beta1: new (await Promise.resolve().then(() => __importStar(require("../cosmos/vesting/v1beta1/tx.rpc.msg")))).MsgClientImpl(rpc)
        }
    },
    dydxprotocol: {
        accountplus: new (await Promise.resolve().then(() => __importStar(require("./accountplus/tx.rpc.msg")))).MsgClientImpl(rpc),
        affiliates: new (await Promise.resolve().then(() => __importStar(require("./affiliates/tx.rpc.msg")))).MsgClientImpl(rpc),
        blocktime: new (await Promise.resolve().then(() => __importStar(require("./blocktime/tx.rpc.msg")))).MsgClientImpl(rpc),
        bridge: new (await Promise.resolve().then(() => __importStar(require("./bridge/tx.rpc.msg")))).MsgClientImpl(rpc),
        clob: new (await Promise.resolve().then(() => __importStar(require("./clob/tx.rpc.msg")))).MsgClientImpl(rpc),
        delaymsg: new (await Promise.resolve().then(() => __importStar(require("./delaymsg/tx.rpc.msg")))).MsgClientImpl(rpc),
        feetiers: new (await Promise.resolve().then(() => __importStar(require("./feetiers/tx.rpc.msg")))).MsgClientImpl(rpc),
        govplus: new (await Promise.resolve().then(() => __importStar(require("./govplus/tx.rpc.msg")))).MsgClientImpl(rpc),
        listing: new (await Promise.resolve().then(() => __importStar(require("./listing/tx.rpc.msg")))).MsgClientImpl(rpc),
        perpetuals: new (await Promise.resolve().then(() => __importStar(require("./perpetuals/tx.rpc.msg")))).MsgClientImpl(rpc),
        prices: new (await Promise.resolve().then(() => __importStar(require("./prices/tx.rpc.msg")))).MsgClientImpl(rpc),
        ratelimit: new (await Promise.resolve().then(() => __importStar(require("./ratelimit/tx.rpc.msg")))).MsgClientImpl(rpc),
        revshare: new (await Promise.resolve().then(() => __importStar(require("./revshare/tx.rpc.msg")))).MsgClientImpl(rpc),
        rewards: new (await Promise.resolve().then(() => __importStar(require("./rewards/tx.rpc.msg")))).MsgClientImpl(rpc),
        sending: new (await Promise.resolve().then(() => __importStar(require("./sending/tx.rpc.msg")))).MsgClientImpl(rpc),
        stats: new (await Promise.resolve().then(() => __importStar(require("./stats/tx.rpc.msg")))).MsgClientImpl(rpc),
        vault: new (await Promise.resolve().then(() => __importStar(require("./vault/tx.rpc.msg")))).MsgClientImpl(rpc),
        vest: new (await Promise.resolve().then(() => __importStar(require("./vest/tx.rpc.msg")))).MsgClientImpl(rpc)
    }
});
exports.createRPCMsgClient = createRPCMsgClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjLnR4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BkeWR4cHJvdG9jb2wvdjQtcHJvdG8vc3JjL2NvZGVnZW4vZHlkeHByb3RvY29sL3JwYy50eC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNPLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxFQUFFLEVBQ3ZDLEdBQUcsRUFHSixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ0wsTUFBTSxFQUFFO1FBQ04sSUFBSSxFQUFFO1lBQ0osT0FBTyxFQUFFLElBQUksQ0FBQyx3REFBYSxtQ0FBbUMsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztTQUNwRjtRQUNELEtBQUssRUFBRTtZQUNMLE9BQU8sRUFBRSxJQUFJLENBQUMsd0RBQWEsb0NBQW9DLEdBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7U0FDckY7UUFDRCxJQUFJLEVBQUU7WUFDSixPQUFPLEVBQUUsSUFBSSxDQUFDLHdEQUFhLG1DQUFtQyxHQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1NBQ3BGO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsRUFBRSxFQUFFLElBQUksQ0FBQyx3REFBYSxpQ0FBaUMsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztTQUM3RTtRQUNELFNBQVMsRUFBRTtZQUNULEVBQUUsRUFBRSxJQUFJLENBQUMsd0RBQWEsbUNBQW1DLEdBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7U0FDL0U7UUFDRCxNQUFNLEVBQUU7WUFDTixPQUFPLEVBQUUsSUFBSSxDQUFDLHdEQUFhLHFDQUFxQyxHQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1NBQ3RGO1FBQ0QsWUFBWSxFQUFFO1lBQ1osT0FBTyxFQUFFLElBQUksQ0FBQyx3REFBYSwyQ0FBMkMsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztTQUM1RjtRQUNELFFBQVEsRUFBRTtZQUNSLE9BQU8sRUFBRSxJQUFJLENBQUMsd0RBQWEsdUNBQXVDLEdBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7U0FDeEY7UUFDRCxRQUFRLEVBQUU7WUFDUixPQUFPLEVBQUUsSUFBSSxDQUFDLHdEQUFhLHVDQUF1QyxHQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1NBQ3hGO1FBQ0QsR0FBRyxFQUFFO1lBQ0gsRUFBRSxFQUFFLElBQUksQ0FBQyx3REFBYSw2QkFBNkIsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztZQUN4RSxPQUFPLEVBQUUsSUFBSSxDQUFDLHdEQUFhLGtDQUFrQyxHQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1NBQ25GO1FBQ0QsS0FBSyxFQUFFO1lBQ0wsRUFBRSxFQUFFLElBQUksQ0FBQyx3REFBYSwrQkFBK0IsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztTQUMzRTtRQUNELElBQUksRUFBRTtZQUNKLE9BQU8sRUFBRSxJQUFJLENBQUMsd0RBQWEsbUNBQW1DLEdBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7U0FDcEY7UUFDRCxHQUFHLEVBQUU7WUFDSCxPQUFPLEVBQUUsSUFBSSxDQUFDLHdEQUFhLGtDQUFrQyxHQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1NBQ25GO1FBQ0QsUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFLElBQUksQ0FBQyx3REFBYSx1Q0FBdUMsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztTQUN4RjtRQUNELE9BQU8sRUFBRTtZQUNQLE9BQU8sRUFBRSxJQUFJLENBQUMsd0RBQWEsc0NBQXNDLEdBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7U0FDdkY7UUFDRCxPQUFPLEVBQUU7WUFDUCxPQUFPLEVBQUUsSUFBSSxDQUFDLHdEQUFhLHNDQUFzQyxHQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1NBQ3ZGO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsT0FBTyxFQUFFLElBQUksQ0FBQyx3REFBYSxzQ0FBc0MsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztTQUN2RjtLQUNGO0lBQ0QsWUFBWSxFQUFFO1FBQ1osV0FBVyxFQUFFLElBQUksQ0FBQyx3REFBYSwwQkFBMEIsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztRQUM5RSxVQUFVLEVBQUUsSUFBSSxDQUFDLHdEQUFhLHlCQUF5QixHQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1FBQzVFLFNBQVMsRUFBRSxJQUFJLENBQUMsd0RBQWEsd0JBQXdCLEdBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7UUFDMUUsTUFBTSxFQUFFLElBQUksQ0FBQyx3REFBYSxxQkFBcUIsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztRQUNwRSxJQUFJLEVBQUUsSUFBSSxDQUFDLHdEQUFhLG1CQUFtQixHQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1FBQ2hFLFFBQVEsRUFBRSxJQUFJLENBQUMsd0RBQWEsdUJBQXVCLEdBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7UUFDeEUsUUFBUSxFQUFFLElBQUksQ0FBQyx3REFBYSx1QkFBdUIsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztRQUN4RSxPQUFPLEVBQUUsSUFBSSxDQUFDLHdEQUFhLHNCQUFzQixHQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1FBQ3RFLE9BQU8sRUFBRSxJQUFJLENBQUMsd0RBQWEsc0JBQXNCLEdBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7UUFDdEUsVUFBVSxFQUFFLElBQUksQ0FBQyx3REFBYSx5QkFBeUIsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztRQUM1RSxNQUFNLEVBQUUsSUFBSSxDQUFDLHdEQUFhLHFCQUFxQixHQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1FBQ3BFLFNBQVMsRUFBRSxJQUFJLENBQUMsd0RBQWEsd0JBQXdCLEdBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7UUFDMUUsUUFBUSxFQUFFLElBQUksQ0FBQyx3REFBYSx1QkFBdUIsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztRQUN4RSxPQUFPLEVBQUUsSUFBSSxDQUFDLHdEQUFhLHNCQUFzQixHQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1FBQ3RFLE9BQU8sRUFBRSxJQUFJLENBQUMsd0RBQWEsc0JBQXNCLEdBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7UUFDdEUsS0FBSyxFQUFFLElBQUksQ0FBQyx3REFBYSxvQkFBb0IsR0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQztRQUNsRSxLQUFLLEVBQUUsSUFBSSxDQUFDLHdEQUFhLG9CQUFvQixHQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO1FBQ2xFLElBQUksRUFBRSxJQUFJLENBQUMsd0RBQWEsbUJBQW1CLEdBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7S0FDakU7Q0FDRixDQUFDLENBQUM7QUEvRVUsUUFBQSxrQkFBa0Isc0JBK0U1QiJ9