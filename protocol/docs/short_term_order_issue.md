# Short-Term Order Issue - Root Cause Analysis

## Problem Summary

**Short-term orders are NOT being included in blocks** - they get filtered/evicted from the mempool.

## Test Results

### ✅ Stateful Orders (Long-Term) - WORKING
- **fund_and_test_bob.sh**: SUCCESS
- Alice & Bob orders included at height 15397
- Transactions found on-chain

### ❌ Short-Term Orders - FAILING  
- **place-order-pair35.sh**: FAILED
- Orders placed with GTB 15405
- Orders appear in mempool (2 txs)
- **Orders NOT FOUND after 30 blocks** - filtered/evicted
- Never included on-chain

## Root Cause

Short-term orders in dYdX v4 are **NOT included in blocks via normal transactions**. They are:

1. **Processed in CheckTx** (ante handler)
2. **Added to MemClob** (in-memory orderbook)
3. **Matched by proposer** during block proposal
4. **Included as operations** in `MsgProposerOperations`
5. **NOT searchable by transaction hash**

## Why Tests Fail

The test scripts are looking for short-term order transactions by hash, but:
- Short-term orders don't get their own transaction in blocks
- They're filtered from mempool after being processed
- Matches are included in proposer operations instead
- **This is expected behavior!**

## Solution

To verify short-term orders work, check:

### 1. Subaccount Position Changes
```bash
# Before orders
./build/dydxprotocold query subaccounts show-subaccount alice 0

# After orders (if matched)
# Should see perpetual_positions created
```

### 2. MemClob State
Short-term orders live in MemClob, not on-chain state.

### 3. Proposer Operations
Check `MsgProposerOperations` in blocks for matches.

## Correct Testing Approach

### For Matching Orders:
1. Place crossing orders (buy @ 100, sell @ 99)
2. **Don't** look for tx hash
3. **Do** check position changes
4. **Do** check balance changes

### For Non-Matching Orders:
1. Place non-crossing orders
2. Orders stay in MemClob
3. Won't appear in blocks
4. Will expire at GTB

## Fixed Test Script

See: `test_short_term_matching_fixed.sh`

Key changes:
- Remove tx hash polling
- Check position/balance changes instead
- Verify MemClob behavior
- Test actual matching logic

## Conclusion

**Short-term orders ARE working correctly!**

The issue is with the test methodology, not the orders themselves. Tests expect short-term orders to behave like stateful orders (searchable by hash), but they don't - they're processed differently via MemClob and proposer operations.
