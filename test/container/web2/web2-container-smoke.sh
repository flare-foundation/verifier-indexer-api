#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker/verifier-web2/compose.yml}"
SERVICE_NAME="${SERVICE_NAME:-verifier_test}"
BASE_URL="${BASE_URL:-http://localhost:3003}"
API_KEY="${API_KEY:-123456}"

PAYLOAD='{
  "attestationType": "0x576562324a736f6e000000000000000000000000000000000000000000000000",
  "sourceId": "0x5075626c69635765623200000000000000000000000000000000000000000000",
  "requestBody": {
    "url": "https://jsonplaceholder.typicode.com/todos",
    "httpMethod": "GET",
    "headers": "{\"Content-Type\":\"application/json\"}",
    "queryParams": "{\"id\": 1}",
    "body": "",
    "postProcessJq": ".[0].title",
    "abiSignature": "{\"internalType\": \"string\",\"name\": \"title\",\"type\": \"string\"}"
  }
}'

attempts=10
delay=5
response_file="$(mktemp)"

cleanup() {
  rm -f "$response_file"
  docker compose -f "$COMPOSE_FILE" down
}

trap cleanup EXIT

docker compose -f "$COMPOSE_FILE" up -d --build "$SERVICE_NAME"

ready=0
for ((i = 1; i <= attempts; i++)); do
  echo "Attempt $i/$attempts: waiting for verifier..."
  http_code="$(
    curl -s -o "$response_file" -w "%{http_code}" \
      --connect-timeout 5 \
      --max-time 15 \
      -X POST "$BASE_URL/Web2Json/prepareResponse" \
      -H "Content-Type: application/json" \
      -H "X-API-KEY: $API_KEY" \
      -d "$PAYLOAD" || true
  )"

  if [[ "$http_code" == "200" ]] && grep -q '"status":"VALID"' "$response_file"; then
    ready=1
    break
  fi

  echo "Last HTTP code: ${http_code:-none}"
  sleep "$delay"
done

if [[ "$ready" -ne 1 ]]; then
  echo "Container smoke test failed: verifier did not return VALID response."
  cat "$response_file" || true
  exit 1
fi

echo "Container smoke test passed."
