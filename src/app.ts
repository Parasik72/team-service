import express from 'express';
import { Router } from './routes';
import fileUpload from 'express-fileupload';
import session from 'express-session';
import passport from 'passport';
import sessionStore from './db/instantiate-session-store';

export const app = express();

const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';
const STATIC_PATH = process.env.STATIC_PATH || 'static_path';

app.use(session({
    secret: SESSION_SECRET,
    store: sessionStore,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));
app.use(fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 }
}));
app.use(express.json());
app.use(express.static(STATIC_PATH));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.use('/', Router);