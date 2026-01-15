import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** MsgSlashValidator is the Msg/SlashValidator request type. */
export interface MsgSlashValidator {
    authority: string;
    /** Consensus address of the validator to slash */
    validatorAddress: string;
    /**
     * Colloquially, the height at which the validator is deemed to have
     * misbehaved. In practice, this is the height used to determine the targets
     * of the slash. For example, undelegating after this height will not escape
     * slashing. This height should be set to a recent height at the time of the
     * proposal to prevent delegators from undelegating during the vote period.
     * i.e. infraction_height <= proposal submission height.
     *
     * NB: At the time this message is applied, this height must have occured
     * equal to or less than an unbonding period in the past in order for the
     * slash to be effective.
     * i.e. time(proposal pass height) - time(infraction_height) < unbonding
     * period
     */
    infractionHeight: number;
    /**
     * Tokens of the validator at the specified height. Used to compute the slash
     * amount. The x/staking HistoricalInfo query endpoint can be used to find
     * this.
     */
    tokensAtInfractionHeight: Uint8Array;
    /**
     * Multiplier for how much of the validator's stake should be slashed.
     * slash_factor * tokens_at_infraction_height = tokens slashed
     */
    slashFactor: string;
}
/** MsgSlashValidator is the Msg/SlashValidator request type. */
export interface MsgSlashValidatorSDKType {
    authority: string;
    validator_address: string;
    infraction_height: number;
    tokens_at_infraction_height: Uint8Array;
    slash_factor: string;
}
/** MsgSlashValidatorResponse is the Msg/SlashValidator response type. */
export interface MsgSlashValidatorResponse {
}
/** MsgSlashValidatorResponse is the Msg/SlashValidator response type. */
export interface MsgSlashValidatorResponseSDKType {
}
export declare const MsgSlashValidator: {
    encode(message: MsgSlashValidator, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgSlashValidator;
    fromPartial(object: DeepPartial<MsgSlashValidator>): MsgSlashValidator;
};
export declare const MsgSlashValidatorResponse: {
    encode(_: MsgSlashValidatorResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgSlashValidatorResponse;
    fromPartial(_: DeepPartial<MsgSlashValidatorResponse>): MsgSlashValidatorResponse;
};
