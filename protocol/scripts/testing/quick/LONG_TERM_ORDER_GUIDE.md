# Long-Term Order Testing Guide - TradeView Chain

## Overview
Long-term (stateful) orders use **GoodTilBlockTime** instead of GoodTilBlock. They persist across multiple blocks until the timestamp expires.

## Quick Test Commands

### Prerequisites
```bash
cd /data/data/v4-chain/protocol
```

### Calculate Expiration Time
```bash
# 1 hour from now
GTBT=$(($(date +%s) + 3600))
echo "GoodTilBlockTime: $GTBT"
```

### Alice: BUY Order
```bash
./build/tradeviewd tx clob place-order \
  tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy 0 123 35 1 1000000 100000 0 \
  --good-til-block-time "$GTBT" \
  --from alice --keyring-backend test --chain-id localtradeview \
  --fees "5000000000000000atvx,5000ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5" \
  --gas 200000 --broadcast-mode sync -y
```

### Bob: SELL Order
```bash
./build/tradeviewd tx clob place-order \
  tradeview10fx7sy6ywd5senxae9dwytf8jxek3t2g22s7jp 0 124 35 2 1000000 100000 0 \
  --good-til-block-time "$GTBT" \
  --from bob --keyring-backend test --chain-id localtradeview \
  --fees "5000000000000000atvx,5000ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5" \
  --gas 200000 --broadcast-mode sync -y
```

## Command Parameters Explained

| Parameter | Value | Description |
|-----------|-------|-------------|
| Address | `tradeview1...` | Subaccount owner address |
| Subaccount Number | `0` | Subaccount index |
| Client ID | `123`, `124` | Unique order identifier |
| CLOB Pair ID | `35` | Market pair (TEST-USD) |
| Side | `1` (BUY) / `2` (SELL) | Order side |
| Quantums | `1000000` | Order size |
| Subticks | `100000` | Price level |
| GoodTilBlock | `0` | **Must be 0 for long-term orders** |
| `--good-til-block-time` | `$GTBT` | Unix timestamp expiration |

## Key Differences: Short-Term vs Long-Term

| Feature | Short-Term | Long-Term |
|---------|------------|-----------|
| **Expiration Type** | Block height (GTB) | Unix timestamp (GTBT) |
| **Last Parameter** | Block number (e.g., `97281`) | `0` |
| **Flag** | None | `--good-til-block-time` |
| **Persistence** | Single block | Multiple blocks |
| **Storage** | MemClob only | State + MemClob |
| **gRPC Service** | `dydxprotocol.clob.Msg` | Standard tx flow |

## Verification

### Check Transaction Status
```bash
# Replace TXHASH with actual transaction hash
curl -s "http://localhost:26657/tx?hash=0xTXHASH" | jq '.result.tx_result'
```

### Query Subaccount Positions
```bash
# Alice's positions
curl -s "http://localhost:1317/dydxprotocol/subaccounts/subaccount/tradeview199tqg4wdlnu4qjlxchpd7seg454937hj39sxzy/0" | jq '.subaccount'

# Bob's positions
curl -s "http://localhost:1317/dydxprotocol/subaccounts/subaccount/tradeview10fx7sy6ywd5senxae9dwytf8jxek3t2g22s7jp/0" | jq '.subaccount'
```

## Troubleshooting

### Order Not Included
- Check if GTBT is in the future: `date +%s` (should be less than GTBT)
- Verify subaccount has sufficient collateral
- Check transaction logs for errors

### Insufficient Fees
If you get fee errors, try using only native token:
```bash
--fees "5000000000000000atvx"
```

## Full Test Script

Run the complete long-term order test:
```bash
bash /data/data/v4-chain/protocol/scripts/testing/quick/run_cli_tests.sh
```

## Notes
- Long-term orders work even if gRPC `Msg` service is unavailable
- They go through the standard mempool/consensus flow
- Client IDs must be unique per subaccount
- Orders expire automatically when GTBT is reached
