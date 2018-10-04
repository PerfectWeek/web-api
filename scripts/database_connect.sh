#!/usr/bin/env bash

docker run -it --rm --link perfectweek-db:perfectweek-db-psql \
    postgres psql -h perfectweek-db-psql -U perfectweek
