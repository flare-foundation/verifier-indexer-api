#!/usr/bin/env bash
# Start local postgres and restore chain snapshots.
#   ./test/setup-db.sh              # all chains
#   ./test/setup-db.sh xrp xrp2     # only the given chains
# Re-running is a no-op for chains that are already restored. To start clean,
# run ./test/teardown-db.sh first.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$HERE/e2e_tests/db"
DC="docker compose -f $DB_DIR/docker-compose.yaml"
SVC=postgres_testing_db

chain_info() {
  # dump_file db_name
  case $1 in
    btc)         echo db_btc_testnet  dbbtc          ;;
    btc2)        echo db_btc2_testnet dbbtc2         ;;
    doge)        echo db_doge_testnet dbdoge         ;;
    xrp)         echo db_xrp_testnet  dbxrp          ;;
    xrp2)        echo db_xrp2_testnet dbxrp2         ;;
    xrp_mainnet) echo db_xrp_mainnet  dbxrp_mainnet  ;;
    *) echo "unknown chain: $1" >&2; exit 1 ;;
  esac
}
ALL="btc btc2 doge xrp xrp2 xrp_mainnet"

restore() {
  read -r dump db <<<"$(chain_info "$1")"
  [ -f "$DB_DIR/$dump" ] || { echo "missing $dump — run ./test/download-snapshots.sh" >&2; exit 1; }
  if $DC exec -T $SVC psql -U user -d "$db" -Atc \
       "SELECT 1 FROM pg_tables WHERE schemaname='public' LIMIT 1" 2>/dev/null | grep -q 1; then
    echo "✓ $1 (already restored)"
    return
  fi
  echo "↻ $1 → $db"
  $DC exec -T $SVC createdb -U user "$db" 2>/dev/null || true
  $DC cp "$DB_DIR/$dump" "$SVC:/tmp/dump" >/dev/null
  $DC exec -T $SVC pg_restore --no-owner --role=user -U user -d "$db" /tmp/dump >/dev/null
}

$DC up -d >/dev/null
until $DC exec -T $SVC pg_isready -U user >/dev/null 2>&1; do sleep 1; done

for key in ${*:-$ALL}; do restore "$key"; done
