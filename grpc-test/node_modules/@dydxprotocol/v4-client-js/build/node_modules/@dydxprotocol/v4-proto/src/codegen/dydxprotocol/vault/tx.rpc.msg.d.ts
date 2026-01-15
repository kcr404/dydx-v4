import { Rpc } from "../../helpers";
import { MsgDepositToMegavault, MsgDepositToMegavaultResponse, MsgWithdrawFromMegavault, MsgWithdrawFromMegavaultResponse, MsgUpdateDefaultQuotingParams, MsgUpdateDefaultQuotingParamsResponse, MsgUpdateOperatorParams, MsgUpdateOperatorParamsResponse, MsgSetVaultParams, MsgSetVaultParamsResponse, MsgUnlockShares, MsgUnlockSharesResponse, MsgAllocateToVault, MsgAllocateToVaultResponse, MsgRetrieveFromVault, MsgRetrieveFromVaultResponse } from "./tx";
/** Msg defines the Msg service. */
export interface Msg {
    /** DepositToMegavault deposits funds into megavault. */
    depositToMegavault(request: MsgDepositToMegavault): Promise<MsgDepositToMegavaultResponse>;
    /** WithdrawFromMegavault withdraws shares from megavault. */
    withdrawFromMegavault(request: MsgWithdrawFromMegavault): Promise<MsgWithdrawFromMegavaultResponse>;
    /** UpdateDefaultQuotingParams updates the default quoting params in state. */
    updateDefaultQuotingParams(request: MsgUpdateDefaultQuotingParams): Promise<MsgUpdateDefaultQuotingParamsResponse>;
    /** UpdateOperatorParams sets the parameters regarding megavault operator. */
    updateOperatorParams(request: MsgUpdateOperatorParams): Promise<MsgUpdateOperatorParamsResponse>;
    /** SetVaultParams sets the parameters of a specific vault. */
    setVaultParams(request: MsgSetVaultParams): Promise<MsgSetVaultParamsResponse>;
    /**
     * UnlockShares unlocks an owner's shares that are due to unlock by the block
     * height that this transaction is included in.
     */
    unlockShares(request: MsgUnlockShares): Promise<MsgUnlockSharesResponse>;
    /** AllocateToVault allocates funds from main vault to a vault. */
    allocateToVault(request: MsgAllocateToVault): Promise<MsgAllocateToVaultResponse>;
    /** RetrieveFromVault retrieves funds from a vault to main vault. */
    retrieveFromVault(request: MsgRetrieveFromVault): Promise<MsgRetrieveFromVaultResponse>;
}
export declare class MsgClientImpl implements Msg {
    private readonly rpc;
    constructor(rpc: Rpc);
    depositToMegavault(request: MsgDepositToMegavault): Promise<MsgDepositToMegavaultResponse>;
    withdrawFromMegavault(request: MsgWithdrawFromMegavault): Promise<MsgWithdrawFromMegavaultResponse>;
    updateDefaultQuotingParams(request: MsgUpdateDefaultQuotingParams): Promise<MsgUpdateDefaultQuotingParamsResponse>;
    updateOperatorParams(request: MsgUpdateOperatorParams): Promise<MsgUpdateOperatorParamsResponse>;
    setVaultParams(request: MsgSetVaultParams): Promise<MsgSetVaultParamsResponse>;
    unlockShares(request: MsgUnlockShares): Promise<MsgUnlockSharesResponse>;
    allocateToVault(request: MsgAllocateToVault): Promise<MsgAllocateToVaultResponse>;
    retrieveFromVault(request: MsgRetrieveFromVault): Promise<MsgRetrieveFromVaultResponse>;
}
