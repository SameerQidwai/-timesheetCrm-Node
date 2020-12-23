module.exports = {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_NAME,
    "entities": [
        "src/entities/*.ts"
    ],
    "synchronize": true,
    "logging": false,
    "migrations": [
        "src/migrations/*.ts"
    ],
    "cli": {
        "entitiesDir": "src/entities", "migrationsDir": "src/migrations"
    }
}


