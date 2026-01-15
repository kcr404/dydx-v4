# dYdX v4 Chain - Complete Testing & Validation Checklist

## Current Status
✅ **Completed**:
- 4 validator nodes running
- Stateful order transactions working

---

## Testing Roadmap

### Phase 1: Core Infrastructure ✅ (You are here)
- [x] Start 4 validator nodes
- [x] Verify chain is producing blocks
- [x] Submit stateful order transactions

### Phase 2: Order Book Functionality
Test all order types and matching logic

### Phase 3: Oracle & Price Feeds
Verify Slinky oracle integration

### Phase 4: Bridge & IBC
Test token deposits and cross-chain transfers

### Phase 5: Liquidations & Risk Management
Test margin system and liquidations

### Phase 6: Advanced Features
Test MEV protection, streaming, and indexer

---

## Detailed Testing Checklist

## 1. Basic Chain Operations

### 1.1 Node Health
```bash
# Check all nodes are running
docker ps | grep dydxprotocol

# Check sync status
curl -s http://localhost:26657/status | jq '.result.sync_info'

# Verify consensus (all nodes at same height)
for port in 26657 26660 26661 26662; do
  echo "Node on port $port:"
  curl -s http://localhost:$port/status | jq '.result.sync_info.latest_block_height'
done
```

**Expected**: All nodes at same block height, `catching_up: false`

- [ ] All 4 nodes running
- [ ] Nodes producing blocks (~1 second block time)
- [ ] No consensus failures in logs
- [ ] All validators signing blocks

---

### 1.2 Account Management
```bash
# List accounts
./build/dydxprotocold keys list --keyring-backend test

# Check balances
ALICE=$(./build/dydxprotocold keys show alice -a --keyring-backend test)
./build/dydxprotocold query bank balances $ALICE

# Create new account
./build/dydxprotocold keys add testuser --keyring-backend test

# Send tokens
./build/dydxprotocold tx bank send alice $TESTUSER 1000000000000000000adv4tnt \
  --keyring-backend test --chain-id localdydxprotocol -y
```

- [ ] Can list all test accounts (alice, bob, carl, dave)
- [ ] Can query account balances
- [ ] Can create new accounts
- [ ] Can send native tokens between accounts
- [ ] Transactions confirm in ~1 second

---

## 2. Order Book & Trading

### 2.1 Short-Term Orders
```bash
# Place short-term buy order
./build/dydxprotocold tx clob place-order \
  --subaccount-number 0 \
  --clob-pair-id 0 \
  --side BUY \
  --quantums 1000000 \
  --subticks 1000000000 \
  --good-til-block $(($(curl -s localhost:26657/status | jq -r '.result.sync_info.latest_block_height') + 20)) \
  --time-in-force IOC \
  --from alice --keyring-backend test --chain-id localdydxprotocol -y

# Place matching sell order
./build/dydxprotocold tx clob place-order \
  --subaccount-number 0 \
  --clob-pair-id 0 \
  --side SELL \
  --quantums 1000000 \
  --subticks 1000000000 \
  --good-til-block $(($(curl -s localhost:26657/status | jq -r '.result.sync_info.latest_block_height') + 20)) \
  --time-in-force IOC \
  --from bob --keyring-backend test --chain-id localdydxprotocol -y

# Query orderbook
./build/dydxprotocold query clob orderbook 0
```

- [ ] Can place short-term buy orders
- [ ] Can place short-term sell orders
- [ ] Orders match and fill
- [ ] Can query orderbook state
- [ ] Fills update subaccount balances
- [ ] Orders expire after good-til-block

---

### 2.2 Stateful Orders (Long-Term) ✅
```bash
# Place long-term order
./build/dydxprotocold tx clob place-order \
  --subaccount-number 0 \
  --clob-pair-id 0 \
  --side BUY \
  --quantums 1000000 \
  --subticks 1000000000 \
  --good-til-block-time $(($(date +%s) + 3600)) \
  --time-in-force GTT \
  --from alice --keyring-backend test --chain-id localdydxprotocol -y

# Cancel long-term order
./build/dydxprotocold tx clob cancel-order \
  --order-id <order-id> \
  --good-til-block-time $(($(date +%s) + 60)) \
  --from alice --keyring-backend test --chain-id localdydxprotocol -y

# Query stateful orders
./build/dydxprotocold query clob list-stateful-orders
```

