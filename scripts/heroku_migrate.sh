#! /bin/bash

url=${DATABASE_URL}
regex="^.*:\/\/(.+):(.+)@(.+):(.+)\/(.+)$"

echo "Starting Database Migration with Postgres url ${DATABASE_URL}"

if [[ $url =~ $regex ]]
then
  export DB_USER="${BASH_REMATCH[1]}"
  export DB_PASSWD="${BASH_REMATCH[2]}"
  export DB_HOST="${BASH_REMATCH[3]}"
  export DB_PORT="${BASH_REMATCH[4]}"
  export DB_NAME="${BASH_REMATCH[5]}"
  npm run migration-up
else
  echo "${DATABASE_URL} Does not match regex" >&2
fi
