# Utility Scripts

This folder contains utility scripts and tools for dYdX v4 protocol.

## 📁 Structure

### Protobuf (`protobuf/`)
Protocol buffer generation:
- `protocgen.sh` - Generate Go code from proto files
- `protoc-swagger-gen.sh` - Generate Swagger documentation

### Conversion (`conversion/`)
Address and data conversion utilities:
- `bech32_to_hex/` - Convert bech32 addresses to hex
- `hex_to_bech32/` - Convert hex addresses to bech32

### IAViewer (`iaviewer/`)
IAVL tree viewer for state inspection:
- `iaviewer.go` - Main viewer implementation
- `unmarshaller.go` - Data unmarshalling utilities

## 🚀 Usage

```bash
# Generate protobuf code
./utils/protobuf/protocgen.sh

# Convert address formats
cd utils/conversion/bech32_to_hex && go run bech32_to_hex.go <address>

# View IAVL tree
cd utils/iaviewer && go run *.go <db_path>
```

## 🔗 Related

- **Build**: `../build/` - Build scripts
- **Config**: `../config/` - Configuration files
