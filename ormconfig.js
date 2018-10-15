module.exports = {
    "type": "postgres",
    "host": "localhost",
    "port": process.env.DB_PORT || 5432,
    "username": "perfectweek",
    "password": "lol",
    "database": "perfectweek",
    "synchronize": false,
    "logging": false,
    "entities": [
        "build/model/entity/*.js"
    ],
    "migrations": [
        "build/model/migrations/*.js"
    ],
    "cli": {
        "migrationsDir": "sources/model/migrations"
    }
}
