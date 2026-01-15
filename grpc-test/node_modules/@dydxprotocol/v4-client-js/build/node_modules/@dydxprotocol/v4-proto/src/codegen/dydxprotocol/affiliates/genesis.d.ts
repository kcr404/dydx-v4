import { AffiliateTiers, AffiliateTiersSDKType } from "./affiliates";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** GenesisState defines generis state of `x/affiliates` */
export interface GenesisState {
    /** The list of affiliate tiers */
    affiliateTiers?: AffiliateTiers;
}
/** GenesisState defines generis state of `x/affiliates` */
export interface GenesisStateSDKType {
    affiliate_tiers?: AffiliateTiersSDKType;
}
export declare const GenesisState: {
    encode(message: GenesisState, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState;
    fromPartial(object: DeepPartial<GenesisState>): GenesisState;
};
