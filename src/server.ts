import 'reflect-metadata';
import 'dotenv/config'
import './passport/passport';
import express from 'express';
import dbInstance from './db/instantiate-sequelize';
import { Server } from 'ws';
import session from 'express-session';
import sessionStore from './db/instantiate-session-store';
import passport from 'passport';
import { Router } from './routes';
import fileUpload from 'express-fileupload';

const PORT = process.env.PORT || 5000;
const WS_PORT = Number(process.env.WS_PORT) || 6000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';
const STATIC_PATH = process.env.STATIC_PATH || 'static_path';

const wss = new Server({port: WS_PORT});
const app = express();

app.use(session({
    secret: SESSION_SECRET,
    store: sessionStore,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

wss.on('connection', (ws) => {
    console.log('Client connected.');
    ws.on('close', () => {
        console.log('Client disconected.');
    });
});

app.use(fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 }
}));
app.use(express.json());
app.use(express.static(STATIC_PATH));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.use('/', Router);

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