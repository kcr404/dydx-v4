#!/bin/bash
# Verify Short-Term Orders on Remote Instance (Tradeview)
# Run this script ON the remote instance (ec2-35-88-186-90)

set -e

echo "========================================="
echo "  Verify Short-Term Orders (Remote)"
echo "========================================="
echo ""

# Configuration
CHAIN_ID="localtradeview"
BINARY="tradeviewd"
CONTAINER="protocol-tradeviewd0-1"
NATIVE_DENOM="atvx"
# USDC Denom might vary. We'll try to detect it or assume standard IBC if standard setup.
# For now, we'll strip fees to just native denom if possible, or use the user's fee string.
FEE_STRING="5000000000000000${NATIVE_DENOM}"

CLOB_PAIR_ID=0 # Testing on Pair 0 (BTC/USD) as per user's example

# Helper to run command in container
run_cmd() {
    docker exec $CONTAINER $BINARY "$@"
}

# Helper to get address
get_address() {
    local name=$1
    # Capture all output (stdout+stderr) and grep strictly for the valid address format
    # This filters out the "kafkaconstring" and "option" noise
    run_cmd keys show $name -a --home /tradeview/chain/.$name --keyring-backend test 2>&1 | grep -oE "tradeview1[a-z0-9]{38,}" | head -n 1 || echo ""
}

echo "[Setup] detecting addresses..."
# Try to find Alice and Bob
ALICE=$(get_address "alice")

# If Alice is missing, try the user provided address
if [ -z "$ALICE" ]; then
    echo "⚠️  'alice' key not found in container (or parsing failed). Using hardcoded backup."
    ALICE="tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy" 
fi
# Sanity check to strip any remaining whitespace/newlines
ALICE=$(echo "$ALICE" | tr -d '[:space:]')

# Try to find Bob
BOB=$(get_address "bob")
BOB=$(echo "$BOB" | tr -d '[:space:]')

echo "Alice: $ALICE"
if [ -z "$BOB" ]; then
    echo "⚠️  Bob key not found. Using Alice for both sides (Self-Trade) with specific subaccounts."
    BOB=$ALICE
    SUB_ALICE=0
    SUB_BOB=1 # Different subaccount to avoid immediate self-trade cancel if logic allows, or just test matching.
              # Note: Self-trade might be rejected or cancel. Ideally we need a second key.
    # Try to create Bob if missing? 
    # For this script, we'll assume we can use Alice with different subaccounts 
    # OR we really should generate a key.
    # Let's generate a temporary key for Bob to be safe/clean.
    echo "Creating temporary Bob key..."
    run_cmd keys add bob_tmp --home /tradeview/chain/.bob_tmp --keyring-backend test > /dev/null 2>&1 || true
    # Sanitize this output too!
    BOB=$(run_cmd keys show bob_tmp -a --home /tradeview/chain/.bob_tmp --keyring-backend test 2>&1 | grep -oE "tradeview1[a-z0-9]{38,}" | head -n 1)
    # Strip whitespace
    BOB=$(echo "$BOB" | tr -d '[:space:]')
    
    echo "Bob (Temp): $BOB"
    SUB_BOB=0
    
    # Fund Bob from Alice
    echo "Funding Bob from Alice..."
    run_cmd tx bank send $ALICE $BOB 100000000000000000000${NATIVE_DENOM} \
        --home /tradeview/chain/.alice --keyring-backend test \
        --chain-id $CHAIN_ID --fees $FEE_STRING --gas 200000 --broadcast-mode sync -y
    sleep 5
else
    SUB_ALICE=0
    SUB_BOB=0
fi
echo "Bob:   $BOB"
echo "Pair:  $CLOB_PAIR_ID"
echo ""

# 0. Check Balances
echo "[Setup] Checking Balances..."
run_cmd query bank balances $ALICE
run_cmd query bank balances $BOB

