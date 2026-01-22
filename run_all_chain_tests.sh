#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./run_all_chain_tests.sh [NODE_RPC] [KAFKA_BROKER]
# Defaults (from your message):
NODE_RPC="${1:-http://35.94.117.235:26657}"
KAFKA_BROKER="${2:-34.219.179.201:9092}"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LOGDIR="./test-runs/${TIMESTAMP}"
mkdir -p "${LOGDIR}"

echo "=== Test run started: ${TIMESTAMP} ===" | tee "${LOGDIR}/run.log"
echo "NODE_RPC=${NODE_RPC}" | tee -a "${LOGDIR}/run.log"
echo "KAFKA_BROKER=${KAFKA_BROKER}" | tee -a "${LOGDIR}/run.log"

# Helper
log() { echo "[$(date +%H:%M:%S)] $*"; }

# -----------------------
# 1) Basic chain health checks
# -----------------------
log "1) Checking Tendermint RPC health..."
{
  curl -s "${NODE_RPC}/status" | jq . > "${LOGDIR}/node_status.json" 2>"${LOGDIR}/node_status.err" || true
  curl -s "${NODE_RPC}/block" | jq . > "${LOGDIR}/node_block.json" 2>"${LOGDIR}/node_block.err" || true
  curl -s "${NODE_RPC}/abci_info" | jq . > "${LOGDIR}/abci_info.json" 2>"${LOGDIR}/abci_info.err" || true
} || true

if jq -e '.result.sync_info' "${LOGDIR}/node_status.json" >/dev/null 2>&1; then
  LATEST_HEIGHT=$(jq -r '.result.sync_info.latest_block_height' "${LOGDIR}/node_status.json")
  log "Node reachable, latest block: ${LATEST_HEIGHT}" | tee -a "${LOGDIR}/run.log"
else
  log "WARN: Could not parse node status. See ${LOGDIR}/node_status.err" | tee -a "${LOGDIR}/run.log"
fi

# -----------------------
# 2) Kafka basic checks
# -----------------------
log "2) Checking Kafka broker reachability (host:port)"
K_HOST="${KAFKA_BROKER%%:*}"
K_PORT="${KAFKA_BROKER##*:}"

if command -v nc >/dev/null 2>&1; then
  if nc -z -w5 "${K_HOST}" "${K_PORT}"; then
    log "Kafka port ${K_HOST}:${K_PORT} is reachable" | tee -a "${LOGDIR}/run.log"
  else
    log "WARN: Kafka ${K_HOST}:${K_PORT} not reachable by nc" | tee -a "${LOGDIR}/run.log"
  fi
else
  log "Note: nc not installed; skipping tcp test for Kafka" | tee -a "${LOGDIR}/run.log"
fi

# Try to sample a topic if a consumer is available
SAMPLE_TOPIC="v4_chain_events"
if command -v kcat >/dev/null 2>&1 || command -v kafkacat >/dev/null 2>&1; then
  CAT_CMD="$(command -v kcat || command -v kafkacat)"
  log "Sampling Kafka topic ${SAMPLE_TOPIC} with ${CAT_CMD}..."
  timeout 8 ${CAT_CMD} -C -b "${KAFKA_BROKER}" -t "${SAMPLE_TOPIC}" -o beginning -c 5 > "${LOGDIR}/kafka_sample.json" 2>"${LOGDIR}/kafka_sample.err" || true
elif command -v kafka-console-consumer.sh >/dev/null 2>&1; then
  log "Sampling Kafka with kafka-console-consumer.sh..."
  timeout 8 kafka-console-consumer.sh --bootstrap-server "${KAFKA_BROKER}" --topic "${SAMPLE_TOPIC}" --from-beginning --max-messages 5 > "${LOGDIR}/kafka_sample.json" 2>"${LOGDIR}/kafka_sample.err" || true
else
  log "No kafka consumer tool found (kcat/kafkacat/kafka-console-consumer.sh). To sample topics install kcat or use dockerized consumer." | tee -a "${LOGDIR}/run.log"
fi

# -----------------------
# 3) gRPC discovery (common ports)
# -----------------------
log "3) Attempting gRPC discovery on common ports (9090, 9091, 9092, 50051)..."
GRPC_PORTS=(9090 9091 50051)
for p in "${GRPC_PORTS[@]}"; do
  HOSTPORT="${NODE_RPC#http://}"
  HOSTPORT="${HOSTPORT%%/*}"
  # If node RPC host is an IP:port, use that host part for gRPC probe
  GRPCHOST="${HOSTPORT%%:*}"
  if command -v grpcurl >/dev/null 2>&1; then
    if nc -z -w3 "${GRPCHOST}" "${p}" >/dev/null 2>&1; then
      log "grpcurl: discovering services on ${GRPCHOST}:${p}..."
      grpcurl -plaintext "${GRPCHOST}:${p}" list > "${LOGDIR}/grpc_services_${p}.txt" 2>"${LOGDIR}/grpc_services_${p}.err" || true
    else
      log "No listener on ${GRPCHOST}:${p}"
    fi
  else
    log "grpcurl not found; to enable gRPC introspection install grpcurl" | tee -a "${LOGDIR}/run.log"
    break
  fi
done

