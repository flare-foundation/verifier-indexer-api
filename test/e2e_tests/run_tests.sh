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


_wait_for_pg_ready() {
  until $DOCKER_CMD pg_isready -h $DB_HOST -p 5432 1> /dev/null; do
    sleep 1
  done
}

_make_db(){
  VERIFIER_TYPE=$1

  if $DOCKER_CMD psql -h $DB_HOST -U user -lqt | cut -d "|" -f 1 | tr -d ' ' | grep -qw "^db${VERIFIER_TYPE}$"; then
    $DOCKER_CMD dropdb -h $DB_HOST -U user db${VERIFIER_TYPE} 
    _wait_for_pg_ready 
  fi

  $DOCKER_CMD createdb -h $DB_HOST -U user -E utf8 -T template0 db${VERIFIER_TYPE} 
  _wait_for_pg_ready 
  $DOCKER_CMD pg_restore -h $DB_HOST --no-owner --role=user -U user --dbname=db${VERIFIER_TYPE} /tmp/dbdump${VERIFIER_TYPE}
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
    _wait_for_pg_ready 

    _make_db btc
    _make_db btc2
    _make_db doge
    _make_db xrp
  else
    docker compose -f test/e2e_tests/db/docker-compose.yaml cp test/e2e_tests/db/db_${VERIFIER_TYPE}_testnet postgres_testing_db:/tmp/dbdump
    _wait_for_pg_ready 

    _make_db ""
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
  
  _make_db btc
  _make_db btc2
  _make_db doge
  _make_db xrp
}

_run_all_tests(){
  export RUNNING_ALL_TESTS=true

  echo ""

  if [ "$1" == "coverage" ]; then
    echo Running all tests with coverage
    nyc mocha -r ts-node/register --require source-map-support/register "test/e2e_tests/**/*.e2e-spec.ts"
  else
    echo Running all tests
    mocha -r ts-node/register --require source-map-support/register "test/e2e_tests/**/*.e2e-spec.ts"
  fi
}

delete_db(){
  echo ""
  echo Stopping and removing DB
  docker compose -f test/e2e_tests/db/docker-compose.yaml down 
}

show_help() {
  echo "
Usage: yarn test COMMAND ARGUMENT

Commands:
  run               Run e2e tests (create DBs for all verifier types, run tests, delete DBs)   
  coverage          Run e2e tests with coverage (create DBs for all verifier types, run tests with coverage, delete DBs)
  make_db <type>    Create mock DB for a verifier type, <type> can be 'btc', 'doge' or 'xrp'.
  delete_db         Delete mock DB                            
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
  *)
    show_help
    ;;
  esac
}

main "$@"

                                                   