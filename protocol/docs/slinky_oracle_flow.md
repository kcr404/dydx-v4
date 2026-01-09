# Slinky Oracle Flow in dYdX v4

## 🎯 Overview

**Slinky** is dYdX v4's oracle solution that provides decentralized, validator-sourced price feeds using **ABCI++ Vote Extensions**.

### Key Innovation
Instead of relying on external oracle networks, **validators themselves become the oracle** by:
1. Running a Slinky sidecar that fetches prices
2. Including prices in vote extensions
3. Aggregating prices on-chain via consensus

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    External Data Sources                     │
│  (CEXs, DEXs, APIs: Binance, Coinbase, Uniswap, Raydium)   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP/WebSocket
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Slinky Sidecar (per validator)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Price Providers:                                     │   │
│  │  • dydx_migration_api (reads from dYdX chain)        │   │
│  │  • Raydium API (Solana DEX)                          │   │
│  │  • UniswapV3 Base                                    │   │
│  │  • UniswapV3 Ethereum                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Aggregates prices → Sends to validator via gRPC (port 8080)│
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ gRPC
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Validator Node                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. ExtendVote (ABCI++)                              │   │
│  │     • Fetches prices from Slinky sidecar             │   │
│  │     • Creates OracleVoteExtension                    │   │
│  │     • Attaches to vote                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  2. VerifyVoteExtension (ABCI++)                     │   │
│  │     • Validates other validators' vote extensions    │   │
│  │     • Checks price sanity                            │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Consensus
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Proposer (Block Builder)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  3. PrepareProposal (ABCI++)                         │   │
│  │     • Aggregates vote extensions from all validators │   │
│  │     • Computes median/weighted average prices        │   │
│  │     • Creates MsgUpdateMarketPrices transaction      │   │
│  │     • Injects into block                             │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Block Proposal
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    All Validators                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4. ProcessProposal (ABCI++)                         │   │
│  │     • Validates MsgUpdateMarketPrices                │   │
│  │     • Checks prices match vote extensions            │   │
│  │     • Approves/rejects block                         │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Consensus
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    x/prices Module                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  5. BeginBlocker                                     │   │
│  │     • Executes MsgUpdateMarketPrices                 │   │
│  │     • Updates on-chain price state                   │   │
│  │     • Stores in x/prices keeper                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Price Storage:                                               │
│  • MarketPrice (id → price)                                  │
│  • CurrencyPair mapping (BTC-USD → id)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Detailed Flow (Step-by-Step)

### **Block N-1: Price Collection**

#### Step 1: Slinky Sidecar Fetches Prices

```
Slinky Sidecar (running alongside validator):
├─ Queries dydx_migration_api (http://dydxprotocold0:1317)
├─ Queries Raydium API (Solana DEX)
├─ Queries UniswapV3 Base
├─ Queries UniswapV3 Ethereum
└─ Aggregates prices for all currency pairs
   Example: BTC-USD = $45,000
```

