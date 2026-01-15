"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkOptimizer = exports.isTruthy = void 0;
const indexer_client_1 = require("./clients/indexer-client");
const validator_client_1 = require("./clients/validator-client");
const helpers_1 = require("./lib/helpers");
const types_1 = require("./types");
class PingResponse {
    constructor(height) {
        this.height = height;
        this.responseTime = new Date();
    }
}
const isTruthy = (n) => Boolean(n);
exports.isTruthy = isTruthy;
class NetworkOptimizer {
    async validatorClients(endpointUrls, chainId) {
        return (await Promise.all(endpointUrls.map((endpointUrl) => validator_client_1.ValidatorClient.connect(new types_1.ValidatorConfig(endpointUrl, chainId, {
            CHAINTOKEN_DENOM: 'placeholder',
            CHAINTOKEN_DECIMALS: 18,
            USDC_DENOM: 'uusdc',
            USDC_DECIMALS: 6,
        })).catch((_) => undefined)))).filter(exports.isTruthy);
    }
    indexerClients(endpointUrls) {
        return endpointUrls
            .map((endpointUrl) => new indexer_client_1.IndexerClient(
        // socket is not used for finding optimal indexer, but required as a parameter to the config
        new types_1.IndexerConfig(endpointUrl, endpointUrl.replace('https://', 'wss://').replace('http://', 'ws://'))))
            .filter(exports.isTruthy);
    }
    async findOptimalNode(endpointUrls, chainId) {
        if (endpointUrls.length === 0) {
            const errorResponse = {
                error: {
                    message: 'No nodes provided',
                },
            };
            return (0, helpers_1.encodeJson)(errorResponse);
        }
        const clients = await this.validatorClients(endpointUrls, chainId);
        const responses = (await Promise.all(clients
            .map(async (client) => {
            const block = await client.get.latestBlock();
            const response = new PingResponse(block.header.height);
            return {
                endpoint: client.config.restEndpoint,
                height: response.height,
                time: response.responseTime.getTime(),
            };
        })
            .map((promise) => promise.catch((_) => undefined)))).filter(exports.isTruthy);
        if (responses.length === 0) {
            throw new Error('Could not connect to endpoints');
        }
        const maxHeight = Math.max(...responses.map(({ height }) => height));
        return (responses
            // Only consider nodes at `maxHeight` or `maxHeight - 1`
            .filter(({ height }) => height === maxHeight || height === maxHeight - 1)
            // Return the endpoint with the fastest response time
            .sort((a, b) => a.time - b.time)[0].endpoint);
    }
    async findOptimalIndexer(endpointUrls) {
        if (endpointUrls.length === 0) {
            const errorResponse = {
                error: {
                    message: 'No URL provided',
                },
            };
            return (0, helpers_1.encodeJson)(errorResponse);
        }
        const clients = this.indexerClients(endpointUrls);
        const responses = (await Promise.all(clients
            .map(async (client) => {
            const block = await client.utility.getHeight();
            const response = new PingResponse(+block.height);
            return {
                endpoint: client.config.restEndpoint,
                height: response.height,
                time: response.responseTime.getTime(),
            };
        })
            .map((promise) => promise.catch((_) => undefined)))).filter(exports.isTruthy);
        if (responses.length === 0) {
            throw new Error('Could not connect to endpoints');
        }
        const maxHeight = Math.max(...responses.map(({ height }) => height));
        return (responses
            // Only consider nodes at `maxHeight` or `maxHeight - 1`
            .filter(({ height }) => height === maxHeight || height === maxHeight - 1)
            // Return the endpoint with the fastest response time
            .sort((a, b) => a.time - b.time)[0].endpoint);
    }
}
exports.NetworkOptimizer = NetworkOptimizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29ya19vcHRpbWl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbmV0d29ya19vcHRpbWl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkRBQXlEO0FBQ3pELGlFQUE2RDtBQUM3RCwyQ0FBMkM7QUFDM0MsbUNBQXlEO0FBRXpELE1BQU0sWUFBWTtJQUtoQixZQUFZLE1BQWM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7Q0FDRjtBQUVNLE1BQU0sUUFBUSxHQUFHLENBQUksQ0FBb0MsRUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQTNFLFFBQUEsUUFBUSxZQUFtRTtBQUV4RixNQUFhLGdCQUFnQjtJQUNuQixLQUFLLENBQUMsZ0JBQWdCLENBQzVCLFlBQXNCLEVBQ3RCLE9BQWU7UUFFZixPQUFPLENBQ0wsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUNmLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUMvQixrQ0FBZSxDQUFDLE9BQU8sQ0FDckIsSUFBSSx1QkFBZSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUU7WUFDeEMsZ0JBQWdCLEVBQUUsYUFBYTtZQUMvQixtQkFBbUIsRUFBRSxFQUFFO1lBQ3ZCLFVBQVUsRUFBRSxPQUFPO1lBQ25CLGFBQWEsRUFBRSxDQUFDO1NBQ2pCLENBQUMsQ0FDSCxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQzFCLENBQ0YsQ0FDRixDQUFDLE1BQU0sQ0FBQyxnQkFBUSxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVPLGNBQWMsQ0FBQyxZQUFzQjtRQUMzQyxPQUFPLFlBQVk7YUFDaEIsR0FBRyxDQUNGLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FD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