import 'reflect-metadata';
import 'dotenv/config'
import express from 'express';
import { UsersRouter } from './users/users.route';
import dbInstance from './db/instantiate-sequalize';
import {Server} from 'ws';

const PORT = process.env.PORT || 5000;
const WS_PORT = Number(process.env.WS_PORT) || 6000;

const wss = new Server({port: WS_PORT});
const app = express();

wss.on('connection', (ws) => {
    console.log('Client connected.')
    ws.on('close', () => {
        console.log('Client disconected.')
    })
});

app.use(express.json());
app.use('/users', UsersRouter);
app.get('/echo', (req, res) => {
    res.status(200).json({message: 'Hello world!'});
});

app.use((req, res) => {
    return res.status(404).json({message: 'The endpoint was not found!'});
});

const start = async () => {
    try {
        await dbInstance.authenticate();
        await dbInstance.sync();
        console.log('Connection has been established successfully.');
        app.listen(PORT, () => console.log(`Server has been started on port: ${PORT}`));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

start();