#!/bin/bash
set -e

CLUSTER_NAME=${CLUSTER_NAME:-typesense}
INSTANCE_ID=$(curl -s "$ECS_CONTAINER_METADATA_URI_V4/task" | jq -r '.TaskARN' | awk -F'/' '{print $NF}')
REGION=${AWS_REGION:-us-east-1}
NODES_FILE="/config/nodes.txt"
TTL_SECONDS=30
LOOP_INTERVAL=10

echo "Starting Typesense peer discovery sidecar..."
mkdir -p "$(dirname "$NODES_FILE")"

while true; do
  NOW=$(date +%s)
  IP=$(ip route get 1 | awk '{print $(NF-2); exit}')

  # Put/update current instance
  aws dynamodb put-item \
    --table-name typesense-peers \
    --region "$REGION" \
    --item "{\"cluster_name\": {\"S\": \"$CLUSTER_NAME\"}, \"instance_id\": {\"S\": \"$INSTANCE_ID\"}, \"ip\": {\"S\": \"$IP\"}, \"ttl\": {\"N\": \"$(($NOW + $TTL_SECONDS))\"}}" \
    >/dev/null

  # Query peers
  PEERS=$(aws dynamodb query \
    --table-name typesense-peers \
    --region "$REGION" \
    --key-condition-expression "cluster_name = :c" \
    --expression-attribute-values "{\":c\": {\"S\": \"$CLUSTER_NAME\"}}" \
    --query "Items[?to_number(ttl.N) > \`${NOW}\`].ip.S" \
    --output text | \
    tr '\t' '\n' | awk '{print $1 ":8107:8108"}' | paste -sd "," -)

  echo "$PEERS" > "$NODES_FILE"
  echo "$(date) - Updated nodes.txt: $PEERS"

  sleep "$LOOP_INTERVAL"
done
