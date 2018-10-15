#!/usr/bin/env bash

docker run \
    -d \
    --name perfectweek-db-test \
    -p 127.0.0.1:2345:5432 \
    --env POSTGRES_PASSWORD=lol \
    --env POSTGRES_USER=perfectweek \
    --env POSTGRES_DB=perfectweek \
    postgres
