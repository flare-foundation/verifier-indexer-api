#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker/verifier-evm/compose.yml}"
SERVICE_NAME="${SERVICE_NAME:-verifier_eth}"
BASE_URL="${BASE_URL:-http://localhost:3004}"
API_KEY="${API_KEY:-123456}"

ATTESTATION_TYPE="0x45564d5472616e73616374696f6e000000000000000000000000000000000000"
ETH_SOURCE_ID="0x4554480000000000000000000000000000000000000000000000000000000000"

TX_HASH_ETH="${TX_HASH_ETH:-0x53f3e65d83b119a38bc335cd1461190adfcc2bcb734a11991f96cbe276ec1f82}"

attempts=20
delay=5
response_file="$(mktemp)"

cleanup() {
  rm -f "$response_file"
  docker compose -f "$COMPOSE_FILE" down
}

trap cleanup EXIT

payload() {
  local source_id="$1"
  local tx_hash="$2"
  cat <<JSON
{
  "attestationType": "$ATTESTATION_TYPE",
  "sourceId": "$source_id",
  "requestBody": {
    "transactionHash": "$tx_hash",
    "requiredConfirmations": "1",
    "provideInput": false,
    "listEvents": true,
    "logIndices": []
  }
}
JSON
}

run_chain_test() {
  local chain="$1"
  local source_id="$2"
  local tx_hash="$3"

  local payload_body
  payload_body="$(payload "$source_id" "$tx_hash")"

  local http_code
  http_code="$(
    curl -s -o "$response_file" -w "%{http_code}" \
      --connect-timeout 5 \
      --max-time 20 \
      -X POST "$BASE_URL/EVMTransaction/prepareResponse" \
      -H "Content-Type: application/json" \
      -H "X-API-KEY: $API_KEY" \
      -d "$payload_body" || true
  )"

  if [[ "$http_code" != "200" ]]; then
    echo "$chain smoke test failed: expected HTTP 200, got $http_code"
    cat "$response_file" || true
    return 1
  fi

  if ! grep -q '"status":"VALID"' "$response_file"; then
    echo "$chain smoke test failed: expected status VALID"
    cat "$response_file" || true
    return 1
  fi

  echo "$chain smoke test passed: $(cat "$response_file")"
}

run_chain_health_test() {
  local chain="$1"

  local http_code
  http_code="$(
    curl -s -o "$response_file" -w "%{http_code}" \
      --connect-timeout 5 \
      --max-time 15 \
      "$BASE_URL/api/health" || true
  )"

  if [[ "$http_code" != "200" ]]; then
    echo "$chain health smoke test failed: expected HTTP 200, got $http_code"
    cat "$response_file" || true
    return 1
  fi

  if ! grep -q '^true$' "$response_file"; then
    echo "$chain health smoke test failed: expected body true"
    cat "$response_file" || true
    return 1
  fi

  echo "$chain health smoke test passed: $(cat "$response_file")"
}

docker compose -f "$COMPOSE_FILE" up -d --build "$SERVICE_NAME"

ready=0
for ((i = 1; i <= attempts; i++)); do
  echo "Attempt $i/$attempts: waiting for EVM verifier to become ready..."
  if run_chain_test "ETH" "$ETH_SOURCE_ID" "$TX_HASH_ETH"; then
    ready=1
    break
  fi
  sleep "$delay"
done

if [[ "$ready" -ne 1 ]]; then
  echo "Container smoke test failed: EVM verifier did not become ready."
  exit 1
fi

run_chain_health_test "eth"

echo "EVM container smoke test passed for ETH including health checks."
