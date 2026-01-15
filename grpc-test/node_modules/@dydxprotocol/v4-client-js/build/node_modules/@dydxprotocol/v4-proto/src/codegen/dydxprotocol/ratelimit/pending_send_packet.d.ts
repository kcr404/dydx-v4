/// <reference types="long" />
import { Long, DeepPartial } from "../../helpers";
import * as _m0 from "protobufjs/minimal";
/**
 * PendingSendPacket contains the channel_id and sequence pair to identify a
 * pending packet
 */
export interface PendingSendPacket {
    channelId: string;
    sequence: Long;
}
/**
 * PendingSendPacket contains the channel_id and sequence pair to identify a
 * pending packet
 */
export interface PendingSendPacketSDKType {
    channel_id: string;
    sequence: Long;
}
export declare const PendingSendPacket: {
    encode(message: PendingSendPacket, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PendingSendPacket;
    fromPartial(object: DeepPartial<PendingSendPacket>): PendingSendPacket;
};