- [x] Can place long-term orders (GTT)
- [ ] Can cancel long-term orders
- [ ] Orders persist across blocks
- [ ] Orders expire at good-til-block-time
- [ ] Can query all stateful orders

---

### 2.3 Conditional Orders
```bash
# Place conditional order (triggers when price hits level)
./build/dydxprotocold tx clob place-order \
  --subaccount-number 0 \
  --clob-pair-id 0 \
  --side BUY \
  --quantums 1000000 \
  --subticks 1000000000 \
  --good-til-block-time $(($(date +%s) + 3600)) \
  --time-in-force GTT \
  --conditional-order-trigger-subticks 950000000 \
  --from alice --keyring-backend test --chain-id localdydxprotocol -y
```

- [ ] Can place conditional orders
- [ ] Conditional orders trigger when price condition met
- [ ] Triggered orders execute correctly
- [ ] Can cancel conditional orders before trigger

---

### 2.4 Batch Operations
```bash
# Batch cancel multiple orders
./build/dydxprotocold tx clob batch-cancel \
  --subaccount-number 0 \
  --clob-pair-ids 0,1 \
  --from alice --keyring-backend test --chain-id localdydxprotocol -y
```

- [ ] Can batch cancel multiple orders
- [ ] Batch operations are atomic
- [ ] Failed cancels don't block successful ones

---

## 3. Subaccounts & Margin

### 3.1 Subaccount Management
```bash
# Query subaccount
./build/dydxprotocold query subaccounts get-subaccount alice 0

# Transfer between subaccounts
./build/dydxprotocold tx sending create-transfer \
  --from-subaccount-owner alice \
  --from-subaccount-number 0 \
  --to-subaccount-owner alice \
  --to-subaccount-number 1 \
  --asset-id 0 \
  --amount 1000000000 \
  --from alice --keyring-backend test --chain-id localdydxprotocol -y

# Deposit to subaccount
./build/dydxprotocold tx sending deposit-to-subaccount \
  --subaccount-owner alice \
  --subaccount-number 0 \
  --asset-id 0 \
  --quantums 1000000000 \
  --from alice --keyring-backend test --chain-id localdydxprotocol -y
```

- [ ] Can query subaccount state
- [ ] Can transfer between subaccounts
- [ ] Can deposit to subaccount from wallet
- [ ] Can withdraw from subaccount to wallet
- [ ] Collateralization checks work

---

### 3.2 Leverage & Margin
```bash
# Update leverage for perpetual
./build/dydxprotocold tx clob update-leverage \
  --subaccount-number 0 \
  --perpetual-id 0 \
  --leverage 5 \
  --from alice --keyring-backend test --chain-id localdydxprotocol -y

# Check margin requirements
./build/dydxprotocold query subaccounts get-collateralization alice 0
```

- [ ] Can set leverage per perpetual
- [ ] Margin requirements enforced
- [ ] Positions rejected if under-collateralized
- [ ] Can query collateralization ratio

---

## 4. Oracle & Prices

### 4.1 Slinky Oracle
```bash
# Check oracle prices
./build/dydxprotocold query prices list-market-price

# Query specific market price
./build/dydxprotocold query prices market-price 0

# Check oracle daemon is running
docker logs dydxprotocold0 2>&1 | grep -i slinky
```

- [ ] Oracle daemon is running
- [ ] Prices updating every block
- [ ] All markets have valid prices
- [ ] Price feeds from multiple sources
- [ ] Smoothed prices calculated correctly

---

### 4.2 Funding Rates
```bash
# Query funding rate
./build/dydxprotocold query perpetuals get-perpetual 0

# Check funding payments
./build/dydxprotocold query subaccounts get-subaccount alice 0 | jq '.perpetual_positions'
```

- [ ] Funding rates calculated
- [ ] Funding payments applied
- [ ] Premium/discount based on oracle price

---

## 5. Bridge & IBC

### 5.1 Ethereum Bridge
```bash
# Check bridge configuration
./build/dydxprotocold query bridge event-params

# Query bridge events (requires Ethereum RPC)
go run scripts/bridge_events/bridge_events.go \
  -rpc https://eth-sepolia.g.alchemy.com/v2/demo \
  -address 0xcca9D5f0a3c58b6f02BD0985fC7F9420EA24C1f0 \
  -toblock 7000000

# Check bridge module account
./build/dydxprotocold query auth module-account bridge
```

