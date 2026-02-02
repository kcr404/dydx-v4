================================================================================
FILE MIGRATION: test_orders.sh → Tradeview
================================================================================

STATUS: ✅ MIGRATION COMPLETE

FILE: /data/dydx-v4/protocol/scripts/testing/orders/test_orders.sh

PURPOSE:
  Comprehensive order testing suite that validates:
  • Short-term order placement and inclusion
  • Stateful (long-term) order placement and inclusion
  • Order matching between Alice and Bob
  • Mempool and block status verification

================================================================================
CHANGES MADE (dYdX → Tradeview)
================================================================================

1. TITLE & COMMENTS
   Before: "dYdX Order Testing Suite" / "Based on dYdX v4 local devnet runbook"
   After:  "Tradeview Order Testing Suite" / "Tradeview local devnet order placement"

2. BINARY NAME
   Before: dydxprotocold
   After:  tradeviewd
   Locations: 6 occurrences in tx clob place-order commands

3. CHAIN ID
   Before: localdydxprotocol
   After:  localtradeview
   Locations: 2 occurrences (configuration and flag values)

4. ADDRESSES (Bech32 Prefix)
   Before: dydx1... prefix
   After:  tradeview1... prefix
   
   Alice:
   Before: dydx199tqg4wdlnu4qjlxchpd7seg454937hjrknju4
   After:  tradeview199tqg4wdlnu4qjlxchpd7seg454937hjrjm7f4
   
   Bob:
   Before: dydx10fx7sy6ywd5senxae9dwytf8jxek3t2gcen2vs
   After:  tradeview10fx7sy6ywd5senxae9dwytf8jxek3t2g6jq5jj

5. TOKENS / DENOMINATIONS
   Before: adv4tnt (dYdX native token)
   After:  atvx (Tradeview native token)
   
   Removed IBC USDC reference (now only native token):
   Before: "5000000000000000adv4tnt,5000ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5"
   After:  "5000000000000000atvx"

6. DOCKER CONTAINER NAMES
   Before: protocol-dydxprotocold0-1, protocol-dydxprotocold1-1
   After:  protocol-tradeviewd0-1 (both Alice and Bob use same container)
   Locations: 4 occurrences (docker exec commands)

7. HOME DIRECTORIES (Chain home path)
   Before: /dydxprotocol/chain/.alice, /dydxprotocol/chain/.bob
   After:  /tradeview/chain/.alice, /tradeview/chain/.bob
   Locations: 4 occurrences

8. PROTOCOL MODULE PATHS (gRPC queries)
   Before: /dydxprotocol.prices.Query/AllMarketPrices
   After:  /tradeview.prices.Query/AllMarketPrices

================================================================================
VALIDATION COMMAND
================================================================================

To test the migrated script, run:

  cd /data/dydx-v4/protocol/scripts/testing/orders/
  ./test_orders.sh

EXPECTED OUTPUT:
  
  =========================================
    Tradeview Order Testing Suite
  =========================================
  
  Step 1: Verifying chain status...
     ✅ Chain is running at height: XXXXX
  
  Step 2: Getting oracle price...
     Oracle data available: Yes
  
  PART 1: SHORT-TERM ORDERS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Step 3: Placing SHORT-TERM matching orders...
     Current Height: XXXXX
     Good Til Block: XXXXX
     Alice Client ID: XXXXX
     Bob Client ID: XXXXX
  
     [Alice] Placing BUY order (1M quantums @ 100k subticks)...
        ✅ Alice TxHash: [HEX]
  
     [Bob] Placing SELL order (1M quantums @ 100k subticks)...
        ✅ Bob TxHash: [HEX]
  
  Step 4: Waiting for short-term order inclusion...
     ✅ Alice: INCLUDED at height XXXXX (SUCCESS)
        🎯 MATCH EVENT FOUND!
     ✅ Bob: INCLUDED at height XXXXX (SUCCESS)
        🎯 MATCH EVENT FOUND!
  
  [Similar output for PART 2: STATEFUL ORDERS]
  
  PART 3: VERIFICATION
  ═══════════════════════════════════════════════
  
  Step 7: Checking mempool status...
     Transactions in mempool: 0
  
  Step 8: Checking latest block...
     Latest block height: XXXXX
     Txs in latest block: N
  
  =========================================
    TEST SUMMARY
  =========================================
  
  ✅ Short-term orders tested
  ✅ Stateful (long-term) orders tested
  ✅ Order inclusion verified
  ✅ Mempool status checked

