import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** VaultType represents different types of vaults. */
export declare enum VaultType {
    /** VAULT_TYPE_UNSPECIFIED - Default value, invalid and unused. */
    VAULT_TYPE_UNSPECIFIED = 0,
    /** VAULT_TYPE_CLOB - Vault is associated with a CLOB pair. */
    VAULT_TYPE_CLOB = 1,
    UNRECOGNIZED = -1
}
export declare const VaultTypeSDKType: typeof VaultType;
export declare function vaultTypeFromJSON(object: any): VaultType;
export declare function vaultTypeToJSON(object: VaultType): string;
/** VaultStatus represents the status of a vault. */
export declare enum VaultStatus {
    /** VAULT_STATUS_UNSPECIFIED - Default value, invalid and unused. */
    VAULT_STATUS_UNSPECIFIED = 0,
    /**
     * VAULT_STATUS_DEACTIVATED - Don’t place orders. Does not count toward global vault balances.
     * A vault can only be set to this status if its equity is non-positive.
     */
    VAULT_STATUS_DEACTIVATED = 1,
    /** VAULT_STATUS_STAND_BY - Don’t place orders. Does count towards global vault balances. */
    VAULT_STATUS_STAND_BY = 2,
    /** VAULT_STATUS_QUOTING - Places orders on both sides of the book. */
    VAULT_STATUS_QUOTING = 3,
    /** VAULT_STATUS_CLOSE_ONLY - Only place orders that close the position. */
    VAULT_STATUS_CLOSE_ONLY = 4,
    UNRECOGNIZED = -1
}
export declare const VaultStatusSDKType: typeof VaultStatus;
export declare function vaultStatusFromJSON(object: any): VaultStatus;
export declare function vaultStatusToJSON(object: VaultStatus): string;
/** VaultId uniquely identifies a vault by its type and number. */
export interface VaultId {
    /** Type of the vault. */
    type: VaultType;
    /** Unique ID of the vault within above type. */
    number: number;
}
/** VaultId uniquely identifies a vault by its type and number. */
export interface VaultIdSDKType {
    type: VaultType;
    number: number;
}
export declare const VaultId: {
    encode(message: VaultId, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): VaultId;
    fromPartial(object: DeepPartial<VaultId>): VaultId;
};
