import {Strategy} from 'passport-google-oauth2';
import passport from "passport";

const PASSPORT_CLIENT_ID = process.env.PASSPORT_CLIENT_ID || 'clientid';
const PASSPORT_CLIENT_SECRET = process.env.PASSPORT_CLIENT_SECRET || 'clientsecret';
const PASSPORT_CALLBACK_URL = process.env.PASSPORT_CALLBACK_URL || 'callbackurl';

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});

passport.use(new Strategy(
    {
        clientID: PASSPORT_CLIENT_ID,
        clientSecret: PASSPORT_CLIENT_SECRET,
        callbackURL: PASSPORT_CALLBACK_URL,
        passReqToCallback: true
    },
    (request: any, accessToken: any, refreshToken: any, profile: any, done: any) => {
        return done(null, profile);
    }
));