#!/bin/sh

LOCAL_PASSWD=lol

# Retrieve postgres container
docker pull postgres

# Create docker instance named perfect-week
docker run --name perfectweek-db -e POSTGRES_PASSWORD=$LOCAL_PASSWD -p 5432:5432 -d postgres
sleep 2

# Create database
docker run -it --rm --link perfectweek-db:postgres postgres psql -h postgres -U postgres --command "CREATE DATABASE perfect_week;"
