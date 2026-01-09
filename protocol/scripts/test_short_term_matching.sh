#!/bin/bash
# Verify Short-Term Order Mechanics
# 1. Place Non-Matching -> Expect Filtered (NOT FOUND)
# 2. Place Matching -> Expect Filtered (NOT FOUND via Hash) but Balances Change (Trade Executed)

set -e

# Ensure we are in project root if run from scripts dir
if [ -d "../build" ]; then
  cd ..
fi

CHAIN_ID="localdydxprotocol"
FEE="5000000000000000adv4tnt"
NODE="http://localhost:26657"
BINARY="./build/dydxprotocold"

ALICE=$($BINARY keys show alice --home ./tmp_keyring --keyring-backend test -a)
BOB=$($BINARY keys show bob --home ./tmp_keyring --keyring-backend test -a)

echo "Alice: $ALICE"
echo "Bob:   $BOB"

# Helper to get subaccount open positions count
get_positions_count() {
    local addr=$1
    $BINARY query subaccounts show-subaccount "$addr" 0 --output json --node "$NODE" | jq -r '.subaccount.perpetual_positions | length'
}

# 1. Fund Bob just in case
$BINARY tx sending deposit-to-subaccount "$BOB" "$BOB" 0 100000000 \
  --from "$BOB" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 -y --broadcast-mode sync --node "$NODE" >/dev/null 2>&1 || true

# Fund Alice as well!
$BINARY tx sending deposit-to-subaccount "$ALICE" "$ALICE" 0 100000000 \
  --from "$ALICE" --home ./tmp_keyring --keyring-backend test \
  --chain-id "$CHAIN_ID" \
  --fees "$FEE" --gas 200000 -y --broadcast-mode sync --node "$NODE" >/dev/null 2>&1 || true
sleep 4

ALICE_START=$(get_positions_count "$ALICE")
BOB_START=$(get_positions_count "$BOB")
echo -e "\nInitial Positions Count:"
echo "Alice: $ALICE_START"
echo "Bob:   $BOB_START"

# 2. MATCHING SCENARIO (Short-Term)
# Alice Buys 10 @ 100
# Bob Sells 10 @ 99 (Cross)
# Expected: Hashes NOT found in block, but Balances Change.

H=$(curl -s $NODE/status | jq -r '.result.sync_info.latest_block_height')
GTB=$((H + 50))
CID_ALICE=$(( $(date +%s) % 1000000 ))
CID_BOB=$(( CID_ALICE + 1 ))

echo -e "\n--- Placing MATCHING Short-Term Orders (GTB: $GTB) ---"
echo "Alice Buy 10 @ 100"
echo "Bob Sell 10 @ 99"

# Send concurrently to hit same block window
(
$BINARY tx clob place-order "$ALICE" 0 "$CID_ALICE" 35 1 10000000 100000 "$GTB" --from "$ALICE" --home ./tmp_keyring --keyring-backend test --chain-id "$CHAIN_ID" --fees "$FEE" --gas 200000 --broadcast-mode sync -y --node "$NODE" >/dev/null 2>&1
) &
(
$BINARY tx clob place-order "$BOB" 0 "$CID_BOB" 35 2 10000000 99000 "$GTB" --from "$BOB" --home ./tmp_keyring --keyring-backend test --chain-id "$CHAIN_ID" --fees "$FEE" --gas 200000 --broadcast-mode sync -y --node "$NODE" >/dev/null 2>&1
) &
wait

echo "Orders sent. Waiting for block..."
sleep 6

ALICE_END=$(get_positions_count "$ALICE")
BOB_END=$(get_positions_count "$BOB")

echo -e "\nFinal Positions Count:"
echo "Alice: $ALICE_END"
echo "Bob:   $BOB_END"

if [ "$ALICE_END" -gt "$ALICE_START" ]; then
    echo -e "\nSUCCESS: Positions created! Short-Term orders matched and trade executed."
else
    echo -e "\nFAILURE: No new positions. Orders likely dropped or not matched."
fi
