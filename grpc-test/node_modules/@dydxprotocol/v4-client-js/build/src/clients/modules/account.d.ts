import { OrderSide, OrderStatus, OrderType, PositionStatus, TickerType, TradingRewardAggregationPeriod } from '../constants';
import { Data } from '../types';
import RestClient from './rest';
/**
 * @description REST endpoints for data related to a particular address.
 */
export default class AccountClient extends RestClient {
    getSubaccounts(address: string, limit?: number): Promise<Data>;
    getSubaccount(address: string, subaccountNumber: number): Promise<Data>;
    getParentSubaccount(address: string, parentSubaccountNumber: number): Promise<Data>;
    getSubaccountPerpetualPositions(address: string, subaccountNumber: number, status?: PositionStatus | null, limit?: number | null, createdBeforeOrAtHeight?: number | null, createdBeforeOrAt?: string | null): Promise<Data>;
    getSubaccountAssetPositions(address: string, subaccountNumber: number, status?: PositionStatus | null, limit?: number | null, createdBeforeOrAtHeight?: number | null, createdBeforeOrAt?: string | null): Promise<Data>;
    getTransfersBetween(sourceAddress: string, sourceSubaccountNumber: string, recipientAddress: string, recipientSubaccountNumber: string, createdBeforeOrAtHeight?: number | null, createdBeforeOrAt?: string | null): Promise<Data>;
    getSubaccountTransfers(address: string, subaccountNumber: number, limit?: number | null, createdBeforeOrAtHeight?: number | null, createdBeforeOrAt?: string | null, page?: number | null): Promise<Data>;
    getParentSubaccountNumberTransfers(address: string, parentSubaccountNumber: number, limit?: number | null, createdBeforeOrAtHeight?: number | null, createdBeforeOrAt?: string | null, page?: number | null): Promise<Data>;
    getSubaccountOrders(address: string, subaccountNumber: number, ticker?: string | null, tickerType?: TickerType, side?: OrderSide | null, status?: OrderStatus | null, type?: OrderType | null, limit?: number | null, goodTilBlockBeforeOrAt?: number | null, goodTilBlockTimeBeforeOrAt?: string | null, returnLatestOrders?: boolean | null): Promise<Data>;
    getParentSubaccountNumberOrders(address: string, parentSubaccountNumber: number, ticker?: string | null, side?: OrderSide | null, status?: OrderStatus | null, type?: OrderType | null, limit?: number | null, goodTilBlockBeforeOrAt?: number | null, goodTilBlockTimeBeforeOrAt?: string | null, returnLatestOrders?: boolean | null): Promise<Data>;
    getOrder(orderId: string): Promise<Data>;
    getSubaccountFills(address: string, subaccountNumber: number, ticker?: string | null, tickerType?: TickerType, limit?: number | null, createdBeforeOrAtHeight?: number | null, createdBeforeOrAt?: string | null, page?: number | null): Promise<Data>;
    getParentSubaccountNumberFills(address: string, parentSubaccountNumber: number, ticker?: string | null, tickerType?: TickerType, limit?: number | null, createdBeforeOrAtHeight?: number | null, createdBeforeOrAt?: string | null, page?: number | null): Promise<Data>;
    getSubaccountHistoricalPNLs(address: string, subaccountNumber: number, createdBeforeOrAtHeight?: number | null, createdBeforeOrAt?: string | null, createdOnOrAfterHeight?: number | null, createdOnOrAfter?: string | null, limit?: number | null, page?: number | null): Promise<Data>;
    getParentSubaccountNumberHistoricalPNLs(address: string, parentSubaccountNumber: number, createdBeforeOrAtHeight?: number | null, createdBeforeOrAt?: string | null, createdOnOrAfterHeight?: number | null, createdOnOrAfter?: string | null, limit?: number | null, page?: number | null): Promise<Data>;
    getHistoricalTradingRewardsAggregations(address: string, period: TradingRewardAggregationPeriod, limit?: number, startingBeforeOrAt?: string, startingBeforeOrAtHeight?: string): Promise<Data>;
    getHistoricalBlockTradingRewards(address: string, limit?: number, startingBeforeOrAt?: string, startingBeforeOrAtHeight?: string): Promise<Data>;
}
