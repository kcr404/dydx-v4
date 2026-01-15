# How to Check Mempool and Fix CLOB Order Inclusion Issue

## How to Check if Transaction is in Mempool

### Method 1: Using the Check Script
```bash
cd /data/data/v4-chain/protocol

# Check general mempool status
./check-mempool.sh

# Check specific transaction
./check-mempool.sh <TXHASH>
```

### Method 2: Direct RPC Query
```bash
# Check mempool status
curl -s "http://localhost:26657/unconfirmed_txs?limit=50" | jq '{n_txs:.result.n_txs, total:.result.total, tx_hashes:[.result.txs[]?|.hash]}'

# Check if specific tx is in mempool
TXHASH="YOUR_TXHASH_HERE"
curl -s "http://localhost:26657/unconfirmed_txs?limit=50" | jq ".result.txs[]? | select(.hash == \"$TXHASH\")"
```

### Method 3: Check if Transaction was Included
```bash
TXHASH="YOUR_TXHASH_HERE"
curl -s "http://localhost:26657/tx?hash=0x$TXHASH" | jq '{height:.result.height, code:.result.tx_result.code, included:(.result != null)}'
```

## Root Cause Analysis

### The Problem
**Short-term CLOB orders (GoodTilBlock) are being filtered out during PrepareProposal.**

### Why This Happens

1. **Filtering Logic** (`protocol/app/process/utils_disallow_msgs.go`):
   ```go
   func IsDisallowClobOrderMsgInOtherTxs(targetMsg sdk.Msg) bool {
       case *clobtypes.MsgPlaceOrder:
           order := msg.GetOrder()
           orderId := order.GetOrderId()
           return !orderId.IsStatefulOrder() // Short-term orders return true -> DISALLOWED
   }
   ```

2. **Design Intent**:
   - Short-term orders are **NOT allowed** in `OtherTxs` (user-submitted transactions)
   - They **MUST** be included in `MsgProposedOperations` (app-injected operations)
   - `MsgProposedOperations` is created by `GetProposedOperationsTx()` which calls `MemClob.GetOperationsRaw()`

3. **The Flow**:
   ```
   User submits order → CheckTx (validates) → Mempool
   ↓
   PrepareProposal filters out from OtherTxs (because it's short-term)
   ↓
   Should be included in ProposedOperations via MemClob
   ↓
   But MemClob doesn't have it → Order disappears
   ```

### Why Orders Aren't in MemClob

The MemClob needs orders to be:
1. **Matched** - Orders that can be matched are included in operations
2. **In operations queue** - Orders need to be in the MemClob's internal operations queue

**Possible reasons orders aren't included:**
- Orders aren't matchable (no counterparty)
- Orders aren't being added to MemClob during CheckTx
- Orders expire before being processed
- MemClob operations queue is empty or filtered

## How to Fix This Issue

### Option 1: Use Stateful Orders (Long-term Solution)

Stateful orders are allowed in OtherTxs and don't require matching:

```bash
# Place a stateful order instead of short-term
# Note: This requires different order parameters (GoodTilBlockTime instead of GoodTilBlock)
```

**Limitation**: Stateful orders have different requirements and may not be suitable for all use cases.

### Option 2: Ensure Orders are Matchable

Orders need to be matchable to be included in ProposedOperations:

```bash
# Place matching BUY and SELL orders simultaneously
# Both orders should:
# - Be on the same CLOB pair
# - Have overlapping prices
# - Be placed within the same block window
```

**Example**:
```bash
# Place BUY order at price X
# Place SELL order at price <= X
# Both should be included in ProposedOperations as a match
```

### Option 3: Check MemClob State

Investigate why orders aren't reaching MemClob:

```bash
# Run comprehensive debug script
./debug-clob-inclusion.sh

# Check PrepareProposal logs for filtering
docker logs --tail=1000 protocol-dydxprotocold0-1 2>&1 | grep -iE "RemoveDisallowMsgs.*skip|PrepareProposal|GetOperations"
```

### Option 4: Verify Order Parameters

Ensure orders meet all requirements:

```bash
# Check CLOB pair is active
./build/dydxprotocold query clob show-clob-pair 35 --node tcp://localhost:26657

# Verify GoodTilBlock is valid
H=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
SHORT_WINDOW=$(cat localnet/genesis.json | jq -r '.app_state.clob.block_rate_limit_config.short_block_window')
echo "Current height: $H"
echo "Valid GTB range: $H to $((H + SHORT_WINDOW))"
```

## Debugging Commands

### Check Mempool Status
```bash
./check-mempool.sh
```

### Comprehensive Debugging
```bash
./debug-clob-inclusion.sh
```

### Monitor Real-time
```bash
# Watch mempool continuously
watch -n 1 'curl -s "http://localhost:26657/unconfirmed_txs?limit=50" | jq "{n_txs:.result.n_txs, total:.result.total}"'

# Monitor logs for filtering
docker logs -f protocol-dydxprotocold0-1 2>&1 | grep -iE "RemoveDisallowMsgs|PrepareProposal|GetOperations"
```

### Check Block Contents
```bash
H=$(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height')
curl -s "http://localhost:26657/block?height=$H" | jq '{height:.result.block.header.height, tx_count:(.result.block.data.txs | length)}'
```

## Expected Behavior

### For Short-Term Orders:
1. ✅ Pass CheckTx validation
2. ✅ Enter mempool
3. ❌ **Filtered out from OtherTxs** (by design)
4. ✅ Should be included in ProposedOperations (if matchable)
5. ❌ **Currently not included** (needs investigation)

### For Stateful Orders:
1. ✅ Pass CheckTx validation
2. ✅ Enter mempool
3. ✅ Included in OtherTxs (allowed)
4. ✅ Included in blocks

## Next Steps

1. **Investigate MemClob**: Check why orders aren't being added to MemClob operations queue
2. **Check Matching Logic**: Verify if orders need to be matchable to be included
3. **Review CheckTx**: Ensure orders are being added to MemClob during CheckTx
4. **Test with Matching Orders**: Place BUY and SELL orders that can match each other
5. **Enable Debug Logging**: Increase log verbosity to see MemClob operations

## Key Files to Review

- `protocol/app/process/utils_disallow_msgs.go` - Filtering logic
- `protocol/app/prepare/prepare_proposal.go` - PrepareProposal handler
- `protocol/x/clob/keeper/orders.go` - GetOperations implementation
- `protocol/x/clob/memclob/` - MemClob operations queue logic

---

**Last Updated**: 2025-12-12
**Status**: Root cause identified - short-term orders filtered from OtherTxs, need to investigate MemClob inclusion

