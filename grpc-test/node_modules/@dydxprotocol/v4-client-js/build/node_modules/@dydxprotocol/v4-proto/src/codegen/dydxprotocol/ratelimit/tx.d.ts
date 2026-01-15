import { LimitParams, LimitParamsSDKType } from "./limit_params";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** MsgSetLimitParams is the Msg/SetLimitParams request type. */
export interface MsgSetLimitParams {
    authority: string;
    /** Defines the parameters to set. All parameters must be supplied. */
    limitParams?: LimitParams;
}
/** MsgSetLimitParams is the Msg/SetLimitParams request type. */
export interface MsgSetLimitParamsSDKType {
    authority: string;
    limit_params?: LimitParamsSDKType;
}
/** MsgSetLimitParamsResponse is the Msg/SetLimitParams response type. */
export interface MsgSetLimitParamsResponse {
}
/** MsgSetLimitParamsResponse is the Msg/SetLimitParams response type. */
export interface MsgSetLimitParamsResponseSDKType {
}
export declare const MsgSetLimitParams: {
    encode(message: MsgSetLimitParams, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetLimitParams;
    fromPartial(object: DeepPartial<MsgSetLimitParams>): MsgSetLimitParams;
};
export declare const MsgSetLimitParamsResponse: {
    encode(_: MsgSetLimitParamsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetLimitParamsResponse;
    fromPartial(_: DeepPartial<MsgSetLimitParamsResponse>): MsgSetLimitParamsResponse;
};
