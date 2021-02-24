module.exports = {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "Account1!",
    "database": "oneLmDev",
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


// "port": 3306,
// "username": "root" || process.env.DATABASE_USERNAME,
// "password": "Account1!" || process.env.DATABASE_PASSWORD,
// "database": "oneLmDev" ||  process.env.DATABASE_NAME,
