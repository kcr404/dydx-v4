"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveHDKeyFromMnemonic = exports.deriveHDKeyFromEthereumSignature = exports.exportMnemonicAndPrivateKey = void 0;
const bip32_1 = require("@scure/bip32");
const bip39_1 = require("@scure/bip39");
const english_1 = require("@scure/bip39/wordlists/english");
const keccak_1 = require("ethereum-cryptography/keccak");
const helpers_1 = require("./helpers");
/**
 * @description Get Mnemonic and priv/pub keys from privateKeyBytes and BIP44 HD path
 *
 * @url https://github.com/confio/cosmos-hd-key-derivation-spec#bip44
 *
 * @param entropy used to generate mnemonic
 *
 * @param path BIP44 HD Path. Default is The Cosmos Hub path
 *
 * @throws Error if the hdkey does not exist
 *
 * @returns Mnemonic and priv/pub keys
 */
const exportMnemonicAndPrivateKey = (entropy, path = "m/44'/118'/0'/0/0") => {
    const mnemonic = (0, bip39_1.entropyToMnemonic)(entropy, english_1.wordlist);
    const { privateKey, publicKey } = (0, exports.deriveHDKeyFromMnemonic)(mnemonic, path);
    return {
        mnemonic,
        privateKey,
        publicKey,
    };
};
exports.exportMnemonicAndPrivateKey = exportMnemonicAndPrivateKey;
/**
 * @description Get private information for onboarding using an Ethereum Signature.
 *
 * @returns Mnemonic and Public/Private HD keys
 */
const deriveHDKeyFromEthereumSignature = (signature) => {
    const buffer = Buffer.from((0, helpers_1.stripHexPrefix)(signature), 'hex');
    if (buffer.length !== 65) {
        throw new Error('Signature must be 65 bytes');
    }
    // Remove the 'v' value by taking only the first 64 bytes of the signature
    const rsValues = buffer.subarray(0, 64);
    // Hash the 'r' and 's' values down to 32 bytes (256 bits) using Keccak-256
    const entropy = (0, keccak_1.keccak256)(rsValues);
    return (0, exports.exportMnemonicAndPrivateKey)(entropy);
};
exports.deriveHDKeyFromEthereumSignature = deriveHDKeyFromEthereumSignature;
/**
 * @description Derive priv/pub keys from mnemonic and BIP44 HD path
 *
 * @url https://github.com/confio/cosmos-hd-key-derivation-spec#bip44
 *
 * @param mnemonic used to generate seed
 *
 * @param path BIP44 HD Path. Default is The Cosmos Hub path
 *
 * @throws Error if the hdkey does not exist
 *
 * @returns Priv/pub keys
 */
const deriveHDKeyFromMnemonic = (mnemonic, path = "m/44'/118'/0'/0/0") => {
    const seed = (0, bip39_1.mnemonicToSeedSync)(mnemonic);
    const hdkey = bip32_1.HDKey.fromMasterSeed(seed);
    const derivedHdkey = hdkey.derive(path);
    if (!hdkey.privateKey) {
        throw new Error('null hd key');
    }
    return {
        privateKey: derivedHdkey.privateKey,
        publicKey: derivedHdkey.publicKey,
    };
};
exports.deriveHDKeyFromMnemonic = deriveHDKeyFromMnemonic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25ib2FyZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvb25ib2FyZGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3Q0FBcUM7QUFDckMsd0NBQXFFO0FBQ3JFLDREQUEwRDtBQUMxRCx5REFBeUQ7QUFFekQsdUNBQTJDO0FBRTNDOzs7Ozs7Ozs7Ozs7R0FZRztBQUNJLE1BQU0sMkJBQTJCLEdBQUcsQ0FDekMsT0FBbUIsRUFDbkIsT0FBZSxtQkFBbUIsRUFLbEMsRUFBRTtJQUNGLE1BQU0sUUFBUSxHQUFHLElBQUEseUJBQWlCLEVBQUMsT0FBTyxFQUFFLGtCQUFRLENBQUMsQ0FBQztJQUN0RCxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUEsK0JBQXVCLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFFLE9BQU87UUFDTCxRQUFRO1FBQ1IsVUFBVTtRQUNWLFNBQVM7S0FDVixDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBZlcsUUFBQSwyQkFBMkIsK0JBZXRDO0FBRUY7Ozs7R0FJRztBQUNJLE1BQU0sZ0NBQWdDLEdBQUcsQ0FDOUMsU0FBaUIsRUFLakIsRUFBRTtJQUNGLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBQSx3QkFBYyxFQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTdELElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxFQUFFLEVBQUU7UUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQy9DO0lBRUQsMEVBQTBFO0lBQzFFLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLDJFQUEyRTtJQUMzRSxNQUFNLE9BQU8sR0FBRyxJQUFBLGtCQUFTLEVBQUMsUUFBUSxDQUFDLENBQUM7SUFDcEMsT0FBTyxJQUFBLG1DQUEyQixFQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLENBQUMsQ0FBQztBQWxCVyxRQUFBLGdDQUFnQyxvQ0FrQjNDO0FBRUY7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0ksTUFBTSx1QkFBdUIsR0FBRyxDQUNyQyxRQUFnQixFQUNoQixPQUFlLG1CQUFtQixFQUlsQyxFQUFFO0lBQ0YsTUFBTSxJQUFJLEdBQUcsSUFBQSwwQkFBa0IsRUFBQyxRQUFRLENBQUMsQ0FBQztJQUUxQyxNQUFNLEtBQUssR0FBRyxhQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFeEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUU7UUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNoQztJQUVELE9BQU87UUFDTCxVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVU7UUFDbkMsU0FBUyxFQUFFLFlBQVksQ0FBQyxTQUFTO0tBQ2xDLENBQUM7QUFDSixDQUFDLENBQUM7QUFwQlcsUUFBQSx1QkFBdUIsMkJBb0JsQyJ9