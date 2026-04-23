#!/bin/bash

export DB_DATABASE=db
export DB_USERNAME=user
export DB_PASSWORD=pass
export DB_HOST=127.0.0.1
export DB_PORT=8080

export TESTNET=true

export NUMBER_OF_CONFIRMATIONS=6
export INDEXER_SERVER_PAGE_LIMIT=100

export PORT=3100
export API_KEYS=12345

_download_db_dumps() {
  BASE_DOWNLOAD_URL="https://githubstatic.flare.center"
  DB_DIR="test/e2e_tests/db"
  mkdir -p "$DB_DIR"

  echo "Downloading BTC Testnet Database..."
  curl -L -o "$DB_DIR/db_btc_testnet" $BASE_DOWNLOAD_URL/db_btc_testnet

  echo "Downloading BTC2 Testnet Database..."
  curl -L -o "$DB_DIR/db_btc2_testnet" $BASE_DOWNLOAD_URL/db_btc2_testnet

  echo "Downloading DOGE Testnet Database..."
  curl -L -o "$DB_DIR/db_doge_testnet" $BASE_DOWNLOAD_URL/db_doge_testnet

  echo "Downloading XRP Testnet Database..."
  curl -L -o "$DB_DIR/db_xrp_testnet" $BASE_DOWNLOAD_URL/db_xrp_testnet

  echo "Downloading XRP2 Testnet Database..."
  curl -L -o "$DB_DIR/db_xrp2_testnet" $BASE_DOWNLOAD_URL/db_xrp2_testnet

  echo "Downloading XRP Mainnet Database..."
  curl -L -o "$DB_DIR/db_xrp_mainnet" $BASE_DOWNLOAD_URL/db_xrp_mainnet

  echo "All testnet database dumps downloaded"
}

_wait_for_pg_ready() {
  until $DOCKER_CMD pg_isready -h $DB_HOST -p 5432 1> /dev/null; do
    sleep 1
  done
}

_patch_xrp_transactions_schema() {
  DB_NAME=$1

  $DOCKER_CMD psql -h $DB_HOST -U user -d "$DB_NAME" -v ON_ERROR_STOP=1 -c "
    ALTER TABLE transactions
      ADD COLUMN IF NOT EXISTS sequence bigint DEFAULT 0,
      ADD COLUMN IF NOT EXISTS ticket_sequence bigint DEFAULT 0,
      ADD COLUMN IF NOT EXISTS source_address varchar(64) DEFAULT '',
      ADD COLUMN IF NOT EXISTS first_memo_data_hash varchar(64) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS destination_tag integer DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS transaction_status boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS intended_receiving_amount bigint DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS destination_address_hash varchar(64) DEFAULT NULL;
    CREATE INDEX IF NOT EXISTS idx_source_sequence ON transactions (source_address, sequence);
    CREATE INDEX IF NOT EXISTS transactions_first_memo_data_hash_idx ON transactions (first_memo_data_hash);
    CREATE INDEX IF NOT EXISTS transactions_destination_tag_idx ON transactions (destination_tag);
    CREATE INDEX IF NOT EXISTS transactions_transaction_status_idx ON transactions (transaction_status);
    CREATE INDEX IF NOT EXISTS idx_payref_block ON transactions (payment_reference, block_number, intended_receiving_amount);
    CREATE INDEX IF NOT EXISTS idx_dest_block ON transactions (destination_address_hash, block_number, intended_receiving_amount);
  "
  _wait_for_pg_ready
}

_make_db(){
  VERIFIER_TYPE=$1

  if $DOCKER_CMD psql -h $DB_HOST -U user -lqt | cut -d "|" -f 1 | tr -d ' ' | grep -qw "^db${VERIFIER_TYPE}$"; then
    $DOCKER_CMD dropdb -h $DB_HOST -U user "db${VERIFIER_TYPE}"
    _wait_for_pg_ready
  fi

  $DOCKER_CMD createdb -h $DB_HOST -U user -E utf8 -T template0 "db${VERIFIER_TYPE}"
  _wait_for_pg_ready
  $DOCKER_CMD pg_restore -h $DB_HOST --no-owner --role=user -U user --dbname="db${VERIFIER_TYPE}" "/tmp/dbdump${VERIFIER_TYPE}"
  _wait_for_pg_ready

  if [ "$VERIFIER_TYPE" == "xrp" ] || [ "$VERIFIER_TYPE" == "xrp2" ]; then
    _patch_xrp_transactions_schema "db${VERIFIER_TYPE}"
  fi

  _wait_for_pg_ready
}

