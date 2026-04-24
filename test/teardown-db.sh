#!/usr/bin/env bash
# Stop the local postgres container and drop its volumes.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
docker compose -f "$REPO_ROOT/test/e2e_tests/db/docker-compose.yaml" down -v
