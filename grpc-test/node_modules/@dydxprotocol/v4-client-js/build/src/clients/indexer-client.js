"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexerClient = void 0;
const constants_1 = require("./constants");
const account_1 = __importDefault(require("./modules/account"));
const markets_1 = __importDefault(require("./modules/markets"));
const utility_1 = __importDefault(require("./modules/utility"));
const vault_1 = __importDefault(require("./modules/vault"));
/**
 * @description Client for Indexer
 */
class IndexerClient {
    constructor(config, apiTimeout) {
        this.config = config;
        this.apiTimeout = apiTimeout !== null && apiTimeout !== void 0 ? apiTimeout : constants_1.DEFAULT_API_TIMEOUT;
        this._markets = new markets_1.default(config.restEndpoint);
        this._account = new account_1.default(config.restEndpoint);
        this._utility = new utility_1.default(config.restEndpoint);
        this._vault = new vault_1.default(config.restEndpoint);
    }
    /**
     * @description Get the public module, used for interacting with public endpoints.
     *
     * @returns The public module
     */
    get markets() {
        return this._markets;
    }
    /**
     * @description Get the private module, used for interacting with private endpoints.
     *
     * @returns The private module
     */
    get account() {
        return this._account;
    }
    /**
     * @description Get the utility module, used for interacting with non-market public endpoints.
     */
    get utility() {
        return this._utility;
    }
    /**
     * @description Get the vault module, used for interacting with vault endpoints.
     *
     * @returns The vault module
     */
    get vault() {
        return this._vault;
    }
}
exports.IndexerClient = IndexerClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhlci1jbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpZW50cy9pbmRleGVyLWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwyQ0FBaUU7QUFDakUsZ0VBQThDO0FBQzlDLGdFQUE4QztBQUM5QyxnRUFBOEM7QUFDOUMsNERBQTBDO0FBRTFDOztHQUVHO0FBQ0gsTUFBYSxhQUFhO0lBUXhCLFlBQVksTUFBcUIsRUFBRSxVQUFtQjtRQUNwRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsYUFBVixVQUFVLGNBQVYsVUFBVSxHQUFJLCtCQUFtQixDQUFDO1FBRXBELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBYSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksaUJBQWEsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFhLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxlQUFXLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7T0FFRztJQUNILElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNyQixDQUFDO0NBQ0Y7QUFuREQsc0NBbURDIn0=