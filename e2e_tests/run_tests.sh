#!/bin/bash

export DB_DATABASE=db
export DB_USERNAME=user
export DB_PASSWORD=pass
export DB_HOST=127.0.0.1
export DB_PORT=8080

export VERIFIER_TYPE=$2
export TESTNET=true

export NUMBER_OF_CONFIRMATIONS=6
export INDEXER_SERVER_PAGE_LIMIT=100

export PORT=3100
export API_KEYS=12345




wait_for_pg_ready() {
  until docker compose -f e2e_tests/db/docker-compose.yaml exec postgres_testing_db pg_isready -h 127.0.0.1 -p 5432 -U db 1> /dev/null; do
    sleep 1
  done
}


if [ "$1" = "all" ] || [ "$1" = "make_db" ]; then
  echo ""
  echo Making mock DB
  docker compose -f e2e_tests/db/docker-compose.yaml up -d
  wait_for_pg_ready 

  commands=(
    "docker compose -f e2e_tests/db/docker-compose.yaml cp e2e_tests/db/db_$2_testnet postgres_testing_db:/tmp/dbdump"
    "docker compose -f e2e_tests/db/docker-compose.yaml exec postgres_testing_db dropdb -U user db"
    "docker compose -f e2e_tests/db/docker-compose.yaml exec postgres_testing_db createdb -U user -E utf8 -T template0 db"
    "docker compose -f e2e_tests/db/docker-compose.yaml exec postgres_testing_db pg_restore --no-owner --role=user -U user --dbname=db /tmp/dbdump"
  )

  echo ""
  echo Copying db_$2_testnet to DB
  for command in "${commands[@]}"; do
    eval "$command"
    wait_for_pg_ready
  done
fi


if [ "$1" = "all" ] || [ "$1" = "run_tests" ]; then
  echo ""
  echo Runing $2 tests 
  mocha -r ts-node/register --require source-map-support/register "e2e_tests/$2/**/*.e2e-spec.ts"
fi


if [ "$1" = "all" ] || [ "$1" = "delete_db" ]; then
  echo ""
  echo Stoping and removing DB
  docker compose -f e2e_tests/db/docker-compose.yaml down 
fi


