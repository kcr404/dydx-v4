import { Rpc } from "../../helpers";
import { QueryClient } from "@cosmjs/stargate";
import { AffiliateInfoRequest, AffiliateInfoResponse, ReferredByRequest, ReferredByResponse, AllAffiliateTiersRequest, AllAffiliateTiersResponse, AffiliateWhitelistRequest, AffiliateWhitelistResponse } from "./query";
/** Query defines the gRPC querier service. */
export interface Query {
    /** Query AffiliateInfo returns the affiliate info for a given address. */
    affiliateInfo(request: AffiliateInfoRequest): Promise<AffiliateInfoResponse>;
    /** Query ReferredBy returns the affiliate that referred a given address. */
    referredBy(request: ReferredByRequest): Promise<ReferredByResponse>;
    /** Query AllAffiliateTiers returns all affiliate tiers. */
    allAffiliateTiers(request?: AllAffiliateTiersRequest): Promise<AllAffiliateTiersResponse>;
    /** Query AffiliateWhitelist returns the affiliate whitelist. */
    affiliateWhitelist(request?: AffiliateWhitelistRequest): Promise<AffiliateWhitelistResponse>;
}
export declare class QueryClientImpl implements Query {
    private readonly rpc;
    constructor(rpc: Rpc);
    affiliateInfo(request: AffiliateInfoRequest): Promise<AffiliateInfoResponse>;
    referredBy(request: ReferredByRequest): Promise<ReferredByResponse>;
    allAffiliateTiers(request?: AllAffiliateTiersRequest): Promise<AllAffiliateTiersResponse>;
    affiliateWhitelist(request?: AffiliateWhitelistRequest): Promise<AffiliateWhitelistResponse>;
}
export declare const createRpcQueryExtension: (base: QueryClient) => {
    affiliateInfo(request: AffiliateInfoRequest): Promise<AffiliateInfoResponse>;
    referredBy(request: ReferredByRequest): Promise<ReferredByResponse>;
    allAffiliateTiers(request?: AllAffiliateTiersRequest): Promise<AllAffiliateTiersResponse>;
    affiliateWhitelist(request?: AffiliateWhitelistRequest): Promise<AffiliateWhitelistResponse>;
};
