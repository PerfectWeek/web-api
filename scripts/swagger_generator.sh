#!/bin/sh

# IMPORTANT: This script is intended to be executed at the root
# of the repository

docker run --rm \
    -v $PWD:/local \
    openapitools/openapi-generator-cli \
        generate \
        -i /local/openapi.yaml \
        -g openapi \
        -o /local/resources/openapi
