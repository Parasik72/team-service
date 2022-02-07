import 'reflect-metadata';
import 'dotenv/config'
import './passport/passport';
import express from 'express';
import { UsersRouter } from './users/users.route';
import { AuthRouter } from './auth/auth.route';
import { RolesRouter } from './roles/roles.route';
import dbInstance from './db/instantiate-sequalize';
import {Server} from 'ws';
import session from 'express-session';
import sessionStore from './db/instantiate-session-store';
import passport from 'passport';

const PORT = process.env.PORT || 5000;
const WS_PORT = Number(process.env.WS_PORT) || 6000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';

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

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.use('/auth', AuthRouter);
app.use('/users', UsersRouter);
app.use('/roles', RolesRouter);
app.get('/echo', (req, res) => {
    res.status(200).json({message: 'Hello world!'});
});
app.use('/ws', (req, res) => {
    res.render('index', {WS_PORT});
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