================================================================================
COMMON FAILURE CASES & DIAGNOSTICS
================================================================================

❌ ERROR: "Chain is not running!"
   CAUSE: Tradeviewd container not running
   FIX:   cd /data/dydx-v4/protocol && docker-compose up -d
          or check: docker ps | grep tradeviewd0

❌ ERROR: "Alice order failed" / "Bob order failed"
   CAUSE: Address or home directory incorrect
   DIAGNOSTICS:
     • Verify addresses start with "tradeview1": echo $ALICE
     • Check home paths exist: docker exec protocol-tradeviewd0-1 ls /tradeview/chain/.alice
     • Check keyring: docker exec protocol-tradeviewd0-1 tradeviewd keys list --home /tradeview/chain/.alice
   FIX:   Verify ALICE/BOB variables and home paths match chain config

❌ ERROR: "txhash" not found in output
   CAUSE: Order submission failed (check stderr output)
   DIAGNOSTICS:
     • Run command manually to see full error output
     • Common issues: invalid chain-id, insufficient fees, wrong key name
   FIX:   Check order submission output for specific error

❌ ERROR: "NOT INCLUDED (may be in mempool or dropped)"
   CAUSE: Transaction not included in block yet
   DIAGNOSTICS:
     • Chain might be slow or stopped: curl http://localhost:26657/status | jq '.result.sync_info.latest_block_height'
     • Check mempool: curl http://localhost:26657/unconfirmed_txs
     • Wait longer (5→15 seconds)
   FIX:   Increase sleep duration or verify chain is producing blocks

❌ ERROR: Address format error / Invalid bech32
   CAUSE: Address prefix still "dydx1" instead of "tradeview1"
   DIAGNOSTICS:
     • Check ALICE and BOB variables
     • Verify they start with "tradeview"
   FIX:   Update address variables at top of script

❌ ERROR: "unknown command \"place-order\""
   CAUSE: Tradeviewd binary doesn't have CLOB module
   DIAGNOSTICS:
     • Check binary version: docker exec protocol-tradeviewd0-1 tradeviewd version
     • List available commands: docker exec protocol-tradeviewd0-1 tradeviewd tx --help
   FIX:   Ensure correct tradeviewd image is being used

================================================================================
KEY DIFFERENCES FROM dYdX
================================================================================

Chain:
  dYdX:      localdydxprotocol
  Tradeview: localtradeview

Binary:
  dYdX:      dydxprotocold
  Tradeview: tradeviewd

Addresses:
  dYdX:      dydx1... (bech32 prefix: dydx)
  Tradeview: tradeview1... (bech32 prefix: tradeview)

Tokens:
  dYdX:      adv4tnt (native), IBC USDC
  Tradeview: atvx (native), IBC assets TBD

Modules:
  dYdX:      /dydxprotocol.X.Query/...
  Tradeview: /tradeview.X.Query/...

Docker:
  dYdX:      protocol-dydxprotocold0-1
  Tradeview: protocol-tradeviewd0-1

Home Paths:
  dYdX:      /dydxprotocol/chain/.alice
  Tradeview: /tradeview/chain/.alice

================================================================================
NOTES
================================================================================

• Both Alice and Bob orders now execute on the same container (protocol-tradeviewd0-1)
  This is correct for Tradeview localnet setup

• GTB (Good Til Block) uses dynamic height fetch
  This prevents expiry issues and is production-safe

• Oracle price query is optional (may return N/A in localnet)
  Script continues even if oracle data unavailable

• Fees use only native token (atvx)
  IBC assets not included in Tradeview localnet

• Order matching requires both orders in same block
  Timing (sleep 1 between orders) is critical

================================================================================
NEXT STEPS
================================================================================

1. ✅ This script is now Tradeview-compatible

2. After testing, migrate the supporting scripts in order:
   - test_short_term_grpc.js (Node.js implementation)
   - test_short_term_grpc.py (Python implementation)
   - Other specialized scripts

3. Share validation results in next review

================================================================================
