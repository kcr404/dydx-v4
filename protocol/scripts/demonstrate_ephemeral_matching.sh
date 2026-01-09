#!/bin/bash
# Demonstrate Ephemeral (Short-Term) Order Matching
# Key Concept: Speed. Both orders must arrive in the VERY SAME BLOCK window.

set -e

# Setup
if [ -d "../build" ]; then cd ..; fi
CHAIN_ID="localdydxprotocol"
FEE="5000000000000000adv4tnt"
NODE="http://localhost:26657"
BINARY="./build/dydxprotocold"

echo "=========================================="
echo "    EPHEMERAL ORDER MATCHING DEMO"
echo "=========================================="
echo "Strategy: Parallel Execution (Alice & Bob same time)"

ALICE=$($BINARY keys show alice --home ./tmp_keyring --keyring-backend test -a)
BOB=$($BINARY keys show bob --home ./tmp_keyring --keyring-backend test -a)

# Helper: Total Position Size (Sum of absolute quantums)
get_positions() {
    local addr=$1
    # Sum up all quantums (absolute value logic is hard in jq without more code, but simple sum is enough if we just check for change)
    # Actually, let's just grab the quantums of the first position (since we only trade Pair 35)
    $BINARY query subaccounts show-subaccount "$addr" 0 --output json --node "$NODE" | jq -r '.subaccount.perpetual_positions[0].quantums // "0"'
}

START_A=$(get_positions "$ALICE")
START_B=$(get_positions "$BOB")
echo -e "\n[State] Open Positions: Alice=$START_A, Bob=$START_B"

# Prepare Orders
H=$(curl -s $NODE/status | jq -r '.result.sync_info.latest_block_height')
GTB=$((H + 10)) # Short Term!
CID_A=$(( $(date +%s) % 1000000 ))
CID_B=$(( CID_A + 1 ))

echo -e "\n[Action] Firing orders concurrently..."
echo "  Alice: Buy 10 @ 100 USDC"
echo "  Bob:   Sell 10 @ 99  USDC"

# Retry loop
for i in {1..3}; do
    echo -e "\n--- Attempt $i ---"
    
    # Capture output to check for sequence errors
    ($BINARY tx clob place-order "$ALICE" 0 "$((CID_A+i))" 35 1 10000000 100000 "$GTB" \
      --from "$ALICE" --home ./tmp_keyring --keyring-backend test --chain-id "$CHAIN_ID" \
      --fees "$FEE" --gas 200000 --broadcast-mode sync -y --node "$NODE") & pid1=$!

    ($BINARY tx clob place-order "$BOB" 0 "$((CID_B+i))" 35 2 10000000 99000 "$GTB" \
      --from "$BOB" --home ./tmp_keyring --keyring-backend test --chain-id "$CHAIN_ID" \
      --fees "$FEE" --gas 200000 --broadcast-mode sync -y --node "$NODE") & pid2=$!

    wait $pid1 $pid2
    echo "[Done] Broadcast complete."
    
    sleep 2
    
    CUR_A=$(get_positions "$ALICE")
    if [ "$CUR_A" != "$START_A" ]; then
        echo -e "\n✅ SUCCESS: Match confirmed on attempt $i! Size changed from $START_A to $CUR_A"
        START_A=$CUR_A # Update for next logic if needed
        break
    else
        echo "   No size change yet ($CUR_A)..."
    fi
done

echo -e "\n[Wait] Waiting 5 seconds for block inclusion..."
sleep 5

END_A=$(get_positions "$ALICE")
END_B=$(get_positions "$BOB")
echo -e "\n[State] Open Positions: Alice=$END_A, Bob=$END_B"

if [ "$END_A" -gt "$START_A" ]; then
    echo -e "\n✅ SUCCESS: Positions increased!"
    echo "   Proof that Short-Term orders matched because they arrived together."
else
    echo -e "\n❌ FAILURE: No match. Likely missed the timing window."
fi
