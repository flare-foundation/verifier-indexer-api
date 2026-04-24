#!/usr/bin/env bash
# Run the e2e suite.
#   ./test/run-e2e.sh              # all chains
#   ./test/run-e2e.sh xrp xrp2     # only the given chains
# Assumes ./test/setup-db.sh has been run.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOCHA="$REPO_ROOT/node_modules/.bin/mocha"

if [ $# -eq 0 ]; then
  CHAINS=(btc btc2 doge xrp xrp2 xrp_mainnet flr web2)
else
  CHAINS=("$@")
fi

for chain in "${CHAINS[@]}"; do
  echo ""
  echo "── chain: $chain ──────────────────────────────────────"
  "$MOCHA" "test/e2e_tests/$chain/**/*.e2e-spec.ts"
done
