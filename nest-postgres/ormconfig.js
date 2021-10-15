module.exports = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'root', // change to your username
    password: 'root', // change to your password
    database: 'nest_postgres',
    // migrations: ['migrations/**/*{.ts,.js}'],
    cli: {
        entitiesDir: 'src',
        migrationsDir: 'migrations',
    },
};