**Configuration**: [`contrib/slinky/oracle.json`](file:///data/data/v4-chain/protocol/contrib/slinky/oracle.json)

```json
{
  "providers": {
    "dydx_migration_api": {
      "api": {
        "enabled": true,
        "interval": 10000000000,  // 10 seconds
        "endpoints": [
          {"url": "http://dydxprotocold0:1317"},
          {"url": "dydxprotocold0:9090"}
        ]
      }
    }
  }
}
```

---

#### Step 2: ExtendVote (ABCI++ Vote Extension)

Each validator extends their vote with oracle data:

```go
// From: app/vote_extensions/extend_vote_handler.go

func ExtendVoteHandler(ctx sdk.Context) ([]byte, error) {
    // 1. Fetch prices from Slinky sidecar (gRPC call to port 8080)
    prices := fetchPricesFromSlinky()
    
    // 2. Create OracleVoteExtension
    voteExtension := OracleVoteExtension{
        Prices: map[CurrencyPair]Price{
            "BTC-USD": {Price: 45000, BlockHeight: N-1},
            "ETH-USD": {Price: 3000, BlockHeight: N-1},
            // ... all currency pairs
        }
    }
    
    // 3. Encode and return
    return codec.Encode(voteExtension)
}
```

**Result**: Each validator's vote now includes their price observations.

---

#### Step 3: VerifyVoteExtension (Validation)

Validators verify each other's vote extensions:

```go
// From: app/app.go

func VerifyVoteExtensionHandler(ctx sdk.Context, req *abci.RequestVerifyVoteExtension) error {
    // 1. Decode vote extension
    voteExt := DecodeVoteExtension(req.VoteExtension)
    
    // 2. Sanity checks
    if !voteExt.IsValid() {
        return errors.New("invalid vote extension")
    }
    
    // 3. Price deviation check (optional)
    // Ensure prices aren't wildly different from our own
    
    return nil
}
```

---

### **Block N: Price Aggregation & Inclusion**

#### Step 4: PrepareProposal (Proposer Aggregates Prices)

The block proposer aggregates all vote extensions:

```go
// From: app/prepare/prices/slinky_price_update_generator.go

func GetValidMarketPriceUpdates(ctx sdk.Context, req *abci.RequestPrepareProposal) (*types.MsgUpdateMarketPrices, error) {
    // 1. Check if vote extensions are enabled
    if !VoteExtensionsEnabled(ctx) {
        return nil, nil  // Use legacy price daemon
    }
    
    // 2. Extract vote extensions from all validators
    voteExtensions := []OracleVoteExtension{}
    for _, vote := range req.LocalLastCommit.Votes {
        ve := DecodeVoteExtension(vote.VoteExtension)
        voteExtensions = append(voteExtensions, ve)
    }
    
    // 3. Aggregate prices (median/weighted average)
    aggregatedPrices := AggregatePrices(voteExtensions)
    
    // 4. Create price update transaction
    msg := &types.MsgUpdateMarketPrices{
        MarketPriceUpdates: []types.MarketPrice{
            {Id: 0, Price: 45000, Exponent: -8},  // BTC-USD
            {Id: 1, Price: 3000, Exponent: -8},   // ETH-USD
            // ... all markets
        }
    }
    
    return msg, nil
}
```

**Aggregation Strategy**:
- **Median**: Takes median price from all validators
- **Weighted by stake**: Validators with more stake have more influence
- **Outlier removal**: Removes extreme outliers

---

#### Step 5: ProcessProposal (Validators Verify)

All validators verify the proposed prices:

```go
// From: app/process/slinky_market_price_decoder.go

func ProcessProposal(ctx sdk.Context, req *abci.RequestProcessProposal) error {
    // 1. Extract MsgUpdateMarketPrices from block
    msg := ExtractPriceUpdate(req.Txs)
    
    // 2. Verify prices match vote extensions
    if VoteExtensionsEnabled(ctx) {
        expectedPrices := AggregatePrices(req.ProposedLastCommit.Votes)
        if !msg.Prices.Equals(expectedPrices) {
            return errors.New("price mismatch")
        }
    }
    
    // 3. Validate price updates
    if err := ValidatePriceUpdates(msg); err != nil {
        return err
    }
    
    return nil  // Accept block
}
```

---

#### Step 6: BeginBlocker (Update On-Chain State)

Prices are committed to state:

```go
// From: x/prices/keeper/keeper.go

func (k Keeper) UpdateMarketPrices(ctx sdk.Context, msg *types.MsgUpdateMarketPrices) error {
    for _, update := range msg.MarketPriceUpdates {
        // Store price in x/prices module
        k.SetMarketPrice(ctx, types.MarketPrice{
            Id:       update.Id,
            Price:    update.Price,
            Exponent: update.Exponent,
        })
        
        // Update currency pair mapping (for Slinky compatibility)
        cp := k.GetCurrencyPairFromID(ctx, update.Id)
        k.AddCurrencyPairIDToStore(ctx, update.Id, cp)
    }
    
    return nil
}
```

---

## 🔗 Integration with x/prices Module

### Slinky Adapter Layer

dYdX maintains compatibility between Slinky and x/prices:

```go
// From: x/prices/keeper/slinky_adapter.go

// Converts x/prices MarketPair (BTC-USD) to Slinky CurrencyPair
func MarketPairToCurrencyPair(marketPair string) (CurrencyPair, error) {
    split := strings.Split(marketPair, "-")
    return CurrencyPair{
        Base:  split[0],  // BTC
        Quote: split[1],  // USD
    }, nil
}

// Gets price for a currency pair from x/prices
func (k Keeper) GetPriceForCurrencyPair(ctx sdk.Context, cp CurrencyPair) (QuotePrice, error) {
    id := k.GetIDForCurrencyPair(ctx, cp)
    marketPrice := k.GetMarketPrice(ctx, id)
    return QuotePrice{Price: marketPrice.Price}, nil
}
```

---

## 📊 Data Flow Example

### Example: BTC-USD Price Update

```
Block N-1:
  Validator 1: BTC-USD = $45,000 (from Binance)
  Validator 2: BTC-USD = $45,010 (from Coinbase)
  Validator 3: BTC-USD = $44,995 (from Kraken)
  Validator 4: BTC-USD = $45,005 (from Uniswap)

Block N (Proposer = Validator 1):
  1. Aggregate: Median([45000, 45010, 44995, 45005]) = $45,002.50
  2. Create MsgUpdateMarketPrices:
     {
       market_price_updates: [{
         id: 0,
         price: 4500250000,  // $45,002.50 with 8 decimals
         exponent: -8
       }]
     }
  3. Include in block

Block N (All Validators):
  1. Verify: Recompute median, check it matches
  2. Accept block
  3. Update state: BTC-USD = $45,002.50
```

---

## 🎛️ Configuration

### Docker Compose (Slinky Sidecar)

```yaml
# From: docker-compose.yml

slinky0:
  image: ghcr.io/skip-mev/slinky-sidecar:v1.1.0
  entrypoint: >
    sh -c "slinky 
      --marketmap-provider dydx_migration_api 
      --oracle-config /etc/slinky/oracle.json 
      --log-std-out-level error"
  environment:
    - SLINKY_CONFIG_PROVIDERS_RAYDIUM_API_API_ENDPOINTS_0_URL=${RAYDIUM_URL}
    - SLINKY_CONFIG_PROVIDERS_UNISWAPV3_API-BASE_API_ENDPOINTS_0_URL=${UNISWAPV3_BASE_URL}
  ports:
    - "8080:8080"  # gRPC endpoint for validator
    - "8002:8002"  # Metrics
```

### Validator Connection

Validators connect to Slinky sidecar via gRPC on port 8080:

```
Validator → gRPC (localhost:8080) → Slinky Sidecar → External APIs
```

---

## ✅ Advantages of Slinky

| Feature | Benefit |
|---------|---------|
| **Decentralized** | No single oracle provider |
| **Validator-sourced** | Validators have skin in the game |
| **Low latency** | Prices updated every block (~1 second) |
| **Consensus-based** | Prices are agreed upon by 2/3+ validators |
| **Flexible** | Can add new price sources easily |
| **ABCI++ native** | Uses CometBFT vote extensions |

---

## 🔍 Querying Prices

### Check Current Prices

```bash
# Query specific market price
./build/dydxprotocold query prices show-market-price 0 --node http://localhost:26657

# List all market prices
./build/dydxprotocold query prices list-market-price --node http://localhost:26657

# Query via Slinky sidecar
curl http://localhost:8080/slinky/oracle/v1/prices
```

### Check Slinky Status

```bash
# Slinky metrics
curl http://localhost:8002/metrics

# Check if vote extensions are enabled
./build/dydxprotocold query consensus params --node http://localhost:26657 | grep vote_extensions
```

---

## 🎯 Key Takeaways

1. **Slinky = Validator-Sourced Oracle**
   - Each validator runs a Slinky sidecar
   - Fetches prices from multiple sources
   - Includes in vote extensions

2. **ABCI++ Vote Extensions**
   - ExtendVote: Attach prices to votes
   - VerifyVoteExtension: Validate others' prices
   - PrepareProposal: Aggregate prices
   - ProcessProposal: Verify aggregation

3. **Consensus-Based Pricing**
   - Median/weighted average of all validators
   - Requires 2/3+ validators to agree
   - Updated every block (~1 second)

4. **Integration with x/prices**
   - Slinky adapter layer converts types
   - Stores in x/prices module
   - Used by perpetuals, margin, liquidations

---

## 📚 References

- Slinky Config: [`contrib/slinky/oracle.json`](file:///data/data/v4-chain/protocol/contrib/slinky/oracle.json)
- Adapter: [`x/prices/keeper/slinky_adapter.go`](file:///data/data/v4-chain/protocol/x/prices/keeper/slinky_adapter.go)
- Vote Extensions: [`app/vote_extensions/`](file:///data/data/v4-chain/protocol/app/vote_extensions/)
- Price Updates: [`app/prepare/prices/slinky_price_update_generator.go`](file:///data/data/v4-chain/protocol/app/prepare/prices/slinky_price_update_generator.go)
- Docker Compose: [`docker-compose.yml:118-133`](file:///data/data/v4-chain/protocol/docker-compose.yml#L118-L133)

---

**Slinky enables dYdX v4 to have decentralized, low-latency, validator-sourced price feeds using cutting-edge ABCI++ vote extensions!** 🚀