- [ ] Bridge daemon running
- [ ] Can query Ethereum for events
- [ ] Bridge module account exists
- [ ] Events acknowledged on-chain
- [ ] Tokens minted after delay

---

### 5.2 IBC Transfers
```bash
# Check IBC channels
./build/dydxprotocold query ibc channel channels

# Check IBC clients
./build/dydxprotocold query ibc client states

# Test IBC denom parsing
go test ./x/ratelimit/util/... -v -run TestParseDenom
```

- [ ] IBC module enabled
- [ ] Can query IBC channels
- [ ] IBC denom parsing works
- [ ] Rate limiting active
- [ ] Can receive IBC transfers (if relayer configured)

---

## 6. Liquidations & Deleveraging

### 6.1 Liquidation Daemon
```bash
# Check liquidation daemon logs
docker logs dydxprotocold0 2>&1 | grep -i liquidation

# Query liquidation config
./build/dydxprotocold query clob liquidations-config

# Create undercollateralized position (for testing)
# (Requires manipulating prices or positions)
```

- [ ] Liquidation daemon running
- [ ] Undercollateralized accounts detected
- [ ] Liquidation orders placed
- [ ] Insurance fund balance tracked

---

### 6.2 Deleveraging
```bash
# Check for deleveraging events
./build/dydxprotocold query clob list-stateful-orders | grep -i deleverage
```

- [ ] Deleveraging triggers when needed
- [ ] Positions reduced correctly
- [ ] Deleveraging events emitted

---

## 7. Governance

### 7.1 Proposals
```bash
# Submit parameter change proposal
./build/dydxprotocold tx gov submit-proposal \
  param-change proposal.json \
  --from alice --keyring-backend test --chain-id localdydxprotocol -y

# Vote on proposal
./build/dydxprotocold tx gov vote 1 yes \
  --from alice --keyring-backend test --chain-id localdydxprotocol -y

# Query proposal
./build/dydxprotocold query gov proposal 1
```

- [ ] Can submit proposals
- [ ] Can vote on proposals
- [ ] Proposals execute after passing
- [ ] Can update module parameters via governance

---

## 8. Indexer & Events

### 8.1 Indexer Events
```bash
# Check indexer is running
docker logs dydxprotocold0 2>&1 | grep -i indexer

# Query indexer database (if running)
# (Requires indexer service to be running)
```

- [ ] Indexer daemon running
- [ ] Events being sent to indexer
- [ ] Can query historical data
- [ ] Orderbook snapshots available

---

### 8.2 Full Node Streaming
```bash
# Check streaming configuration
./build/dydxprotocold query clob streaming-config

# Monitor streaming logs
docker logs dydxprotocold0 2>&1 | grep -i stream
```

- [ ] Streaming enabled (if configured)
- [ ] Orderbook updates streaming
- [ ] Subaccount updates streaming

---

## 9. MEV Protection

### 9.1 MEV Telemetry
```bash
# Check MEV metrics
curl -s http://localhost:26660/metrics | grep mev

# Query proposer operations
./build/dydxprotocold query clob list-operations
```

- [ ] MEV telemetry enabled
- [ ] Proposer operations tracked
- [ ] Skip-bid integration (if configured)

---

## 10. Performance & Stress Testing

### 10.1 Load Testing
```bash
# Run load test script
./scripts/load_test.sh

# Monitor block times
watch -n 1 'curl -s http://localhost:26657/status | jq .result.sync_info.latest_block_time'

# Check memory usage
docker stats
```

- [ ] Chain handles high transaction volume
- [ ] Block times remain consistent
- [ ] No memory leaks
- [ ] Consensus remains stable

---

### 10.2 Chaos Testing
```bash
# Stop a validator
docker stop dydxprotocold3

# Verify chain continues (3/4 validators)
curl -s http://localhost:26657/status | jq '.result.sync_info'

# Restart validator
docker start dydxprotocold3

# Verify it catches up
```

- [ ] Chain continues with 3/4 validators
- [ ] Stopped validator catches up on restart
- [ ] No data corruption
- [ ] Consensus recovers

---

## 11. Monitoring & Observability

### 11.1 Metrics
```bash
# Prometheus metrics
curl -s http://localhost:26660/metrics

# Key metrics to monitor:
# - tendermint_consensus_height
# - tendermint_consensus_validators
# - clob_orderbook_depth
# - subaccounts_collateralization
```

- [ ] Metrics endpoint accessible
- [ ] Key metrics being reported
- [ ] Grafana dashboards (if configured)

