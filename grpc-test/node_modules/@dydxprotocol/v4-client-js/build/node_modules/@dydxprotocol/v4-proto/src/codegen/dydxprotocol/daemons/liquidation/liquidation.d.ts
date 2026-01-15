import { SubaccountId, SubaccountIdSDKType } from "../../subaccounts/subaccount";
import { SubaccountOpenPositionInfo, SubaccountOpenPositionInfoSDKType } from "../../clob/liquidations";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../../helpers";
/**
 * LiquidateSubaccountsRequest is a request message that contains a list of
 * subaccount ids that potentially need to be liquidated. The list of subaccount
 * ids should not contain duplicates. The application should re-verify these
 * subaccount ids against current state before liquidating their positions.
 */
export interface LiquidateSubaccountsRequest {
    /** The block height at which the liquidation daemon is processing. */
    blockHeight: number;
    /** The list of liquidatable subaccount ids. */
    liquidatableSubaccountIds: SubaccountId[];
    /** The list of subaccount ids with negative total net collateral. */
    negativeTncSubaccountIds: SubaccountId[];
    subaccountOpenPositionInfo: SubaccountOpenPositionInfo[];
}
/**
 * LiquidateSubaccountsRequest is a request message that contains a list of
 * subaccount ids that potentially need to be liquidated. The list of subaccount
 * ids should not contain duplicates. The application should re-verify these
 * subaccount ids against current state before liquidating their positions.
 */
export interface LiquidateSubaccountsRequestSDKType {
    block_height: number;
    liquidatable_subaccount_ids: SubaccountIdSDKType[];
    negative_tnc_subaccount_ids: SubaccountIdSDKType[];
    subaccount_open_position_info: SubaccountOpenPositionInfoSDKType[];
}
/**
 * LiquidateSubaccountsResponse is a response message for
 * LiquidateSubaccountsRequest.
 */
export interface LiquidateSubaccountsResponse {
}
/**
 * LiquidateSubaccountsResponse is a response message for
 * LiquidateSubaccountsRequest.
 */
export interface LiquidateSubaccountsResponseSDKType {
}
export declare const LiquidateSubaccountsRequest: {
    encode(message: LiquidateSubaccountsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): LiquidateSubaccountsRequest;
    fromPartial(object: DeepPartial<LiquidateSubaccountsRequest>): LiquidateSubaccountsRequest;
};
export declare const LiquidateSubaccountsResponse: {
    encode(_: LiquidateSubaccountsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): LiquidateSubaccountsResponse;
    fromPartial(_: DeepPartial<LiquidateSubaccountsResponse>): LiquidateSubaccountsResponse;
};
