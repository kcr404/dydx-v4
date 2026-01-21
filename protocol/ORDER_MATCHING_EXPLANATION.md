# Order Matching in the dYdX v4 Chain Protocol

## Overview

The dYdX v4 chain implements a central limit order book (CLOB) with price-time priority matching. The matching engine operates in memory (memclob) for fast execution and maintains consistency with on-chain state.

## Core Components

### 1. Order Types

- **Short-Term Orders**: Stored only in memclob, expire at a specific block height
- **Stateful Orders**: Long-term and conditional orders stored in blockchain state
- **Liquidation Orders**: Special orders for deleveraging undercollateralized positions

### 2. Data Structures

- **Orderbook**: Maintains separate bid/ask maps indexed by price levels (subticks)
- **Level**: Represents a price level containing a doubly-linked list of orders
- **LevelOrder**: Individual order within a price level with pointers to previous/next orders

## Matching Process

### 1. Order Placement Flow

When a new order is placed via [`PlaceOrder`](x/clob/memclob/memclob.go:458), the following steps occur:

1. **Validation**: Order is validated against memclob state ([`validateNewOrder`](x/clob/memclob/memclob.go:1379))
2. **Matching**: Attempt to match against opposite side of orderbook ([`matchOrder`](x/clob/memclob/memclob.go:755))
3. **Post-Matching Actions**:
   - If fully matched, update state and return
   - If partially filled and remaining size > 0, add to orderbook
   - If post-only and crosses book, cancel the order

### 2. Matching Algorithm

The core matching logic is in [`mustPerformTakerOrderMatching`](x/clob/memclob/memclob.go:1535):

1. **Find Best Counterparty Order**: Get the best order on opposite side of book
2. **Check Cross Condition**: Verify if taker price crosses maker price
3. **Match Validation**:
   - Self-trade prevention
   - Collateralization checks via [`ProcessSingleMatch`](x/clob/keeper/process_single_match.go:44)
   - Reduce-only order validation
4. **Execute Match**:
   - Calculate fill amount (minimum of taker/maker remaining sizes)
   - Update subaccount balances and perpetual positions
   - Record fill amounts in state
5. **Continue Matching**: Repeat until taker order is fully filled or no more crossing orders exist

### 3. Price-Time Priority

Orders are matched based on:

- **Price Priority**: Higher bids/lower asks get priority
- **Time Priority**: Earlier placed orders at same price level get priority
- Implementation uses doubly-linked lists to maintain insertion order within price levels

### 4. Match Processing

Each match is processed through [`ProcessSingleMatch`](x/clob/keeper/process_single_match.go:44):

1. **Validation**: Cross-checks orders and fill amounts
2. **Fee Calculation**: Compute taker/maker fees based on fee tiers
3. **Subaccount Updates**: Adjust balances and perpetual positions
4. **State Persistence**: Update fill amounts and pruning information
5. **Event Emission**: Emit match events for indexing

## Special Cases

### Post-Only Orders

- Will not match immediately when placed
- If they would cross the book, they are cancelled
- Implemented in [`mustPerformTakerOrderMatching`](x/clob/memclob/memclob.go:1821)

### Reduce-Only Orders

- Can only reduce existing position size
- Resized during matching if they would flip position side
- Cancelled entirely if position flips during matching loop

### Liquidation Orders

- Match against the orderbook with special handling
- No taker fees charged
- Insurance fund payments processed
- Special collateralization checks

## Key Features

### 1. Optimistic Matching

- Matches are processed optimistically in CheckTx
- State changes are cached and only committed if validation passes
- Allows for high throughput while maintaining correctness

### 2. Collateralization Checks

- Real-time balance validation during matching
- Failed matches result in order removal
- Liquidation-specific limits prevent excessive losses

### 3. Order Replacement

- Existing orders can be replaced with new versions
- Must have same OrderId with higher GTB/GTT
- Properly handles replacement during matching loops

This matching engine provides high-performance order matching while ensuring on-chain consistency and proper risk management.
