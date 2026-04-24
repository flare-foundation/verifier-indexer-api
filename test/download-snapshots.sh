#!/usr/bin/env bash
# Download all e2e test snapshots and verify their SHA-256.
# Re-running skips files that already match their expected hash.
set -euo pipefail

BASE_URL="https://githubstatic.flare.center"
DB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/e2e_tests/db"
mkdir -p "$DB_DIR"

# name <TAB> sha256
SNAPSHOTS=(
  "db_btc_testnet	29f0845af2ffc894721849fdbb4eb648c62545632221cf3b5bc2642b8ab29a9a"
  "db_btc2_testnet	9bf89c182b6e9b286a5dd9e491f12c33be5052cd5110f9fc6c7bc3bf81f46158"
  "db_doge_testnet	af6cad36228747927a013db2d596fe57948a24586c737445c7bde420331cc86e"
  "db_xrp_testnet	cc86e2b2ab1ccc962e07b6b660e0fb749f8410a38a8b6b8bf008e06aa6001538"
  "db_xrp2_testnet	26a7d418e5c92029de61e2d2ef08765d59d8de93ff2dcfca72d0d5b72f0e58c4"
  "db_xrp_mainnet	9961210485a419246773b29c88de4b38fcbb6381e054b18c8718ec776ea47d10"
)

sha256() {
  if command -v sha256sum >/dev/null; then sha256sum "$1" | awk '{print $1}';
  else shasum -a 256 "$1" | awk '{print $1}'; fi
}

for entry in "${SNAPSHOTS[@]}"; do
  name="${entry%%	*}"
  want="${entry##*	}"
  out="$DB_DIR/$name"
  if [ -f "$out" ] && [ "$(sha256 "$out")" = "$want" ]; then
    echo "✓ $name (already present)"
    continue
  fi
  echo "↓ $name"
  curl -fSL "$BASE_URL/$name" -o "$out"
  got="$(sha256 "$out")"
  if [ "$got" != "$want" ]; then
    echo "✗ checksum mismatch for $name: want $want, got $got" >&2
    rm -f "$out"
    exit 1
  fi
  echo "✓ $name"
done
