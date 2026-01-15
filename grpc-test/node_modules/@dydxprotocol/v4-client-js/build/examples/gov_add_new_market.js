"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const perpetual_1 = require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/perpetuals/perpetual");
const long_1 = __importDefault(require("long"));
const src_1 = require("../src");
const composite_client_1 = require("../src/clients/composite-client");
const constants_1 = require("../src/clients/constants");
const utils_1 = require("../src/lib/utils");
const constants_2 = require("./constants");
const INITIAL_DEPOSIT_AMOUNT = 10000000000000; // 10,000 whole native tokens.
const MOCK_DATA = {
    // common
    id: 34,
    ticker: 'BONK-USD',
    // x/prices
    priceExponent: -14,
    minExchanges: 3,
    minPriceChange: 4000,
    exchangeConfigJson: JSON.stringify({
        exchanges: [
            { exchangeName: 'Binance', ticker: 'BONKUSDT', adjustByMarket: 'USDT-USD' },
            { exchangeName: 'Bybit', ticker: 'BONKUSDT', adjustByMarket: 'USDT-USD' },
            { exchangeName: 'CoinbasePro', ticker: 'BONK-USD' },
            { exchangeName: 'Kucoin', ticker: 'BONK-USDT', adjustByMarket: 'USDT-USD' },
            { exchangeName: 'Okx', ticker: 'BONK-USDT', adjustByMarket: 'USDT-USD' },
            { exchangeName: 'Mexc', ticker: 'BONK_USDT', adjustByMarket: 'USDT-USD' },
        ],
    }),
    // x/perpetuals
    liquidityTier: 2,
    atomicResolution: -1,
    marketType: perpetual_1.PerpetualMarketType.PERPETUAL_MARKET_TYPE_CROSS,
    // x/clob
    quantumConversionExponent: -9,
    stepBaseQuantums: long_1.default.fromNumber(1000000),
    subticksPerTick: 1000000,
    // x/delaymsg
    delayBlocks: 5,
};
// To run this test:
//  npm run build && node build/examples/gov_add_new_market.js
//
// Confirmed that the proposals have the exact same content.
//  1. submit using an example json file
//   dydxprotocold tx gov submit-proposal gov_add_new_market.json \
//      --from alice --keyring-backend test --gas auto --fees 9553225000000000adv4tnt
//   dydxprotocold query gov proposals
//  2. submit using the file's mock data
//   npm run build && node build/examples/gov_add_new_market.js
//   dydxprotocold query gov proposals
//  3. then compare the two proposals and ensure they match
async function test() {
    console.log('**Start**');
    const wallet = await src_1.LocalWallet.fromMnemonic(constants_2.DYDX_LOCAL_MNEMONIC, constants_1.BECH32_PREFIX);
    console.log(wallet);
    const network = constants_1.Network.local();
    const client = await composite_client_1.CompositeClient.connect(network);
    console.log('**Client**');
    console.log(client);
    const tx = await client.submitGovAddNewMarketProposal(wallet, MOCK_DATA, (0, utils_1.getGovAddNewMarketTitle)(MOCK_DATA.ticker), (0, utils_1.getGovAddNewMarketSummary)(MOCK_DATA.ticker, MOCK_DATA.delayBlocks), BigInt(INITIAL_DEPOSIT_AMOUNT).toString());
    console.log('**Tx**');
    console.log(tx);
    await (0, utils_1.sleep)(5000);
    const depositProposals = await client.validatorClient.get.getAllGovProposals(src_1.ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD);
    console.log('**Deposit Proposals**');
    console.log(depositProposals);
    const votingProposals = await client.validatorClient.get.getAllGovProposals(src_1.ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD);
    console.log('**Voting Proposals**');
    console.log(votingProposals);
}
test().catch((error) => {
    console.error(error);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ292X2FkZF9uZXdfbWFya2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vZXhhbXBsZXMvZ292X2FkZF9uZXdfbWFya2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0dBQTJHO0FBQzNHLGdEQUF3QjtBQUV4QixnQ0FBNEU7QUFDNUUsc0VBQWtFO0FBQ2xFLHdEQUFrRTtBQUNsRSw0Q0FBNkY7QUFDN0YsMkNBQWtEO0FBRWxELE1BQU0sc0JBQXNCLEdBQUcsY0FBa0IsQ0FBQyxDQUFDLDhCQUE4QjtBQUNqRixNQUFNLFNBQVMsR0FBMEI7SUFDdkMsU0FBUztJQUNULEVBQUUsRUFBRSxFQUFFO0lBQ04sTUFBTSxFQUFFLFVBQVU7SUFFbEIsV0FBVztJQUNYLGFBQWEsRUFBRSxDQUFDLEVBQUU7SUFDbEIsWUFBWSxFQUFFLENBQUM7SUFDZixjQUFjLEVBQUUsSUFBSztJQUNyQixrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2pDLFNBQVMsRUFBRTtZQUNULEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUU7WUFDM0UsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRTtZQUN6RSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRTtZQUNuRCxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFO1lBQzNFLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUU7WUFDeEUsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRTtTQUMxRTtLQUNGLENBQUM7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