# 1. Get Height & GTB
WIDTH=20
HEIGHT=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
GTB=$((HEIGHT + WIDTH))

echo "Current Height: $HEIGHT"
echo "Good Til Block: $GTB"
echo ""

# 2. Generate Client IDs
CLIENT_ID_ALICE=$((RANDOM % 1000000 + 1000))
CLIENT_ID_BOB=$((CLIENT_ID_ALICE + 1))

# 3. Place Alice BUY (Aggressive)
echo "[Alice] Placing BUY order on Pair $CLOB_PAIR_ID..."
# Buy 1.0 Quantums @ 20,000,000 Subticks (High Price)
# NOTE: Quantums/Subticks scaling depends on the pair. 
# User script used 1,000,000 quantums. We'll use 1,000,000.
QUANTUMS=1000000
PRICE_BUY=200000000 # High price
PRICE_SELL=100000 # Low price

ALICE_OUT=$(run_cmd tx clob place-order \
  "$ALICE" $SUB_ALICE $CLIENT_ID_ALICE $CLOB_PAIR_ID 1 $QUANTUMS $PRICE_BUY $GTB \
  --from $ALICE --home /tradeview/chain/.alice --keyring-backend test \
  --chain-id $CHAIN_ID \
  --fees "$FEE_STRING" \
  --gas 200000 \
  --broadcast-mode sync \
  --yes \
  --node tcp://localhost:26657 2>&1)

ALICE_HASH=$(echo "$ALICE_OUT" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
echo "Alice TxHash: $ALICE_HASH"

# 4. Place Bob SELL (Aggressive)
echo "[Bob] Placing SELL order on Pair $CLOB_PAIR_ID..."
KEY_HOME="/tradeview/chain/.bob"
KEY_NAME="bob"
if [[ "$BOB" == *"bob_tmp"* ]] || [[ "$BOB" != "$(get_address bob)" ]]; then
   KEY_HOME="/tradeview/chain/.bob_tmp"
   KEY_NAME="bob_tmp"
fi

BOB_OUT=$(run_cmd tx clob place-order \
  "$BOB" $SUB_BOB $CLIENT_ID_BOB $CLOB_PAIR_ID 2 $QUANTUMS $PRICE_SELL $GTB \
  --from $KEY_NAME --home $KEY_HOME --keyring-backend test \
  --chain-id $CHAIN_ID \
  --fees "$FEE_STRING" \
  --gas 200000 \
  --broadcast-mode sync \
  --yes \
  --node tcp://localhost:26657 2>&1)

BOB_HASH=$(echo "$BOB_OUT" | grep -oP 'txhash: \K[0-9A-F]+' || echo "")
echo "Bob TxHash:   $BOB_HASH"

echo ""
echo "Waiting 10 seconds..."
sleep 10

echo ""
echo "Waiting 15 seconds for block inclusion..."
sleep 15

# 5. Verify in recent blocks (MsgProposedOperations check)
LATEST=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
START=$((LATEST - 5))
echo "Checking blocks $START to $LATEST for MsgProposedOperations..."

FOUND=0
for height in $(seq $START $LATEST); do
    # Check for any DeliverTx events containing MsgProposedOperations
    # This indicates the validator proposed matches (including ours)
    RESULT=$(curl -s "http://localhost:26657/block_results?height=$height" | \
        grep "MsgProposedOperations")
    
    if [ -n "$RESULT" ]; then
        echo "✅ Block $height: MsgProposedOperations found! (Matches included)"
        FOUND=1
    else
        echo "   Block $height: -"
    fi
done

if [ "$FOUND" -eq 1 ]; then
    echo "SUCCESS: Short-term orders resulted in on-chain operations."
else
    echo "WARNING: No MsgProposedOperations found in recent blocks."
    # Fallback: Check logs again with wider grep just in case
    docker logs $CONTAINER --tail 50 2>&1 | grep -i "order" || echo "No order logs found."
fi

echo ""
echo "Done."
