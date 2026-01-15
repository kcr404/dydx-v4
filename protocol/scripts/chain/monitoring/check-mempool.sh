#!/bin/bash
# Script to check mempool status and monitor transactions

set +e  # Don't exit on errors

cd "$(dirname "$0")"

echo "=========================================="
echo "Mempool Status Checker"
echo "=========================================="

# Check mempool
echo -e "\n[1] Current Mempool Status:"
MEMPOOL=$(curl -s "http://localhost:26657/unconfirmed_txs?limit=100" 2>/dev/null)
if [ $? -eq 0 ] && [ ! -z "$MEMPOOL" ]; then
    N_TXS=$(echo "$MEMPOOL" | jq -r '.result.n_txs // "0"' 2>/dev/null || echo "0")
    TOTAL=$(echo "$MEMPOOL" | jq -r '.result.total // "0"' 2>/dev/null || echo "0")
    echo "  Total transactions: $TOTAL"
    echo "  Number of txs: $N_TXS"
else
    echo "  Error: Could not query mempool"
    exit 1
fi

if [ "$N_TXS" != "0" ] && [ "$N_TXS" != "null" ]; then
    echo -e "\n[2] Transaction Hashes in Mempool:"
    echo "$MEMPOOL" | jq -r '.result.txs[]? | .hash' | while read hash; do
        if [ ! -z "$hash" ]; then
            echo "  - $hash"
        fi
    done
    
    echo -e "\n[3] Transaction Details:"
    echo "$MEMPOOL" | jq -r '.result.txs[]?' | jq -c '{hash: .hash, size: (.tx | length)}' | head -n 10
else
    echo "  Mempool is empty"
fi

# Check specific tx if provided
if [ ! -z "$1" ]; then
    TXHASH=$1
    echo -e "\n[4] Checking specific transaction: $TXHASH"
    
    # Check in mempool
    IN_MEMPOOL=$(echo "$MEMPOOL" | jq -r ".result.txs[]? | select(.hash == \"$TXHASH\") | .hash")
    if [ ! -z "$IN_MEMPOOL" ]; then
        echo "  ✓ Transaction is in mempool"
    else
        echo "  ✗ Transaction NOT in mempool"
    fi
    
    # Check if included in block
    echo -e "\n[5] Checking if transaction is included in blocks..."
    RESP=$(curl -s "http://localhost:26657/tx?hash=0x$TXHASH")
    if echo "$RESP" | jq -e '.result' >/dev/null 2>&1; then
        HEIGHT=$(echo "$RESP" | jq -r '.result.height')
        CODE=$(echo "$RESP" | jq -r '.result.tx_result.code')
        echo "  ✓ Transaction found in block $HEIGHT"
        echo "  Code: $CODE"
        if [ "$CODE" != "0" ]; then
            LOG=$(echo "$RESP" | jq -r '.result.tx_result.log // ""')
            echo "  Error log: $LOG"
        fi
    else
        echo "  ✗ Transaction NOT found in any block"
    fi
fi

# Current block info
echo -e "\n[6] Current Block Information:"
H=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
LATEST_BLOCK=$(curl -s "http://localhost:26657/block?height=$H")
TX_COUNT=$(echo "$LATEST_BLOCK" | jq -r '.result.block.data.txs | length')
echo "  Current height: $H"
echo "  Txs in latest block: $TX_COUNT"

echo -e "\n=========================================="

