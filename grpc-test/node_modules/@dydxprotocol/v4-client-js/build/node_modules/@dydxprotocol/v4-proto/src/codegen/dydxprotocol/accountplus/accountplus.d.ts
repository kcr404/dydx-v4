/// <reference types="long" />
import * as _m0 from "protobufjs/minimal";
import { DeepPartial, Long } from "../../helpers";
/** Account State */
export interface AccountState {
    address: string;
    timestampNonceDetails?: TimestampNonceDetails;
}
/** Account State */
export interface AccountStateSDKType {
    address: string;
    timestamp_nonce_details?: TimestampNonceDetailsSDKType;
}
/** Timestamp nonce details */
export interface TimestampNonceDetails {
    /** unsorted list of n most recent timestamp nonces */
    timestampNonces: Long[];
    /** max timestamp nonce that was ejected from list above */
    maxEjectedNonce: Long;
}
/** Timestamp nonce details */
export interface TimestampNonceDetailsSDKType {
    timestamp_nonces: Long[];
    max_ejected_nonce: Long;
}
export declare const AccountState: {
    encode(message: AccountState, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AccountState;
    fromPartial(object: DeepPartial<AccountState>): AccountState;
};
export declare const TimestampNonceDetails: {
    encode(message: TimestampNonceDetails, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TimestampNonceDetails;
    fromPartial(object: DeepPartial<TimestampNonceDetails>): TimestampNonceDetails;
};
