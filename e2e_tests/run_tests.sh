#!/bin/bash

# Function to wait until PostgreSQL is ready
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
    "docker compose -f e2e_tests/db/docker-compose.yaml cp e2e_tests/db/db postgres_testing_db:/tmp/dbdump"
    "docker compose -f e2e_tests/db/docker-compose.yaml exec postgres_testing_db dropdb -U user db"
    "docker compose -f e2e_tests/db/docker-compose.yaml exec postgres_testing_db createdb -U user -E utf8 -T template0 db"
    "docker compose -f e2e_tests/db/docker-compose.yaml exec postgres_testing_db pg_restore --no-owner --role=user -U user --dbname=db /tmp/dbdump"
  )

  echo ""
  echo Copying data to DB
  for command in "${commands[@]}"; do
    eval "$command"
    wait_for_pg_ready
  done
fi


if [ "$1" = "all" ] || [ "$1" = "run_tests" ]; then
  echo ""
  echo Runing tests
  mocha -r ts-node/register --require source-map-support/register "e2e_tests/**/*.e2e-spec.ts"
fi


if [ "$1" = "all" ] || [ "$1" = "delete_db" ]; then
  echo ""
  echo Stoping and removing DB
  docker compose -f e2e_tests/db/docker-compose.yaml down 
fi


