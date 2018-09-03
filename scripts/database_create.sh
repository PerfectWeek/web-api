#!/usr/bin/env bash

docker create \
    --name perfectweek-db \
    -p 127.0.0.1:5432:5432 \
    --env POSTGRES_PASSWORD=lol \
    --env POSTGRES_USER=perfectweek \
    --env POSTGRES_DB=perfectweek \
    postgres
