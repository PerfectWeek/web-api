module.exports = {
    "type": "postgres",
    "host": process.env.DB_HOST || "localhost",
    "port": process.env.DB_PORT || 5432,
    "username": "perfectweek",
    "password": process.env.DB_PASSWD || "lol",
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
};
