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




wait_for_pg_ready() {
  until $DOCKER_CMD pg_isready -h $DB_HOST -p 5432 -U db 1> /dev/null; do
    sleep 1
  done
}

_make_db(){
  $DOCKER_CMD dropdb -h $DB_HOST -U user db 
  wait_for_pg_ready 
  $DOCKER_CMD createdb -h $DB_HOST -U user -E utf8 -T template0 db 
  wait_for_pg_ready 
  $DOCKER_CMD pg_restore -h $DB_HOST --no-owner --role=user -U user --dbname=db /tmp/dbdump 
  wait_for_pg_ready 
}

make_db(){
  export VERIFIER_TYPE=$1
  DOCKER_CMD="docker compose -f test/e2e_tests/db/docker-compose.yaml exec postgres_testing_db"

  echo ""
  echo Making mock DB for $VERIFIER_TYPE
  
  docker compose -f test/e2e_tests/db/docker-compose.yaml up -d
  wait_for_pg_ready 
  docker compose -f test/e2e_tests/db/docker-compose.yaml cp test/e2e_tests/db/db_${VERIFIER_TYPE}_testnet postgres_testing_db:/tmp/dbdump
  echo "Copying dump to DB"
  wait_for_pg_ready 
  
  _make_db
}

make_db_ci(){
  export VERIFIER_TYPE=$1
  export DB_HOST=postgres
  export DB_PORT=5432
  DOCKER_CMD=""
  
  echo ""
  echo Copying dumb to DB

  cp test/e2e_tests/db/db_${VERIFIER_TYPE}_testnet /tmp/dbdump
  
  _make_db
}

run_tests(){
  export VERIFIER_TYPE=$1
  echo ""
  echo Runing $VERIFIER_TYPE tests 
  mocha -r ts-node/register --require source-map-support/register "test/e2e_tests/${VERIFIER_TYPE}/**/*.e2e-spec.ts"
}

delete_db(){
  echo ""
  echo Stoping and removing DB
  docker compose -f test/e2e_tests/db/docker-compose.yaml down 
}

show_help() {
  echo "
Usage: yarn test COMMAND ARGUMENT

Commands:
  run          Run e2e tests (create db, run tests, delete db)    (needs verifier type as argument, e.g. yarn test run btc)         
  make_db      Create mock DB                                     (needs verifier type as argument, e.g. yarn test make_db btc)
  run_tests    Run e2e tests (existing db needed)                 (needs verifier type as argument, e.g. yarn test run_tests btc)
  delete_db    Delete mock DB                      
  ci           Run tests in gitlab ci     

Arguments:
  btc          Bitcoin verifier
  doge         Dogecoin verifier
  xrp          Ripple verifier                             
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
  # TODO:(andraz) add validtion (only one argument)
  if [ "$@" = "web2" ]; then
    run_tests "$@"
  else
    make_db "$@"
    run_tests "$@"
    delete_db 
  fi
    ;;
  make_db)
    make_db "$@"
    ;;
  run_tests)
    run_tests "$@"
    ;;
  delete_db)
    delete_db
    ;;
  ci)
  # TODO:(andraz) can be improved that it doesn't crash at first error but runs all tests
    make_db_ci btc &&
    run_tests btc &&
    make_db_ci doge &&
    run_tests doge &&
    make_db_ci xrp &&
    run_tests xrp &&
    run_tests web2
    ;;
  *)
    show_help
    ;;
  esac
}

main "$@"

