# Indexer Connected to Blockchain Service

## Configuration Changes

### ✅ Completed
1. **Removed Indexer's Kafka Service**
   - Removed the standalone Kafka container from docker-compose
   - Indexer now uses blockchain's Kafka service

2. **Updated Kafka Connection**
   - All services configured with: `KAFKA_BROKER_URLS=host.docker.internal:19093`
   - Services updated: ender, comlink, socks, vulcan, roundtable

3. **Tendermint Connection**
   - Comlink configured to connect to blockchain:
     - `TENDERMINT_WS_URL=ws://host.docker.internal:26657/websocket`
     - `TENDERMINT_RPC_URL=http://host.docker.internal:26657`

### Service Configuration

All indexer services now connect to:
- **Kafka**: `host.docker.internal:19093` (blockchain's Kafka)
- **Tendermint**: `host.docker.internal:26657` (blockchain's RPC/WebSocket)

### Current Status

**Infrastructure Services:**
- ✅ Postgres: Running on port 5435
- ✅ Redis: Running on port 6382

**Application Services:**
- ⚠️ Services configured but need debugging
- Check logs: `docker-compose -f docker-compose-local-deployment.yml logs <service>`

### Testing Connection

```bash
# Test Kafka connection from container
docker exec -it indexer_ender_1 sh -c "nc -zv host.docker.internal 19093"

# Test Tendermint connection
curl http://localhost:26657/status

# Test Indexer API (when services are running)
curl http://localhost:3002/v4/height
```

### Troubleshooting

If services fail to start:
1. Verify blockchain Kafka is accessible: `docker exec -it indexer_ender_1 ping host.docker.internal`
2. Check Kafka topics exist on blockchain service
3. Verify network connectivity between containers
4. Check service logs for specific errors
