"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MARKET_BTC_USD = void 0;
const constants_1 = require("../../../src/clients/constants");
const indexer_client_1 = require("../../../src/clients/indexer-client");
// ------------ Markets ------------
exports.MARKET_BTC_USD = 'BTC-USD';
describe('IndexerClient', () => {
    const client = new indexer_client_1.IndexerClient(constants_1.Network.testnet().indexerConfig);
    describe('Market Endpoints', () => {
        it('Markets', async () => {
            const response = await client.markets.getPerpetualMarkets();
            const btc = response.markets[exports.MARKET_BTC_USD];
            const status = btc.status;
            expect(status).toBe('ACTIVE');
        });
        it('BTC Market', async () => {
            const response = await client.markets.getPerpetualMarkets(exports.MARKET_BTC_USD);
            const btc = response.markets[exports.MARKET_BTC_USD];
            const status = btc.status;
            expect(status).toBe('ACTIVE');
        });
        it('BTC Trades', async () => {
            const response = await client.markets.getPerpetualMarketTrades(exports.MARKET_BTC_USD);
            const trades = response.trades;
            expect(trades).not.toBeUndefined();
        });
        it('BTC Trades Pagination', async () => {
            const response = await client.markets.getPerpetualMarketTrades(exports.MARKET_BTC_USD, undefined, undefined, 1, 1);
            const trades = response.trades;
            expect(trades).not.toBeUndefined();
            if (trades.length > 0) {
                const trade = trades[0];
                expect(trade).not.toBeNull();
                expect(response.totalResults).toBeGreaterThanOrEqual(1);
            }
            expect(response.pageSize).toStrictEqual(1);
            expect(response.offset).toStrictEqual(0);
        });
        it('BTC Orderbook', async () => {
            const response = await client.markets.getPerpetualMarketOrderbook(exports.MARKET_BTC_USD);
            const asks = response.asks;
            const bids = response.bids;
            expect(asks).not.toBeUndefined();
            expect(bids).not.toBeUndefined();
        });
        it('BTC Candles', async () => {
            const response = await client.markets.getPerpetualMarketCandles(exports.MARKET_BTC_USD, '1MIN');
            const candles = response.candles;
            expect(candles).not.toBeUndefined();
        });
        it('BTC Historical Funding', async () => {
            const response = await client.markets.getPerpetualMarketHistoricalFunding(exports.MARKET_BTC_USD);
            expect(response).not.toBeNull();
            const historicalFunding = response.historicalFunding;
            expect(historicalFunding).not.toBeNull();
            if (historicalFunding.length > 0) {
                const historicalFunding0 = historicalFunding[0];
                expect(historicalFunding0).not.toBeNull();
            }
        });
        it('Sparklines', async () => {
            const response = await client.markets.getPerpetualMarketSparklines();
            const btcSparklines = response[exports.MARKET_BTC_USD];
            expect(btcSparklines).not.toBeUndefined();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFya2V0c0VuZHBvaW50cy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vX190ZXN0c19fL21vZHVsZXMvY2xpZW50L01hcmtldHNFbmRwb2ludHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBeUQ7QUFDekQsd0VBQW9FO0FBRXBFLG9DQUFvQztBQUN2QixRQUFBLGNBQWMsR0FBVyxTQUFTLENBQUM7QUFFaEQsUUFBUSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7SUFDN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSw4QkFBYSxDQUFDLG1CQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFbEUsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtRQUNoQyxFQUFFLENBQUMsU0FBUyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzVELE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsc0JBQWMsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDMUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDMUIsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLHNCQUFjLENBQUMsQ0FBQztZQUMxRSxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLHNCQUFjLENBQUMsQ0FBQztZQUM3QyxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxNQUFNLENB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