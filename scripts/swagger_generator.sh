#!/bin/sh

# IMPORTANT: This script is intended to be executed at the root
# of the repository

echo [info] Generating openapi.json from openapi.yaml...

docker run --rm \
    -v $PWD:/local \
    openapitools/openapi-generator-cli \
        generate \
        -i /local/openapi.yaml \
        -g openapi \
        -o /local/resources/openapi > /dev/null

if test $? -eq 0
then
    echo [info] Generation done
fi

echo