---

### 11.2 Logging
```bash
# View logs
docker logs -f dydxprotocold0

# Filter for errors
docker logs dydxprotocold0 2>&1 | grep -i error

# Check log levels
grep -i "log.*level" localnet/config/app.toml
```

- [ ] Logs are readable
- [ ] No unexpected errors
- [ ] Log levels appropriate
- [ ] Structured logging working

---

## Next Steps Recommendations

### Immediate (Next 1-2 days)
1. ✅ **Short-term orders** - Test IOC, POST_ONLY orders
2. ✅ **Order matching** - Verify fills and orderbook updates
3. ✅ **Subaccount transfers** - Test internal transfers
4. ✅ **Oracle prices** - Verify Slinky integration

### Short-term (Next week)
5. **Conditional orders** - Test trigger logic
6. **Liquidations** - Create test scenarios
7. **IBC transfers** - Set up relayer (optional)
8. **Bridge testing** - Query Ethereum events

### Medium-term (Next 2 weeks)
9. **Load testing** - Stress test with many orders
10. **Chaos testing** - Validator failures
11. **Indexer integration** - Set up indexer service
12. **Monitoring** - Set up Prometheus + Grafana

### Advanced (Future)
13. **MEV protection** - Test skip-bid integration
14. **Streaming** - Set up full node streaming
15. **Upgrades** - Test chain upgrades
16. **Multi-chain** - Connect to testnet

---

## Useful Scripts

### Quick Health Check
```bash
#!/bin/bash
# File: scripts/health_check.sh

echo "=== Chain Health Check ==="
echo ""

echo "1. Nodes running:"
docker ps | grep dydxprotocol | wc -l

echo ""
echo "2. Latest block:"
curl -s http://localhost:26657/status | jq -r '.result.sync_info.latest_block_height'

echo ""
echo "3. Validators:"
./build/dydxprotocold query tendermint-validator-set | jq '.validators | length'

echo ""
echo "4. Active orders:"
./build/dydxprotocold query clob list-stateful-orders | jq '.stateful_orders | length'

echo ""
echo "5. Oracle prices:"
./build/dydxprotocold query prices list-market-price | jq '.market_prices | length'
```

### Reset Chain
```bash
#!/bin/bash
# File: scripts/reset_chain.sh

echo "Stopping chain..."
make localnet-stop

echo "Cleaning data..."
rm -rf localnet/

echo "Starting fresh chain..."
make localnet-start

echo "Waiting for chain to start..."
sleep 10

echo "Chain reset complete!"
./scripts/health_check.sh
```

---

## Troubleshooting

### Chain won't start
```bash
# Check Docker
docker ps -a

# Check logs
docker logs dydxprotocold0

# Reset everything
make localnet-stop
rm -rf localnet/
make localnet-start
```

### Orders not matching
```bash
# Check MemClob is initialized
docker logs dydxprotocold0 2>&1 | grep "MemClob initialized"

# Verify orderbook
./build/dydxprotocold query clob orderbook 0

# Check collateralization
./build/dydxprotocold query subaccounts get-subaccount alice 0
```

### Oracle prices not updating
```bash
# Check Slinky sidecar
docker logs dydxprotocold0-slinky

# Verify price feeds
./build/dydxprotocold query prices list-market-price

# Check oracle config
cat localnet/config/app.toml | grep -A 10 oracle
```

---

## Success Criteria

You can consider your dYdX v4 chain "production-ready" when:

- ✅ All 4 validators running stably for 24+ hours
- ✅ All order types working (short-term, long-term, conditional)
- ✅ Oracle prices updating every block
- ✅ Liquidations executing correctly
- ✅ No consensus failures
- ✅ Indexer capturing all events
- ✅ Can handle 100+ orders per block
- ✅ Chaos testing passes (validator failures)
- ✅ Monitoring dashboards operational

---

## Resources

- [Testing Scripts](file:///data/data/v4-chain/protocol/scripts/)
- [Module Architecture Guide](file:///data/data/v4-chain/protocol/docs/module_architecture_guide.md)
- [Bridge Testing](file:///data/data/v4-chain/protocol/docs/testing_ibc_and_bridge.md)
- [Oracle Flow](file:///data/data/v4-chain/protocol/docs/slinky_oracle_flow.md)
- [IBC Analysis](file:///data/data/v4-chain/protocol/docs/relayer_and_ibc_analysis.md)
