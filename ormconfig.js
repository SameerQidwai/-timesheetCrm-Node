module.exports = {
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: 3306,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  subscribers: ['src/subscribers/*.ts'],
  entities: ['src/entities/*.ts', 'src/entities/views/*.ts'],
  synchronize: false,
  logging: false,
  migrations: ['src/migrations/*.ts'],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
  },
  timezone: 'Z',
};

// "port": 3306,
// "username": "root" || process.env.DATABASE_USERNAME,
// "password": "Account1!" || process.env.DATABASE_PASSWORD,
// "database": "oneLmDev" ||  process.env.DATABASE_NAME,
