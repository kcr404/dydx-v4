
import {
    BECH32_PREFIX,
    ValidatorClient,
    LocalWallet,
    Network,
    SubaccountInfo,
    IPlaceOrder,
    OrderFlags,
    Order_Side,
    Order_TimeInForce
} from '@dydxprotocol/v4-client-js';
// IndexerClient not required for this short-term bot; use Tendermint RPC for height
import Long from 'long';

// Mnemonic for Alice and Bob (from localnet defaults)
const ALICE_MNEMONIC = 'merge panther lobster crazy road hollow amused security before critic about cliff exhibit cause coyote talent happy where lion river tobacco option coconut small';
const BOB_MNEMONIC = 'color habit donor nurse dinosaur stable wonder process post perfect raven gold census inside worth inquiry mammal panic olive toss shadow strong name drum';

async function main() {
    try {
        // 1. Connect and fetch Block Height
        const network = Network.local();

        // Retry loop for Validator Client
        let validatorClient;
        for (let i = 0; i < 150; i++) {
            try {
                validatorClient = await ValidatorClient.connect(network.validatorConfig);
                break;
            } catch (e) {
                console.log(`Waiting for Validator to be ready... (${i + 1}/30)`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        if (!validatorClient) throw new Error("Failed to connect to Validator");

        // Fetch current chain height directly from Tendermint RPC (no indexer required)
        let currentHeight: number | undefined;
        for (let i = 0; i < 150; i++) {
            try {
                const resp = await fetch('http://localhost:26657/status');
                if (!resp.ok) throw new Error('rpc not ready');
                const json: any = await resp.json();
                currentHeight = Number(json.result.sync_info.latest_block_height);
                break;
            } catch (e) {
                console.log(`Waiting for Chain Height... (${i + 1}/30)`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        if (!currentHeight) throw new Error("Failed to fetch Block Height");

        console.log(`Current Block Height: ${currentHeight}`);

        // 2. Compute GTB (Current + 5 blocks is safe for a local bot)
        const GK_BLOCK_WINDOW = 8;
        const goodTilBlock = currentHeight + GK_BLOCK_WINDOW;
        console.log(`Setting GoodTilBlock = ${goodTilBlock}`);

        // 3. Initialize Wallets
        const aliceWallet = await LocalWallet.fromMnemonic(ALICE_MNEMONIC, BECH32_PREFIX);
        const bobWallet = await LocalWallet.fromMnemonic(BOB_MNEMONIC, BECH32_PREFIX);
        const aliceSubaccount = new SubaccountInfo(aliceWallet, 0);
        const bobSubaccount = new SubaccountInfo(bobWallet, 0);

        // 4. Prepare Orders
        // Replicating test_short_term_matching.sh values:
        // Alice Buy 10 @ 100 (Quantums: 10000000, Subticks: 100000)
        // Bob Sell 10 @ 99   (Quantums: 10000000, Subticks: 99000)

        const clientIdAlice = Math.floor(Math.random() * 1000000);
        const clientIdBob = clientIdAlice + 1;

        const orderAlice: IPlaceOrder = {
            clientId: clientIdAlice,
            orderFlags: OrderFlags.SHORT_TERM,
            clobPairId: 0, // BTC-USD
            side: Order_Side.SIDE_BUY,
            quantums: Long.fromNumber(10000000),
            subticks: Long.fromNumber(100000),
            timeInForce: Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
            reduceOnly: false,
            clientMetadata: 0,
            goodTilBlock: goodTilBlock,
            goodTilBlockTime: 0
        };

        const orderBob: IPlaceOrder = {
            clientId: clientIdBob,
            orderFlags: OrderFlags.SHORT_TERM,
            clobPairId: 0,
            side: Order_Side.SIDE_SELL,
            quantums: Long.fromNumber(10000000),
            subticks: Long.fromNumber(100000),
            timeInForce: Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
            reduceOnly: false,
            clientMetadata: 0,
            goodTilBlock: goodTilBlock,
            goodTilBlockTime: 0
        };

        console.log("Placing Orders Concurrently...");

        // 5. Broadcast and capture results (tx hashes)
        const p1 = validatorClient.post.placeOrderObject(aliceSubaccount, orderAlice);
        const p2 = validatorClient.post.placeOrderObject(bobSubaccount, orderBob);

        const [res1, res2] = await Promise.all([
            p1.catch((e: any) => { console.error('Alice broadcast error', e); return null; }),
            p2.catch((e: any) => { console.error('Bob broadcast error', e); return null; }),
        ]);

        console.log('--- Full Broadcast Responses ---');
        try { console.log('Raw response Alice:', JSON.stringify(res1, null, 2)); } catch (e) { console.log('Raw response Alice (non-serializable):', res1); }
        try { console.log('Raw response Bob  :', JSON.stringify(res2, null, 2)); } catch (e) { console.log('Raw response Bob (non-serializable):', res2); }

        const toHex = (r: any) => {
            if (!r) return null;
            const h = (r.hash ?? r.txhash ?? r.hash_bytes ?? null);
            if (!h) return null;
            if (typeof h === 'string') return h.toUpperCase();
            if (h instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(h))) {
                return Buffer.from(h).toString('hex').toUpperCase();
            }
            return String(h).toUpperCase();
        };

        const aliceHash = toHex(res1);
        const bobHash = toHex(res2);

        console.log('Orders Broadcasted successfully!');
        console.log('Alice tx hash:', aliceHash);
        console.log('Bob   tx hash:', bobHash);

        // 6. Poll Tendermint RPC for inclusion logs (if txhashs available)
        const pollTx = async (hex: string | null, who: string) => {
            if (!hex) {
                console.log(`${who} has no tx hash to poll.`);
                return;
            }
            for (let i = 0; i < 30; i++) {
                try {
                    const resp = await fetch(`http://localhost:26657/tx?hash=0x${hex}`);
                    if (resp.ok) {
                        const j: any = await resp.json();
                        if (j.result) {
                            const code = j.result.tx_result.code;
                            const log = j.result.tx_result.log || j.result.tx_result.log || '';
                            console.log(`${who} INCLUDED at height ${j.result.height}, code=${code}`);
                            console.log(`${who} log: ${log}`);
                            return;
                        }
                    }
                } catch (e) {
                    // ignore and retry
                }
                await new Promise(r => setTimeout(r, 1000));
            }
            console.log(`${who} NOT FOUND after polling`);
        };

        await Promise.all([pollTx(aliceHash, 'Alice'), pollTx(bobHash, 'Bob')]);

    } catch (e) {
        console.error("Error executing bot:", e);
        process.exit(1);
    }
}

main();
