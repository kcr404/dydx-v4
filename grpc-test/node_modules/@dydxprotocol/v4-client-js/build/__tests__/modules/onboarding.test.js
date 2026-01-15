"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onboarding_1 = require("../../src/lib/onboarding");
const proto_signing_1 = require("@cosmjs/proto-signing");
const constants_1 = require("../helpers/constants");
describe('Onboarding', () => {
    describe('exportMnemonicAndPrivateKey', () => {
        it('Successfully creates HDKey', () => {
            expect((0, onboarding_1.exportMnemonicAndPrivateKey)(constants_1.ENTROPY_FROM_SIGNATURE_RESULT)).toEqual({
                mnemonic: constants_1.MNEMONIC_FROM_SIGNATURE_RESULT,
                privateKey: constants_1.PRIVATE_KEY_FROM_SIGNATURE_RESULT,
                publicKey: constants_1.PUBLIC_KEY_FROM_SIGNATURE_RESULT,
            });
        });
        it('Expect mnemonic and private key to generate the same address', async () => {
            const { mnemonic, privateKey } = (0, onboarding_1.exportMnemonicAndPrivateKey)(constants_1.ENTROPY_FROM_SIGNATURE_RESULT);
            const wallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
                prefix: 'dydx',
            });
            const pkWallet = await proto_signing_1.DirectSecp256k1Wallet.fromKey(privateKey, 'dydx');
            const mnemonicAddress = (await wallet.getAccounts())[0].address;
            const pkAddress = (await pkWallet.getAccounts())[0].address;
            expect(mnemonicAddress).toEqual(pkAddress);
        });
    });
    describe('deriveHDKeyFromEthereumSignature', () => {
        it('Throw error if signature not valid', () => {
            expect(() => (0, onboarding_1.deriveHDKeyFromEthereumSignature)('0x04db21dfsa321b')).toThrow();
        });
        it('Successfully creates HDKey', () => {
            expect((0, onboarding_1.deriveHDKeyFromEthereumSignature)(constants_1.SIGNATURE_RESULT)).toEqual({
                mnemonic: constants_1.MNEMONIC_FROM_SIGNATURE_RESULT,
                privateKey: constants_1.PRIVATE_KEY_FROM_SIGNATURE_RESULT,
                publicKey: constants_1.PUBLIC_KEY_FROM_SIGNATURE_RESULT,
            });
        });
        it('Successfully creates HDKey from signature with different v values', () => {
            const suffixes = ['00', '1b', '01', '1c'];
            const testSignatures = suffixes.map((suffix) => constants_1.SIGNATURE_RESULT.slice(0, -2) + suffix);
            testSignatures.forEach((sig) => {
                expect((0, onboarding_1.deriveHDKeyFromEthereumSignature)(sig)).toEqual({
                    mnemonic: constants_1.MNEMONIC_FROM_SIGNATURE_RESULT,
                    privateKey: constants_1.PRIVATE_KEY_FROM_SIGNATURE_RESULT,
                    publicKey: constants_1.PUBLIC_KEY_FROM_SIGNATURE_RESULT,
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25ib2FyZGluZy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vX190ZXN0c19fL21vZHVsZXMvb25ib2FyZGluZy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseURBR2tDO0FBQ2xDLHlEQUkrQjtBQUMvQixvREFNOEI7QUFFOUIsUUFBUSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDMUIsUUFBUSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtRQUMzQyxFQUFFLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO1lBQ3BDLE1BQU0sQ0FBQyxJQUFBLHdDQUEyQixFQUFDLHlDQUE2QixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQ3pFLFFBQVEsRUFBRSwwQ0FBOEI7Z0JBQ3hDLFVBQVUsRUFBRSw2Q0FBaUM7Z0JBQzdDLFNBQVMsRUFBRSw0Q0FBZ0M7YUFDNUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsOERBQThELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDNUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFBLHdDQUEyQixFQUFDLHlDQUE2QixDQUFDLENBQUM7WUFFNUYsTUFBTSxNQUFNLEdBQWtCLE1BQU0sdUNBQXVCLENBQUMsWUFBWSxDQUFDLFFBQVMsRUFBRTtnQkFDbEYsTUFBTSxFQUFFLE1BQU07YUFDZixDQUFDLENBQUM7WUFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLHFDQUFxQixDQUFDLE9BQU8sQ0FBQyxVQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDMUUsTUFBTSxlQUFlLEdBQUcsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUNoRSxNQUFNLFNBQVMsR0FBRyxDQUFDLE1BQU0sUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQzVELE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLEVBQUU7UUFDaEQsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLEdBQUcsRUFBRTtZQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBQSw2Q0FBZ0MsRUFBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDL0UsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO1lBQ3BDLE1BQU0sQ0FBQyxJQUFBLDZDQUFnQyxFQUFDLDRCQUFnQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQ2pFLFFBQVEsRUFBRSwwQ0FBOEI7Z0JBQ3hDLFVBQVUsRUFBRSw2Q0FBaUM7Z0JBQzdDLFNBQVMsRUFBRSw0Q0FBZ0M7YUFDNUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsbUVBQW1FLEVBQUUsR0FBRyxFQUFFO1lBQzNFLE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFMUMsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsNEJBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQ3hGLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDN0IsTUFBTSxDQUFDLElBQUEsNkNBQWdDLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7b0JBQ3BELFFBQVEsRUFBRSwwQ0FBOEI7b0JBQ3hDLFVBQVUsRUFBRSw2Q0FBaUM7b0JBQzdDLFNBQVMsRUFBRSw0Q0FBZ0M7aUJBQzVDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIn0=