"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenesisState = exports.AuthenticatorData = void 0;
const models_1 = require("./models");
const accountplus_1 = require("./accountplus");
const params_1 = require("./params");
const _m0 = __importStar(require("protobufjs/minimal"));
const helpers_1 = require("../../helpers");
function createBaseAuthenticatorData() {
    return {
        address: "",
        authenticators: []
    };
}
exports.AuthenticatorData = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.address !== "") {
            writer.uint32(10).string(message.address);
        }
        for (const v of message.authenticators) {
            models_1.AccountAuthenticator.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAuthenticatorData();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.authenticators.push(models_1.AccountAuthenticator.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseAuthenticatorData();
        message.address = (_a = object.address) !== null && _a !== void 0 ? _a : "";
        message.authenticators = ((_b = object.authenticators) === null || _b === void 0 ? void 0 : _b.map(e => models_1.AccountAuthenticator.fromPartial(e))) || [];
        return message;
    }
};
function createBaseGenesisState() {
    return {
        accounts: [],
        params: undefined,
        nextAuthenticatorId: helpers_1.Long.UZERO,
        authenticatorData: []
    };
}
exports.GenesisState = {
    encode(message, writer = _m0.Writer.create()) {
        for (const v of message.accounts) {
            accountplus_1.AccountState.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.params !== undefined) {
            params_1.Params.encode(message.params, writer.uint32(18).fork()).ldelim();
        }
        if (!message.nextAuthenticatorId.isZero()) {
            writer.uint32(24).uint64(message.nextAuthenticatorId);
        }
        for (const v of message.authenticatorData) {
            exports.AuthenticatorData.encode(v, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGenesisState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.accounts.push(accountplus_1.AccountState.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.params = params_1.Params.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.nextAuthenticatorId = reader.uint64();
                    break;
                case 4:
                    message.authenticatorData.push(exports.AuthenticatorData.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseGenesisState();
        message.accounts = ((_a = object.accounts) === null || _a === void 0 ? void 0 : _a.map(e => accountplus_1.AccountState.fromPartial(e))) || [];
        message.params = object.params !== undefined && object.params !== null ? params_1.Params.fromPartial(object.params) : undefined;
        message.nextAuthenticatorId = object.nextAuthenticatorId !== undefined && object.nextAuthenticatorId !== null ? helpers_1.Long.fromValue(object.nextAuthenticatorId) : helpers_1.Long.UZERO;
        message.authenticatorData = ((_b = object.authenticatorData) === null || _b === void 0 ? void 0 : _b.map(e => exports.AuthenticatorData.fromPartial(e))) || [];
        return message;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXNpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9AZHlkeHByb3RvY29sL3Y0LXByb3RvL3NyYy9jb2RlZ2VuL2R5ZHhwcm90b2NvbC9hY2NvdW50cGx1cy9nZW5lc2lzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBQTZFO0FBQzdFLCtDQUFrRTtBQUNsRSxxQ0FBaUQ7QUFDakQsd0RBQTBDO0FBQzFDLDJDQUFrRDtBQXFEbEQsU0FBUywyQkFBMkI7SUFDbEMsT0FBTztRQUNMLE9BQU8sRUFBRSxFQUFFO1FBQ1gsY0FBYyxFQUFFLEVBQUU7S0FDbkIsQ0FBQztBQUNKLENBQUM7QUFFWSxRQUFBLGlCQUFpQixHQUFHO0lBQy9CLE1BQU0sQ0FBQyxPQUEwQixFQUFFLFNBQXFCLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ3pFLElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxFQUFFLEVBQUU7WUFDMUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzNDO1FBRUQsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO1lBQ3RDLDZCQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFFLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3BFO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUE4QixFQUFFLE1BQWU7UUFDcEQsTUFBTSxNQUFNLEdBQUcsS0FBSyxZQUFZLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMs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