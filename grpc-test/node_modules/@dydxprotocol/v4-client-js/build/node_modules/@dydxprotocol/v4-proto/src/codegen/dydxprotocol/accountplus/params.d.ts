import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** Params defines the parameters for the module. */
export interface Params {
    /**
     * IsSmartAccountActive defines the state of the authenticator.
     * If set to false, the authenticator module will not be used
     * and the classic cosmos sdk authentication will be used instead.
     */
    isSmartAccountActive: boolean;
}
/** Params defines the parameters for the module. */
export interface ParamsSDKType {
    is_smart_account_active: boolean;
}
export declare const Params: {
    encode(message: Params, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Params;
    fromPartial(object: DeepPartial<Params>): Params;
};
