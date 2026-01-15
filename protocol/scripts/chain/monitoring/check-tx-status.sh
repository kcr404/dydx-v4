#!/bin/bash
# Script to check transaction status on blockchain

set +e

if [ -z "$1" ]; then
    echo "Usage: $0 <TXHASH>"
    echo "Example: $0 F6363D872D9811A493A491608F17833A16E7D905EC58A4F58260D06FDD98C439"
    exit 1
fi

TXHASH=$1

echo "=========================================="
echo "Checking Transaction Status"
echo "=========================================="
echo "TxHash: $TXHASH"
echo ""

# Check if transaction is included
echo "[1] Checking if transaction is included in a block..."
TX_RESP=$(curl -s "http://localhost:26657/tx?hash=0x$TXHASH" 2>/dev/null)

if echo "$TX_RESP" | jq -e '.result' >/dev/null 2>&1; then
    HEIGHT=$(echo "$TX_RESP" | jq -r '.result.height')
    CODE=$(echo "$TX_RESP" | jq -r '.result.tx_result.code')
    GAS_USED=$(echo "$TX_RESP" | jq -r '.result.tx_result.gas_used // "0"')
    GAS_WANTED=$(echo "$TX_RESP" | jq -r '.result.tx_result.gas_wanted // "0"')
    LOG=$(echo "$TX_RESP" | jq -r '.result.tx_result.log // ""')
    
    echo "  ✓ Transaction INCLUDED in block $HEIGHT"
    echo "  Code: $CODE"
    echo "  Gas used: $GAS_USED / $GAS_WANTED"
    
    if [ "$CODE" = "0" ]; then
        echo "  Status: ✓ SUCCESS"
    else
        echo "  Status: ✗ FAILED"
        if [ ! -z "$LOG" ] && [ "$LOG" != "null" ]; then
            echo "  Error log: $LOG"
        fi
    fi
    
    # Show events
    echo ""
    echo "[2] Transaction Events:"
    EVENTS=$(echo "$TX_RESP" | jq -r '.result.tx_result.events[]? | "\(.type): \(.attributes[]? | select(.key == "order_id" or .key == "clob_pair_id" or .key == "side") | "\(.key)=\(.value)")"' 2>/dev/null)
    if [ ! -z "$EVENTS" ]; then
        echo "$EVENTS" | grep -v "^$" | head -n 20
    else
        echo "  No events found"
    fi
    
    # Show block info
    echo ""
    echo "[3] Block Information:"
    BLOCK=$(curl -s "http://localhost:26657/block?height=$HEIGHT" 2>/dev/null)
    BLOCK_TIME=$(echo "$BLOCK" | jq -r '.result.block.header.time // "N/A"')
    TX_COUNT=$(echo "$BLOCK" | jq -r '.result.block.data.txs | length')
    echo "  Block height: $HEIGHT"
    echo "  Block time: $BLOCK_TIME"
    echo "  Total txs in block: $TX_COUNT"
    
    # Check if this tx is in the block
    TX_INDEX=$(echo "$BLOCK" | jq -r ".result.block.data.txs | to_entries[] | select(.value | contains(\"$TXHASH\")) | .key" 2>/dev/null)
    if [ ! -z "$TX_INDEX" ]; then
        echo "  Tx index in block: $TX_INDEX"
    fi
    
else
    echo "  ✗ Transaction NOT found in any block"
    echo ""
    echo "[2] Checking mempool..."
    MEMPOOL=$(curl -s "http://localhost:26657/unconfirmed_txs?limit=50" 2>/dev/null)
    IN_MEMPOOL=$(echo "$MEMPOOL" | jq -r ".result.txs[]? | select(.hash == \"$TXHASH\") | .hash" 2>/dev/null)
    if [ ! -z "$IN_MEMPOOL" ]; then
        echo "  ✓ Transaction is in mempool (waiting to be included)"
    else
        echo "  ✗ Transaction NOT in mempool"
        echo "  Possible reasons:"
        echo "    - Transaction expired (GoodTilBlock passed)"
        echo "    - Transaction was filtered out during PrepareProposal"
        echo "    - Transaction was evicted from mempool"
    fi
fi

echo ""
echo "=========================================="
echo "Current Chain Status:"
H=$(curl -s http://localhost:26657/status 2>/dev/null | jq -r '.result.sync_info.latest_block_height // "N/A"')
echo "Latest block height: $H"
echo "=========================================="

