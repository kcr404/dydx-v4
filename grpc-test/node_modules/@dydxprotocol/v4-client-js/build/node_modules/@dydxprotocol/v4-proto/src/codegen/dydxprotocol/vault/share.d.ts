import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
/** NumShares represents the number of shares. */
export interface NumShares {
    /** Number of shares. */
    numShares: Uint8Array;
}
/** NumShares represents the number of shares. */
export interface NumSharesSDKType {
    num_shares: Uint8Array;
}
/** OwnerShare is a type for owner shares. */
export interface OwnerShare {
    owner: string;
    shares?: NumShares;
}
/** OwnerShare is a type for owner shares. */
export interface OwnerShareSDKType {
    owner: string;
    shares?: NumSharesSDKType;
}
/** OwnerShareUnlocks stores share unlocks for an owner. */
export interface OwnerShareUnlocks {
    /** Address of the owner of below shares. */
    ownerAddress: string;
    /** All share unlocks. */
    shareUnlocks: ShareUnlock[];
}
/** OwnerShareUnlocks stores share unlocks for an owner. */
export interface OwnerShareUnlocksSDKType {
    owner_address: string;
    share_unlocks: ShareUnlockSDKType[];
}
/**
 * ShareUnlock stores a single instance of `shares` number of shares
 * unlocking at block height `unlock_block_height`.
 */
export interface ShareUnlock {
    /** Number of shares to unlock. */
    shares?: NumShares;
    /** Block height at which above shares unlock. */
    unlockBlockHeight: number;
}
/**
 * ShareUnlock stores a single instance of `shares` number of shares
 * unlocking at block height `unlock_block_height`.
 */
export interface ShareUnlockSDKType {
    shares?: NumSharesSDKType;
    unlock_block_height: number;
}
export declare const NumShares: {
    encode(message: NumShares, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): NumShares;
    fromPartial(object: DeepPartial<NumShares>): NumShares;
};
export declare const OwnerShare: {
    encode(message: OwnerShare, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OwnerShare;
    fromPartial(object: DeepPartial<OwnerShare>): OwnerShare;
};
export declare const OwnerShareUnlocks: {
    encode(message: OwnerShareUnlocks, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OwnerShareUnlocks;
    fromPartial(object: DeepPartial<OwnerShareUnlocks>): OwnerShareUnlocks;
};
export declare const ShareUnlock: {
    encode(message: ShareUnlock, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ShareUnlock;
    fromPartial(object: DeepPartial<ShareUnlock>): ShareUnlock;
};
