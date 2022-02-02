import {Sequelize} from 'sequelize';

const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE || 'database';
const POSTGRES_USERNAME = process.env.POSTGRES_USERNAME || 'username';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'password';
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';

const dbInstance = new Sequelize({
    database: POSTGRES_DATABASE,
    username: POSTGRES_USERNAME,
    password: POSTGRES_PASSWORD,
    host: POSTGRES_HOST,
    dialect: 'postgres'
})

export default dbInstance;