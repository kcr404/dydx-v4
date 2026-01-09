# dYdX v4 Advanced Features Testing Plan

## Current Status
- ✅ Chain running with 4 validators
- ✅ Stateful orders working
- ✅ Basic transactions confirmed

---

## Testing Roadmap

### Phase 1: Oracle & Price Feeds ⏳
- [ ] Verify Slinky oracle is running
- [ ] Check price updates
- [ ] Query market prices
- [ ] Test price smoothing

### Phase 2: Subaccounts & Margin
- [ ] Create multiple subaccounts
- [ ] Transfer between subaccounts
- [ ] Set leverage per perpetual
- [ ] Test collateralization checks

### Phase 3: Liquidations
- [ ] Check liquidation daemon status
- [ ] Query liquidation config
- [ ] Simulate undercollateralized position
- [ ] Test liquidation execution

### Phase 4: IBC Transfers
- [ ] Check IBC channels
- [ ] Query IBC clients
- [ ] Test IBC denom parsing
- [ ] Simulate IBC transfer (if relayer available)

### Phase 5: Bridge Testing
- [ ] Query bridge configuration
- [ ] Check bridge daemon logs
- [ ] Query Ethereum for events (if RPC available)
- [ ] Test bridge event acknowledgment

### Phase 6: Governance
- [ ] Submit parameter change proposal
- [ ] Vote on proposal
- [ ] Test proposal execution

### Phase 7: Advanced Trading
- [ ] Conditional orders
- [ ] TWAP orders
- [ ] Batch cancellations
- [ ] Order expiration

---

## Priority Order

1. **Oracle & Prices** (Critical for trading)
2. **Subaccounts & Margin** (Foundation for positions)
3. **Liquidations** (Risk management)
4. **Advanced Trading** (Full functionality)
5. **IBC** (Cross-chain, optional)
6. **Bridge** (Ethereum integration, optional)
7. **Governance** (Admin features)

---

## Next Steps

Starting with **Oracle & Price Feeds** testing...
