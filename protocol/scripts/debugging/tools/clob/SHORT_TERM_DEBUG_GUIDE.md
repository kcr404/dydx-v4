# Short-Term Order Debugging Guide

**Date**: January 13, 2026  
**Goal**: Get short-term orders successfully included in blocks by EOD

---

## Current Status

### ✅ What's Working:
- Chain is running (height ~450+)
- Subaccounts are funded (100B quantums each)
- Stateful orders work perfectly
- Orders accepted to mempool

### ❌ Problem:
- Short-term orders NOT being included in blocks
- Orders filtered during PrepareProposal

---

## Step-by-Step Debugging Plan

### Step 1: Check Existing Positions (DONE)
**Alice's positions:**
- Asset: 100B quantums USDC
- Perpetual 35: +3M quantums (LONG position)

**Bob's positions:**
- Asset: 100B quantums USDC
- Perpetual 0: -3M quantums (SHORT)
- Perpetual 1: -1M quantums (SHORT)
- Perpetual 35: -3M quantums (SHORT)

**Analysis**: They have OPPOSITE positions on pair 35!
- Alice: LONG 3M
- Bob: SHORT 3M

---

### Step 2: Try Closing Existing Positions First

**Strategy**: Place orders that REDUCE their existing positions (reduce-only)

**Test 1**: Close positions on pair 35
```bash
# Alice SELLS to close her LONG position
# Bob BUYS to close his SHORT position
```

---

### Step 3: Use Different Market (Pair 0 - BTC)

**Why**: Bob already has a SHORT position on pair 0
**Test**: Try pair 1 (ETH) or pair 2/3/4 where they have no positions

---

### Step 4: Check PrepareProposal Logs

**Command**:
```bash
docker logs protocol-dydxprotocold0-1 2>&1 | grep -A5 -B5 "PrepareProposal\|RemoveDisallowMsgs"
```

**Look for**:
- Order filtering reasons
- Collateralization failures
- Rate limit violations

---

### Step 5: Try REDUCE-ONLY Orders

**Hypothesis**: New positions might violate margin requirements

**Test**: Place reduce-only orders
```bash
# Add --reduce-only flag or use reduce_only=true in order
```

---

### Step 6: Use Smaller Order Sizes

**Current**: 1M quantums
**Try**: 100k quantums (10x smaller)

**Reason**: Smaller orders less likely to violate margin

---

### Step 7: Check Block Rate Limits

**Command**:
```bash
docker exec protocol-dydxprotocold0-1 dydxprotocold query clob list-block-rate-limit --output json
```

**Check**: Are we hitting rate limits?

---

### Step 8: Verify CLOB Pair Status

**Command**:
```bash
curl -s "http://localhost:1317/dydxprotocol/clob/clob_pair/0" | jq '.clob_pair.status'
```

**Must be**: `STATUS_ACTIVE`

---

### Step 9: Check Short Block Window

**In genesis**: `short_block_window` parameter
**Our GTB**: Must be within this window

**Command**:
```bash
# Check genesis for short_block_window
cat localnet/dydxprotocol0/config/genesis.json | jq '.app_state.clob.clob_pairs[0]'
```

---

### Step 10: Nuclear Option - Fresh Subaccounts

**If all else fails**: Create NEW subaccounts with no existing positions

**Steps**:
1. Use subaccount number 1 instead of 0
2. Fund them fresh
3. Place orders with clean slate

---

## Immediate Action Plan (Next 30 Minutes)

### Test A: Close Existing Positions on Pair 35
```bash
# Alice SELLS (close LONG)
# Bob BUYS (close SHORT)
# This should REDUCE positions, not increase
```

### Test B: Use Clean Market (Pair 2)
```bash
# Neither has positions on pair 2
# Place fresh orders there
```

### Test C: Tiny Orders
```bash
# Use 10k quantums instead of 1M
# Minimal margin impact
```

---

## Commands to Run NOW

### 1. Check logs for filtering
```bash
docker logs protocol-dydxprotocold0-1 2>&1 | tail -100 | grep -i "filter\|disallow\|reject"
```

### 2. Try pair 2 (clean slate)
```bash
GTB=$(($(curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height') + 10))

# Alice BUY on pair 2
docker exec protocol-dydxprotocold0-1 dydxprotocold tx clob place-order \
  "tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy" 0 999001 2 1 100000 100000 $GTB \
  --from alice --home /dydxprotocol/chain/.alice --keyring-backend test \
  --chain-id localtradeview \
  --fees "5000000000000000adv4tnt,5000ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5" \
  --gas 200000 --broadcast-mode sync -y --node tcp://localhost:26657
```

### 3. Check if it's in mempool
```bash
curl -s "http://localhost:26657/unconfirmed_txs?limit=10" | jq '.result.n_txs'
```

### 4. Wait and check inclusion
```bash
sleep 10
# Check if included in recent blocks
curl -s "http://localhost:26657/block" | jq '.result.block.data.txs | length'
```

---

## Success Criteria

✅ Order accepted to mempool (code: 0)  
✅ Order appears in block within GTB window  
✅ Transaction query shows code: 0  
✅ Match events generated (if crossing orders)

---

## Next Steps After Success

1. Document exact working configuration
2. Create reliable test script
3. Test on multiple markets
4. Verify matching mechanics
5. Complete Day 2 CLOB study notes

---

**Time Remaining**: ~4 hours until EOD  
**Priority**: HIGH  
**Blocker**: PrepareProposal filtering - need to identify exact cause
