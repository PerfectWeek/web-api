# Perfect Week Web API

[![Build Status](https://travis-ci.org/PerfectWeek/web-api.svg?branch=dev)](https://travis-ci.org/PerfectWeek/web-api)

## QuickStart

### Retrieve nodejs dependencies

```sh
npm install
```

### Set up the data-base

From the root of the repository, run the following commands:

```sh
./scripts/database_create.sh
docker start perfectweek-db
npm run migration-up
```

This will create a new docker container named `perfectweek-db` on your system.

#### Notes

- If you shut down your computer or the container, you may need to run `docker start perfectweek-db` again to restart the container
- If changes are made on the databse schema, you'll need to run `npm run migration-up` once again to update it

### Start the API

You'll first need to set the following environment variables in order to start the API:

| Variable name | Description | Default value |
| ------ | ------- | ----- |
| `DB_HOST` | The hostname of the database | 127.0.0.1 |
| `DB_PORT` | The port of the database | 5432 |
| `DB_PASSWD` | The password to connect to the database | lol |
| `JWT_ENCODE_KEY` | A string that will be used to encode Json Web Token. Any string is fine | secret |

Additionally, you can set the following variables:

| Variable name | Description | Default value |
| ------ | ------- | ----- |
| `PORT` | The port on which the API will be accessible | 3000 |
| `EMAIL_ENABLED` | If a value is set, emails will be sent when creating user. If not, the link will be in the answer (debug only) | false |

Once this is done, start the API with the following command

```sh
npm start
```

## Documentation

The API documentation can be found on [the documentation page](https://app.swaggerhub.com/apis-docs/PerfectWeek/PerfectWeek/0.1.0)
