#!/bin/sh

NODES_FILE="/config/nodes.txt"
PEERING_PORT=8107
API_PORT=8108
DATA_DIR="/data"

MAX_WAIT=60
WAIT_INTERVAL=2
ELAPSED=0

# Sleep random between 10 and 20
RANDOM_SLEEP=$((10 + RANDOM % 11))

echo "[typesense-entrypoint] Waiting for $NODES_FILE..."

while [ ! -s "$NODES_FILE" ]; do
  if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
    echo "[typesense-entrypoint] Timeout waiting for nodes file."
    exit 1
  fi
  sleep $WAIT_INTERVAL
  ELAPSED=$((ELAPSED + WAIT_INTERVAL))
done

echo "[typesense-entrypoint] Found nodes file:"
cat "$NODES_FILE"

echo "Starting Typesense with:"
echo "  --data-dir=$DATA_DIR"
echo "  --nodes=$NODES_FILE"
echo "  --peering-port=$PEERING_PORT"
echo "  --api-port=$API_PORT"

exec /opt/typesense-server \
  --data-dir="$DATA_DIR" \
  --nodes="$NODES_FILE" \
  --peering-port="$PEERING_PORT" \
  --api-port="$API_PORT" \
  --api-key="$TYPESENSE_API_KEY" \
  --enable-cors
