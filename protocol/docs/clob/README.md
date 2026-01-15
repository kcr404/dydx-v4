# CLOB (Central Limit Order Book) Documentation

This folder contains documentation for the dYdX v4 CLOB module - the heart of the matching engine.

## 📚 Contents

### Core CLOB Documentation
- **[CLOB_FIX_DOCUMENTATION.md](./CLOB_FIX_DOCUMENTATION.md)** - CLOB bug fixes and improvements
- **[MEMPOOL_AND_FIX_GUIDE.md](./MEMPOOL_AND_FIX_GUIDE.md)** - Mempool configuration and fixes

### Order Management
See the **[orders/](./orders/)** subfolder for order-specific documentation:
- Short-term order guides (gRPC, fixes, analysis)
- Order placement and execution
- Troubleshooting guides

### CLOB Study Materials
See the **[study/](./study/)** subfolder for comprehensive CLOB learning materials:
- **Day 1-4 Session Notes** - Deep dive into CLOB architecture
- **Architecture Diagrams** - Visual representations
- **Quick Reference** - Cheat sheet for CLOB concepts

## 🔑 Key Concepts

The CLOB module handles:
- **Order Matching**: Price-time priority matching engine
- **Order Types**: Short-term, long-term, conditional, TWAP
- **MemClob**: In-memory orderbook for high-performance matching
- **Operations Queue**: Deterministic consensus on matches

## 🔗 Related Documentation

- **Perpetuals**: [../perpetuals/](../perpetuals/) - Trading mechanics
- **Testing**: [../testing/](../testing/) - CLOB testing guides
- **Architecture**: [../architecture/](../architecture/) - Module architecture
