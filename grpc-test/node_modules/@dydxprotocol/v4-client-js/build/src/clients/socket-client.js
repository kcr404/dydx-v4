"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketClient = exports.CandlesResolution = exports.IncomingMessageTypes = void 0;
const ws_1 = __importDefault(require("ws"));
var OutgoingMessageTypes;
(function (OutgoingMessageTypes) {
    OutgoingMessageTypes["SUBSCRIBE"] = "subscribe";
    OutgoingMessageTypes["UNSUBSCRIBE"] = "unsubscribe";
})(OutgoingMessageTypes || (OutgoingMessageTypes = {}));
var SocketChannels;
(function (SocketChannels) {
    SocketChannels["SUBACCOUNTS"] = "v4_subaccounts";
    SocketChannels["ORDERBOOK"] = "v4_orderbook";
    SocketChannels["TRADES"] = "v4_trades";
    SocketChannels["MARKETS"] = "v4_markets";
    SocketChannels["CANDLES"] = "v4_candles";
})(SocketChannels || (SocketChannels = {}));
var IncomingMessageTypes;
(function (IncomingMessageTypes) {
    IncomingMessageTypes["CONNECTED"] = "connected";
    IncomingMessageTypes["SUBSCRIBED"] = "subscribed";
    IncomingMessageTypes["ERROR"] = "error";
    IncomingMessageTypes["CHANNEL_DATA"] = "channel_data";
    IncomingMessageTypes["CHANNEL_BATCH_DATA"] = "channel_batch_data";
    IncomingMessageTypes["PONG"] = "pong";
})(IncomingMessageTypes = exports.IncomingMessageTypes || (exports.IncomingMessageTypes = {}));
var CandlesResolution;
(function (CandlesResolution) {
    CandlesResolution["ONE_MINUTE"] = "1MIN";
    CandlesResolution["FIVE_MINUTES"] = "5MINS";
    CandlesResolution["FIFTEEN_MINUTES"] = "15MINS";
    CandlesResolution["THIRTY_MINUTES"] = "30MINS";
    CandlesResolution["ONE_HOUR"] = "1HOUR";
    CandlesResolution["FOUR_HOURS"] = "4HOURS";
    CandlesResolution["ONE_DAY"] = "1DAY";
})(CandlesResolution = exports.CandlesResolution || (exports.CandlesResolution = {}));
class SocketClient {
    constructor(config, onOpenCallback, onCloseCallback, onMessageCallback, onErrorCallback) {
        this.lastMessageTime = Date.now();
        this.url = config.websocketEndpoint;
        this.onOpenCallback = onOpenCallback;
        this.onCloseCallback = onCloseCallback;
        this.onMessageCallback = onMessageCallback;
        this.onErrorCallback = onErrorCallback;
    }
    connect() {
        this.ws = new ws_1.default(this.url);
        this.ws.addEventListener('open', this.handleOpen.bind(this));
        this.ws.addEventListener('close', this.handleClose.bind(this));
        this.ws.addEventListener('message', this.handleMessage.bind(this));
        this.ws.addEventListener('error', this.handleError.bind(this));
    }
    /**
     * @description Close the websocket connection.
     *
     */
    close() {
        var _a;
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
        this.ws = undefined;
    }
    /**
     * @description Check is the websocket connection connecting
     */
    isConnecting() {
        var _a;
        return ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === ws_1.default.CONNECTING;
    }
    /**
     * @description Check is the websocket connection open
     */
    isOpen() {
        var _a;
        return ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === ws_1.default.OPEN;
    }
    /**
     * @description Check is the websocket connection closing
     */
    isClosing() {
        var _a;
        return ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === ws_1.default.CLOSING;
    }
    /**
     * @description Check is the websocket connection closed
     */
    isClosed() {
        var _a;
        return ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === ws_1.default.CLOSED;
    }
    /**
     * @description Send data to the websocket connection.
     *
     */
    send(data) {
        var _a;
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(data);
    }
    handleOpen() {
        if (this.onOpenCallback) {
            this.onOpenCallback();
        }
    }
    handleClose() {
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    }
    handleMessage(event) {
        if (event.data === 'PING') {
            this.send('PONG');
        }
        else {
            this.lastMessageTime = Date.now();
            if (this.onMessageCallback) {
                this.onMessageCallback(event);
            }
        }
    }
    handleError(event) {
        if (this.onErrorCallback) {
            this.onErrorCallback(event);
        }
    }
    /**
     * @description Set callback when the socket is opened.
     *
     */
    set onOpen(callback) {
        this.onOpenCallback = callback;
    }
    /**
     * @description Set callback when the socket is closed.
     *
     */
    set onClose(callback) {
        this.onCloseCallback = callback;
    }
    /**
     * @description Set callback when the socket receives a message.
     *
     */
    set onMessage(callback) {
        this.onMessageCallback = callback;
    }
    /**
     * @description Set callback when the socket encounters an error.
     */
    set onError(callback) {
        this.onErrorCallback = callback;
    }
    /**
     * @description Send a subscribe message to the websocket connection.
     *
     */
    subscribe(channel, params) {
        const message = {
            type: OutgoingMessageTypes.SUBSCRIBE,
            channel,
            ...params,
        };
        this.send(JSON.stringify(message));
    }
    /**
     * @description Send an unsubscribe message to the websocket connection.
     *
     */
    unsubscribe(channel, params) {
        const message = {
            type: OutgoingMessageTypes.UNSUBSCRIBE,
            channel,
            ...params,
        };
        this.send(JSON.stringify(message));
    }
    /**
     * @description Subscribe to markets channel.
     *
     */
    subscribeToMarkets() {
        const channel = SocketChannels.MARKETS;
        const params = {
            batched: true,
        };
        this.subscribe(channel, params);
    }
    /**
     * @description Unsubscribe from markets channel
     *
     */
    unsubscribeFromMarkets() {
        const channel = SocketChannels.MARKETS;
        this.unsubscribe(channel);
    }
    /**
     * @description Subscribe to trade channel
     * for a specific market.
     *
     */
    subscribeToTrades(market) {
        const channel = SocketChannels.TRADES;
        const params = {
            id: market,
            batched: true,
        };
        this.subscribe(channel, params);
    }
    /**
     * @description Unscribed from trade channel
     * for a specific market.
     *
     */
    unsubscribeFromTrades(market) {
        const channel = SocketChannels.TRADES;
        const params = {
            id: market,
        };
        this.unsubscribe(channel, params);
    }
    /**
     * @description Subscribe to orderbook channel
     * for a specific market.
     *
     */
    subscribeToOrderbook(market) {
        const channel = SocketChannels.ORDERBOOK;
        const params = {
            id: market,
            batched: true,
        };
        this.subscribe(channel, params);
    }
    /**
     * @description Unsubscribe from orderbook channel
     * for a specific market.
     */
    unsubscribeFromOrderbook(market) {
        const channel = SocketChannels.ORDERBOOK;
        const params = {
            id: market,
        };
        this.unsubscribe(channel, params);
    }
    /**
     * @description Subscribe to candles channel
     * for a specific market and resolution.
     *
     */
    subscribeToCandles(market, resolution) {
        const channel = SocketChannels.CANDLES;
        const params = {
            id: `${market}/${resolution}`,
            batched: true,
        };
        this.subscribe(channel, params);
    }
    /**
     * @description Unsubscribe from candles channel
     * for a specific market and resolution.
     */
    unsubscribeFromCandles(market, resolution) {
        const channel = SocketChannels.CANDLES;
        const params = {
            id: `${market}/${resolution}`,
        };
        this.unsubscribe(channel, params);
    }
    /**
     * @description Subscribe to subaccount channel
     * for a specific address and subaccount number.
     */
    subscribeToSubaccount(address, subaccountNumber) {
        const channel = SocketChannels.SUBACCOUNTS;
        const subaccountId = `${address}/${subaccountNumber}`;
        const params = {
            id: subaccountId,
        };
        this.subscribe(channel, params);
    }
    /**
     * @description Unsubscribe from subaccount channel
     * for a specific address and subaccount number.
     *
     */
    unsubscribeFromSubaccount(address, subaccountNumber) {
        const channel = SocketChannels.SUBACCOUNTS;
        const subaccountId = `${address}/${subaccountNumber}`;
        const params = {
            id: subaccountId,
        };
        this.unsubscribe(channel, params);
    }
}
exports.SocketClient = SocketClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnRzL3NvY2tldC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsNENBQXlEO0FBSXpELElBQUssb0JBR0o7QUFIRCxXQUFLLG9CQUFvQjtJQUN2QiwrQ0FBdUIsQ0FBQTtJQUN2QixtREFBMkIsQ0FBQTtBQUM3QixDQUFDLEVBSEksb0JBQW9CLEtBQXBCLG9CQUFvQixRQUd4QjtBQUVELElBQUssY0FNSjtBQU5ELFdBQUssY0FBYztJQUNqQixnREFBOEIsQ0FBQTtJQUM5Qiw0Q0FBMEIsQ0FBQTtJQUMxQixzQ0FBb0IsQ0FBQTtJQUNwQix3Q0FBc0IsQ0FBQTtJQUN0Qix3Q0FBc0IsQ0FBQTtBQUN4QixDQUFDLEVBTkksY0FBYyxLQUFkLGNBQWMsUUFNbEI7QUFFRCxJQUFZLG9CQU9YO0FBUEQsV0FBWSxvQkFBb0I7SUFDOUIsK0NBQXVCLENBQUE7SUFDdkIsaURBQXlCLENBQUE7SUFDekIsdUNBQWUsQ0FBQTtJQUNmLHFEQUE2QixDQUFBO0lBQzdCLGlFQUF5QyxDQUFBO0lBQ3pDLHFDQUFhLENBQUE7QUFDZixDQUFDLEVBUFcsb0JBQW9CLEdBQXBCLDRCQUFvQixLQUFwQiw0QkFBb0IsUUFPL0I7QUFFRCxJQUFZLGlCQVFYO0FBUkQsV0FBWSxpQkFBaUI7SUFDM0Isd0NBQW1CLENBQUE7SUFDbkIsMkNBQXNCLENBQUE7SUFDdEIsK0NBQTBCLENBQUE7SUFDMUIsOENBQXlCLENBQUE7SUFDekIsdUNBQWtCLENBQUE7SUFDbEIsMENBQXFCLENBQUE7SUFDckIscUNBQWdCLENBQUE7QUFDbEIsQ0FBQyxFQVJXLGlCQUFpQixHQUFqQix5QkFBaUIsS0FBakIseUJBQWlCLFFBUTVCO0FBRUQsTUFBYSxZQUFZO0lBU3ZCLFlBQ0UsTUFBcUIsRUFDckIsY0FBMEIsRUFDMUIsZUFBMkIsRUFDM0IsaUJBQWdELEVBQ2hELGVB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