# -----------------------
# 4) Discover test scripts in repo (patterns)
# -----------------------
log "4) Discovering test scripts (short/long/place-order/demo etc.)..."
SCRIPT_PATTERNS=( "*short*.sh" "*long*.sh" "*place-order*.sh" "*demo*.sh" "*test_short*.sh" "*test_long*.sh" "scripts/*.sh" )
FOUND_SCRIPTS=()
for pat in "${SCRIPT_PATTERNS[@]}"; do
  while IFS= read -r -d '' f; do
    FOUND_SCRIPTS+=("$f")
  done < <(find . -type f -name "${pat}" -print0 2>/dev/null || true)
done

# Also search files that mention "place-order" etc
while IFS= read -r -d '' f; do
  FOUND_SCRIPTS+=("$f")
done < <(rg --hidden --no-ignore -l -S "place-order|PlaceOrder|placeOrder|short-term|GoodTilBlock|memclob|demo_margin_trading" . 2>/dev/null || true | tr '\n' '\0')

# Deduplicate
IFS=$'\n' FOUND_SCRIPTS=($(printf "%s\n" "${FOUND_SCRIPTS[@]}" | awk '!x[$0]++' )) ; unset IFS

if [ "${#FOUND_SCRIPTS[@]}" -eq 0 ]; then
  log "No match for test script patterns. Listing top-level scripts directory if present..."
  ls -la ./scripts 2>"${LOGDIR}/scripts_ls.err" || true
else
  log "Found ${#FOUND_SCRIPTS[@]} candidate test files:" | tee -a "${LOGDIR}/run.log"
  printf '%s\n' "${FOUND_SCRIPTS[@]}" | tee "${LOGDIR}/found_scripts.txt"
fi

# -----------------------
# 5) Run each discovered shell script (safer execution)
# -----------------------
log "5) Running discovered scripts one-by-one with NODE_RPC and KAFKA_BROKER env injected..."
COUNTER=0
for s in "${FOUND_SCRIPTS[@]}"; do
  # sanity: only run .sh files
  case "$s" in
    *.sh)
      COUNTER=$((COUNTER+1))
      BASENAME="$(basename "$s")"
      OUTLOG="${LOGDIR}/${COUNTER}_${BASENAME}.log"
      ERRLOG="${LOGDIR}/${COUNTER}_${BASENAME}.err"
      log "Running [$COUNTER] $s -> ${OUTLOG}"
      # run with timeout to avoid stale hang (adjust 120s if needed)
      timeout 1200 env NODE_RPC="${NODE_RPC}" KAFKA_BROKER="${KAFKA_BROKER}" bash "$s" > >(tee "${OUTLOG}") 2> >(tee "${ERRLOG}" >&2) || {
        echo "script failed or timed out: $s (check ${OUTLOG} ${ERRLOG})" | tee -a "${LOGDIR}/run.log"
      }
      ;;
    *)
      log "Skipping non-shell file $s"
      ;;
  esac
done

# -----------------------
# 6) If node supports gRPC tests you have existing grpc scripts, run them
# -----------------------
log "6) Running gRPC-based test scripts if present (files named *grpc*.sh or *grpc*.py)"
while IFS= read -r -d '' f; do
  BASENAME="$(basename "$f")"
  OUTLOG="${LOGDIR}/grpc_${BASENAME}.log"
  ERRLOG="${LOGDIR}/grpc_${BASENAME}.err"
  log "Running gRPC test script $f"
  timeout 600 env NODE_RPC="${NODE_RPC}" KAFKA_BROKER="${KAFKA_BROKER}" bash "$f" > "${OUTLOG}" 2> "${ERRLOG}" || log "gRPC script $f failed; check ${OUTLOG} ${ERRLOG}"
done < <(find . -type f \( -iname '*grpc*.sh' -o -iname '*grpc*.py' -o -iname '*grpc*.js' \) -print0 2>/dev/null || true)

# -----------------------
# 7) Tail kafka for recent messages for a minute (if possible)
# -----------------------
if command -v kcat >/dev/null 2>&1 || command -v kafkacat >/dev/null 2>&1; then
  CAT_CMD="$(command -v kcat || command -v kafkacat)"
  log "Tailing Kafka topic ${SAMPLE_TOPIC} for 30s..."
  timeout 30 ${CAT_CMD} -C -b "${KAFKA_BROKER}" -t "${SAMPLE_TOPIC}" -o - -c 50 > "${LOGDIR}/kafka_tail.json" 2>"${LOGDIR}/kafka_tail.err" || true
elif command -v kafka-console-consumer.sh >/dev/null 2>&1; then
  timeout 30 kafka-console-consumer.sh --bootstrap-server "${KAFKA_BROKER}" --topic "${SAMPLE_TOPIC}" --from-beginning --max-messages 50 > "${LOGDIR}/kafka_tail.json" 2>"${LOGDIR}/kafka_tail.err" || true
else
  log "No kafka consumer available for tailing. Install kcat or use dockerized consumer" | tee -a "${LOGDIR}/run.log"
fi

# -----------------------
# 8) Summary
# -----------------------
log "=== Test run complete. Logs saved to ${LOGDIR} ==="
log "Files created:"
ls -la "${LOGDIR}" | sed -n '1,200p'
echo
log "Tips:"
echo " - Inspect ${LOGDIR}/found_scripts.txt to see what was executed."
echo " - Check each individual script log: ${LOGDIR}/*_*.log and *.err"
echo " - If a script failed, re-run it manually with NODE_RPC and KAFKA_BROKER exported to debug."
echo " - For deeper gRPC inspection, install grpcurl and re-run to discover services."

exit 0
