#!/bin/bash

./scripts/genesis/prod_pregenesis.sh tradeviewd
cp /tmp/prod-chain/.tradeview/config/sorted_genesis.json ./scripts/genesis/sample_pregenesis.json
