# Debugging Tools

This folder contains debugging utilities for dYdX v4 protocol.

## 📁 Structure

### CLOB Debugging (`clob/`)
CLOB-specific debugging tools:
- `debug-clob-inclusion.sh` - Debug CLOB order inclusion issues
- `SHORT_TERM_DEBUG_GUIDE.md` - Guide for debugging short-term orders

### General Tools (`tools/`)
General-purpose debugging utilities:
- `Makefile` - Build debugging tools
- `README.md` - Tool documentation
- `deserialize_proto.go` - Deserialize protobuf messages
- `events.json` - Sample event data

## 🚀 Usage

```bash
# Debug CLOB inclusion
./debugging/clob/debug-clob-inclusion.sh

# Build debugging tools
cd debugging/tools && make

# Deserialize protobuf
cd debugging/tools && go run deserialize_proto.go <proto_data>
```

## 🔗 Related

- **Testing**: `../testing/` - Test scripts
- **Chain**: `../chain/` - Chain management
