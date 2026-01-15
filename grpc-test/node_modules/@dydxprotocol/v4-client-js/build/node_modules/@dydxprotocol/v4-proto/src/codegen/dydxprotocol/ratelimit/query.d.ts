import { LimitParams, LimitParamsSDKType } from "./limit_params";
import { LimiterCapacity, LimiterCapacitySDKType } from "./capacity";
import { PendingSendPacket, PendingSendPacketSDKType } from "./pending_send_packet";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** ListLimitParamsRequest is a request type of the ListLimitParams RPC method. */
export interface ListLimitParamsRequest {
}
/** ListLimitParamsRequest is a request type of the ListLimitParams RPC method. */
export interface ListLimitParamsRequestSDKType {
}
/** ListLimitParamsResponse is a response type of the ListLimitParams RPC method. */
export interface ListLimitParamsResponse {
    limitParamsList: LimitParams[];
}
/** ListLimitParamsResponse is a response type of the ListLimitParams RPC method. */
export interface ListLimitParamsResponseSDKType {
    limit_params_list: LimitParamsSDKType[];
}
/**
 * QueryCapacityByDenomRequest is a request type for the CapacityByDenom RPC
 * method.
 */
export interface QueryCapacityByDenomRequest {
    /**
     * QueryCapacityByDenomRequest is a request type for the CapacityByDenom RPC
     * method.
     */
    denom: string;
}
/**
 * QueryCapacityByDenomRequest is a request type for the CapacityByDenom RPC
 * method.
 */
export interface QueryCapacityByDenomRequestSDKType {
    denom: string;
}
/**
 * QueryCapacityByDenomResponse is a response type of the CapacityByDenom RPC
 * method.
 */
export interface QueryCapacityByDenomResponse {
    limiterCapacityList: LimiterCapacity[];
}
/**
 * QueryCapacityByDenomResponse is a response type of the CapacityByDenom RPC
 * method.
 */
export interface QueryCapacityByDenomResponseSDKType {
    limiter_capacity_list: LimiterCapacitySDKType[];
}
/**
 * QueryAllPendingSendPacketsRequest is a request type for the
 * AllPendingSendPackets RPC
 */
export interface QueryAllPendingSendPacketsRequest {
}
/**
 * QueryAllPendingSendPacketsRequest is a request type for the
 * AllPendingSendPackets RPC
 */
export interface QueryAllPendingSendPacketsRequestSDKType {
}
/**
 * QueryAllPendingSendPacketsResponse is a response type of the
 * AllPendingSendPackets RPC
 */
export interface QueryAllPendingSendPacketsResponse {
    pendingSendPackets: PendingSendPacket[];
}
/**
 * QueryAllPendingSendPacketsResponse is a response type of the
 * AllPendingSendPackets RPC
 */
export interface QueryAllPendingSendPacketsResponseSDKType {
    pending_send_packets: PendingSendPacketSDKType[];
}
export declare const ListLimitParamsRequest: {
    encode(_: ListLimitParamsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ListLimitParamsRequest;
    fromPartial(_: DeepPartial<ListLimitParamsRequest>): ListLimitParamsRequest;
};
export declare const ListLimitParamsResponse: {
    encode(message: ListLimitParamsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ListLimitParamsResponse;
    fromPartial(object: DeepPartial<ListLimitParamsResponse>): ListLimitParamsResponse;
};
export declare const QueryCapacityByDenomRequest: {
    encode(message: QueryCapacityByDenomRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryCapacityByDenomRequest;
    fromPartial(object: DeepPartial<QueryCapacityByDenomRequest>): QueryCapacityByDenomRequest;
};
export declare const QueryCapacityByDenomResponse: {
    encode(message: QueryCapacityByDenomResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryCapacityByDenomResponse;
    fromPartial(object: DeepPartial<QueryCapacityByDenomResponse>): QueryCapacityByDenomResponse;
};
export declare const QueryAllPendingSendPacketsRequest: {
    encode(_: QueryAllPendingSendPacketsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryAllPendingSendPacketsRequest;
    fromPartial(_: DeepPartial<QueryAllPendingSendPacketsRequest>): QueryAllPendingSendPacketsRequest;
};
export declare const QueryAllPendingSendPacketsResponse: {
    encode(message: QueryAllPendingSendPacketsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryAllPendingSendPacketsResponse;
    fromPartial(object: DeepPartial<QueryAllPendingSendPacketsResponse>): QueryAllPendingSendPacketsResponse;
};
