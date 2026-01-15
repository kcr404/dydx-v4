import { Rpc } from "../../helpers";
import { MsgRegisterAffiliate, MsgRegisterAffiliateResponse, MsgUpdateAffiliateTiers, MsgUpdateAffiliateTiersResponse, MsgUpdateAffiliateWhitelist, MsgUpdateAffiliateWhitelistResponse } from "./tx";
/** Msg defines the Msg service. */
export interface Msg {
    /** RegisterAffiliate registers a referee-affiliate relationship */
    registerAffiliate(request: MsgRegisterAffiliate): Promise<MsgRegisterAffiliateResponse>;
    /** UpdateAffiliateTiers updates affiliate tiers */
    updateAffiliateTiers(request: MsgUpdateAffiliateTiers): Promise<MsgUpdateAffiliateTiersResponse>;
    /** UpdateAffiliateWhitelist updates affiliate whitelist */
    updateAffiliateWhitelist(request: MsgUpdateAffiliateWhitelist): Promise<MsgUpdateAffiliateWhitelistResponse>;
}
export declare class MsgClientImpl implements Msg {
    private readonly rpc;
    constructor(rpc: Rpc);
    registerAffiliate(request: MsgRegisterAffiliate): Promise<MsgRegisterAffiliateResponse>;
    updateAffiliateTiers(request: MsgUpdateAffiliateTiers): Promise<MsgUpdateAffiliateTiersResponse>;
    updateAffiliateWhitelist(request: MsgUpdateAffiliateWhitelist): Promise<MsgUpdateAffiliateWhitelistResponse>;
}
