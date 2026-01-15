/// <reference types="long" />
import { AccountAuthenticator, AccountAuthenticatorSDKType } from "./models";
import { AccountState, AccountStateSDKType } from "./accountplus";
import { Params, ParamsSDKType } from "./params";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial, Long } from "../../helpers";
/**
 * AuthenticatorData represents a genesis exported account with Authenticators.
 * The address is used as the key, and the account authenticators are stored in
 * the authenticators field.
 */
export interface AuthenticatorData {
    /** address is an account address, one address can have many authenticators */
    address: string;
    /**
     * authenticators are the account's authenticators, these can be multiple
     * types including SignatureVerification, AllOfs, CosmWasmAuthenticators, etc
     */
    authenticators: AccountAuthenticator[];
}
/**
 * AuthenticatorData represents a genesis exported account with Authenticators.
 * The address is used as the key, and the account authenticators are stored in
 * the authenticators field.
 */
export interface AuthenticatorDataSDKType {
    address: string;
    authenticators: AccountAuthenticatorSDKType[];
}
/** Module genesis state */
export interface GenesisState {
    accounts: AccountState[];
    /** params define the parameters for the authenticator module. */
    params?: Params;
    /** next_authenticator_id is the next available authenticator ID. */
    nextAuthenticatorId: Long;
    /**
     * authenticator_data contains the data for multiple accounts, each with their
     * authenticators.
     */
    authenticatorData: AuthenticatorData[];
}
/** Module genesis state */
export interface GenesisStateSDKType {
    accounts: AccountStateSDKType[];
    params?: ParamsSDKType;
    next_authenticator_id: Long;
    authenticator_data: AuthenticatorDataSDKType[];
}
export declare const AuthenticatorData: {
    encode(message: AuthenticatorData, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AuthenticatorData;
    fromPartial(object: DeepPartial<AuthenticatorData>): AuthenticatorData;
};
export declare const GenesisState: {
    encode(message: GenesisState, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState;
    fromPartial(object: DeepPartial<GenesisState>): GenesisState;
};
