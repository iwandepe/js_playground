module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres', // change to your username
  password: 'securepass', // change to your password
  database: 'nest_postgres',
  migrations: [
    process.env.APP_ENV === 'migration' ? 'migrations/**/*{.ts,.js}' : '',
  ],
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'migrations',
  },
};
