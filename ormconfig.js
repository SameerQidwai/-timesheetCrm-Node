module.exports = {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "",
    "database": process.env.DATABASE_NAME,
    "entities": [
        "src/entities/*.ts"
    ],
    "synchronize": true,
    "logging": true,
    "migrations": [
        "src/migrations/*.ts"
    ],
    "cli": {
        "entitiesDir": "src/entities", "migrationsDir": "src/migrations"
    }
}


// "port": 3306,
// "username": "root" || process.env.DATABASE_USERNAME,
// "password": "" || process.env.DATABASE_PASSWORD,
// "database": "oneLmDev" ||  process.env.DATABASE_NAME,
