import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** ListingVaultDepositParams represents the params for PML megavault deposits */
export interface ListingVaultDepositParams {
    /** Amount that will be deposited into the new market vault exclusively */
    newVaultDepositAmount: Uint8Array;
    /**
     * Amount deposited into the main vault exclusively. This amount does not
     * include the amount deposited into the new vault.
     */
    mainVaultDepositAmount: Uint8Array;
    /** Lockup period for this deposit */
    numBlocksToLockShares: number;
}
/** ListingVaultDepositParams represents the params for PML megavault deposits */
export interface ListingVaultDepositParamsSDKType {
    new_vault_deposit_amount: Uint8Array;
    main_vault_deposit_amount: Uint8Array;
    num_blocks_to_lock_shares: number;
}
export declare const ListingVaultDepositParams: {
    encode(message: ListingVaultDepositParams, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ListingVaultDepositParams;
    fromPartial(object: DeepPartial<ListingVaultDepositParams>): ListingVaultDepositParams;
};
