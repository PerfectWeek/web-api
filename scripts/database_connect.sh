#!/usr/bin/env bash

docker run -it --rm --link perfectweek-db:postgres postgres psql -h postgres -U perfectweek