make_db(){
  VERIFIER_TYPE=$1
  DOCKER_CMD="docker compose -f test/e2e_tests/db/docker-compose.yaml exec postgres_testing_db"

  echo ""
  echo Making mock DB for $VERIFIER_TYPE

  docker compose -f test/e2e_tests/db/docker-compose.yaml up -d
  _wait_for_pg_ready

  if [ "$VERIFIER_TYPE" == "all" ]; then
    docker compose -f test/e2e_tests/db/docker-compose.yaml cp test/e2e_tests/db/db_btc_testnet postgres_testing_db:/tmp/dbdumpbtc
    docker compose -f test/e2e_tests/db/docker-compose.yaml cp test/e2e_tests/db/db_btc2_testnet postgres_testing_db:/tmp/dbdumpbtc2
    docker compose -f test/e2e_tests/db/docker-compose.yaml cp test/e2e_tests/db/db_doge_testnet postgres_testing_db:/tmp/dbdumpdoge
    docker compose -f test/e2e_tests/db/docker-compose.yaml cp test/e2e_tests/db/db_xrp_testnet postgres_testing_db:/tmp/dbdumpxrp
    docker compose -f test/e2e_tests/db/docker-compose.yaml cp test/e2e_tests/db/db_xrp2_testnet postgres_testing_db:/tmp/dbdumpxrp2
    docker compose -f test/e2e_tests/db/docker-compose.yaml cp test/e2e_tests/db/db_xrp_mainnet postgres_testing_db:/tmp/dbdumpxrp_mainnet
    _wait_for_pg_ready

    _make_db btc
    _make_db btc2
    _make_db doge
    _make_db xrp
    _make_db xrp2
    _make_db xrp_mainnet
  else
    DUMP_NAME="db_${VERIFIER_TYPE}_testnet"
    if [ "$VERIFIER_TYPE" == "xrp_mainnet" ]; then
      DUMP_NAME="db_${VERIFIER_TYPE}"
    fi

    docker compose -f test/e2e_tests/db/docker-compose.yaml cp test/e2e_tests/db/${DUMP_NAME} postgres_testing_db:/tmp/dbdump
    _wait_for_pg_ready

    _make_db ""

    if [ "$VERIFIER_TYPE" == "xrp" ] || [ "$VERIFIER_TYPE" == "xrp2" ]; then
      _patch_xrp_transactions_schema "db"
    fi
  fi
}

_make_db_ci(){
  export DB_HOST=postgres
  export DB_PORT=5432
  DOCKER_CMD=""

  echo ""
  echo Copying dumb to DB

  cp test/e2e_tests/db/db_btc_testnet /tmp/dbdumpbtc
  cp test/e2e_tests/db/db_btc2_testnet /tmp/dbdumpbtc2
  cp test/e2e_tests/db/db_doge_testnet /tmp/dbdumpdoge
  cp test/e2e_tests/db/db_xrp_testnet /tmp/dbdumpxrp
  cp test/e2e_tests/db/db_xrp2_testnet /tmp/dbdumpxrp2
  cp test/e2e_tests/db/db_xrp_mainnet /tmp/dbdumpxrp_mainnet

  _make_db btc
  _make_db btc2
  _make_db doge
  _make_db xrp
  _make_db xrp2
  _make_db xrp_mainnet
}

_run_all_tests(){
  export RUNNING_ALL_TESTS=true

  echo ""

  if [ "$1" == "coverage" ]; then
    echo "Running all tests with coverage"
    pnpm exec nyc --reporter=html --reporter=text --reporter=text-summary --report-dir=coverage mocha --reporter spec --full-trace --colors --timeout 5000 --require source-map-support/register --require ts-node/register --recursive 'test/**/*/*.{e2e-spec.ts,unit.ts}'
  else
    echo "Running all tests"
    pnpm exec mocha --reporter spec --full-trace --colors --timeout 5000 --require source-map-support/register --require ts-node/register --recursive 'test/**/*/*.{e2e-spec.ts,unit.ts}'
  fi
}

delete_db(){
  echo ""
  echo Stopping and removing DB
  docker compose -f test/e2e_tests/db/docker-compose.yaml down
}

show_help() {
  echo "
Usage: pnpm test COMMAND ARGUMENT

Commands:
  run               Run tests (create DBs for all verifier types, run tests, delete DBs)
  coverage          Run tests with coverage (create DBs for all verifier types, run tests with coverage, delete DBs)
  make_db <type>    Create mock DB for a verifier type, <type> can be 'btc', 'doge' or 'xrp'.
  delete_db         Delete mock DB
  download          Download all DB dumps
  smoke_web2        Run Docker container smoke test for Web2 verifier
  smoke_evm         Run Docker container smoke test for EVM verifier (ETH/FLR/SGB)
"
}

main() {
  if [ $# -eq 0 ]; then
    show_help
    exit 1
  fi

  CMD="$1"
  shift
  case "$CMD" in
  run)
    make_db all
    _run_all_tests
    delete_db
    ;;
  coverage)
    make_db all
    _run_all_tests coverage
    delete_db
    ;;
  make_db)
    make_db "$@"
    ;;
  delete_db)
    delete_db
    ;;
  ci)
    _make_db_ci &&
    _run_all_tests
    ;;
  smoke_web2)
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    bash "$SCRIPT_DIR/container/web2/web2-container-smoke.sh"
    ;;
  smoke_evm)
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    bash "$SCRIPT_DIR/container/evm/evm-container-smoke.sh"
    ;;
  download)
    _download_db_dumps
    ;;
  *)
    show_help
    ;;
  esac
}

main "$@"
