#!/bin/bash
# Debug CLOB inclusion issues

echo "Checking Mempool Status..."
curl -s "http://localhost:26657/unconfirmed_txs?limit=50" | jq '{n_txs:.result.n_txs, total:.result.total}'

echo "Checking Logs for filtering..."
docker logs --tail=100 protocol-dydxprotocold0-1 2>&1 | grep -iE "RemoveDisallowMsgs|PrepareProposal|GetOperations" || echo "No relevant logs found"

echo "Checking Block Rate Limit Config..."
./build/dydxprotocold query clob block-rate-limit-config --node tcp://localhost:26657

echo "Checking if we can place a MATCHABLE order pair..."
# Place a buy and sell that matches
H=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
GTB=$((H + 20))

ALICE=$(./build/dydxprotocold keys show alice --home ./tmp_keyring --keyring-backend test -a)
BOB=$(./build/dydxprotocold keys show bob --home ./tmp_keyring --keyring-backend test -a)

echo "Placing matched orders at height $H with GTB $GTB"
# Alice buys 10 at 100
./build/dydxprotocold tx clob place-order "$ALICE" 0 301 35 1 1000000 100000 "$GTB" --home ./tmp_keyring --keyring-backend test --chain-id localdydxprotocol --fees 5000000000000000adv4tnt --gas 200000 -y --node http://localhost:26657 --broadcast-mode sync --from "$ALICE"

# Bob sells 10 at 100
./build/dydxprotocold tx clob place-order "$BOB" 0 302 35 2 1000000 100000 "$GTB" --home ./tmp_keyring --keyring-backend test --chain-id localdydxprotocol --fees 5000000000000000adv4tnt --gas 200000 -y --node http://localhost:26657 --broadcast-mode sync --from "$BOB"

sleep 5
echo "Checking mempool again..."
curl -s "http://localhost:26657/unconfirmed_txs?limit=50" | jq '{n_txs:.result.n_txs, total:.result.total}'
