import { NumShares, NumSharesSDKType, OwnerShare, OwnerShareSDKType, OwnerShareUnlocks, OwnerShareUnlocksSDKType } from "./share";
import { QuotingParams, QuotingParamsSDKType, OperatorParams, OperatorParamsSDKType, VaultParams, VaultParamsSDKType } from "./params";
import { VaultId, VaultIdSDKType } from "./vault";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** GenesisState defines `x/vault`'s genesis state. */
export interface GenesisState {
    /** The total number of shares, including any locked ones. */
    totalShares?: NumShares;
    /** The shares of each owner, including any locked ones. */
    ownerShares: OwnerShare[];
    /** The vaults. */
    vaults: Vault[];
    /** The default quoting parameters for all vaults. */
    defaultQuotingParams?: QuotingParams;
    /** All owner share unlocks. */
    allOwnerShareUnlocks: OwnerShareUnlocks[];
    /** The parameters regarding megavault operator. */
    operatorParams?: OperatorParams;
}
/** GenesisState defines `x/vault`'s genesis state. */
export interface GenesisStateSDKType {
    total_shares?: NumSharesSDKType;
    owner_shares: OwnerShareSDKType[];
    vaults: VaultSDKType[];
    default_quoting_params?: QuotingParamsSDKType;
    all_owner_share_unlocks: OwnerShareUnlocksSDKType[];
    operator_params?: OperatorParamsSDKType;
}
/** Vault defines the state of a vault. */
export interface Vault {
    /** The ID of the vault. */
    vaultId?: VaultId;
    /** The parameters of the vault. */
    vaultParams?: VaultParams;
    /** The client IDs of the most recently placed orders of the vault. */
    mostRecentClientIds: number[];
}
/** Vault defines the state of a vault. */
export interface VaultSDKType {
    vault_id?: VaultIdSDKType;
    vault_params?: VaultParamsSDKType;
    most_recent_client_ids: number[];
}
/**
 * GenesisStateV6 defines `x/vault`'s genesis state in v6.x.
 * Deprecated since v7.x in favor of GenesisState.
 */
export interface GenesisStateV6 {
    /** The vaults. */
    vaults: Vault[];
    /** The default quoting parameters for all vaults. */
    defaultQuotingParams?: QuotingParams;
}
/**
 * GenesisStateV6 defines `x/vault`'s genesis state in v6.x.
 * Deprecated since v7.x in favor of GenesisState.
 */
export interface GenesisStateV6SDKType {
    vaults: VaultSDKType[];
    default_quoting_params?: QuotingParamsSDKType;
}
/**
 * VaultV6 defines the state of a vault.
 * Deprecated since v7.x in favor of Vault.
 */
export interface VaultV6 {
    /** The ID of the vault. */
    vaultId?: VaultId;
    /** The total number of shares in the vault. */
    totalShares?: NumShares;
    /** The shares of each owner in the vault. */
    ownerShares: OwnerShare[];
    /** The parameters of the vault. */
    vaultParams?: VaultParams;
    /** The client IDs of the most recently placed orders of the vault. */
    mostRecentClientIds: number[];
}
/**
 * VaultV6 defines the state of a vault.
 * Deprecated since v7.x in favor of Vault.
 */
export interface VaultV6SDKType {
    vault_id?: VaultIdSDKType;
    total_shares?: NumSharesSDKType;
    owner_shares: OwnerShareSDKType[];
    vault_params?: VaultParamsSDKType;
    most_recent_client_ids: number[];
}
export declare const GenesisState: {
    encode(message: GenesisState, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState;
    fromPartial(object: DeepPartial<GenesisState>): GenesisState;
};
export declare const Vault: {
    encode(message: Vault, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Vault;
    fromPartial(object: DeepPartial<Vault>): Vault;
};
export declare const GenesisStateV6: {
    encode(message: GenesisStateV6, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GenesisStateV6;
    fromPartial(object: DeepPartial<GenesisStateV6>): GenesisStateV6;
};
export declare const VaultV6: {
    encode(message: VaultV6, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): VaultV6;
    fromPartial(object: DeepPartial<VaultV6>): VaultV6;
};
