import 'reflect-metadata';
import 'dotenv/config';
import './passport/passport';
import './ws/ws';
import dbInstance from './db/instantiate-sequelize';
import sessionStore from './db/instantiate-session-store';
import { app } from './app';

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await dbInstance.authenticate();
        await sessionStore.sync();
        console.log('Connection has been established successfully.');
        app.listen(PORT, () => console.log(`Server has been started on port: ${PORT}`));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

start();