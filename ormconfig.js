module.exports = {
    "type": "postgres",
    "host": process.env.DB_HOST || "localhost",
    "port": process.env.DB_PORT || 5432,
    "username": process.env.DB_USER || "perfectweek",
    "password": process.env.DB_PASSWD || "lol",
    "database": process.env.DB_NAME || "perfectweek",
    "synchronize": false,
    "logging": false,
    "entities": [
        "build/sources/model/entity/*.js"
    ],
    "migrations": [
        "build/sources/model/migrations/*.js"
    ],
    "cli": {
        "migrationsDir": "sources/model/migrations"
    }
};
