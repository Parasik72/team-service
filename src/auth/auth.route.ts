import express, {Request, Response} from 'express';
import { check } from 'express-validator';
import passport from 'passport';
import Container from 'typedi';
import { isLogedInGoogle } from '../middlewares/is-logged-in.google-auth.middleware';
import { AuthController } from './auth.controller';

export const AuthRouter = express();
const Controller = Container.get(AuthController);

// 'POST' /auth
AuthRouter.post('/register',[
    check('email', 'Incorrect email').isString().isEmail(),
    check('login', 'The login must have a minimum of 5 characters and a maximum of 30')
        .isString()
        .isLength({min: 5, max: 30}),
    check('password', 'The password must have a minimum of 5 characters and a maximum of 30')
        .isString()
        .isLength({min: 5, max: 30}),
    check('firstName', 'Incorrect firstname')
        .isString()
        .matches(/^[A-Z]+[a-zA-z]+$/)
        .isLength({min: 2, max:25}),
    check('lastName', 'Incorrect lastname')
        .isString()
        .matches(/^[A-Z]+[a-zA-z]+$/)
        .isLength({min: 2, max:25})
], async (req: Request, res: Response) => Controller.register(req, res));

AuthRouter.post('/login',[
    check('login', 'The login must have a minimum of 5 characters and a maximum of 30')
        .isString()
        .isLength({min: 5, max: 30}),
    check('password', 'The password must have a minimum of 5 characters and a maximum of 30')
        .isString()
        .isLength({min: 5, max: 30}),
], async (req: Request, res: Response) => Controller.login(req, res));

AuthRouter.post('/forgot-pass', [
    check('email', 'Incorrect email').isString().isEmail()
],async (req: Request, res: Response) => Controller.forgotPass(req, res));

AuthRouter.post('/reset-pass/:userId/:token', [
    check('password', 'The password must have a minimum of 5 characters and a maximum of 30')
        .isString()
        .isLength({min: 5, max: 30})
],async (req: Request, res: Response) => Controller.resetPass(req, res));

// 'GET' /auth
AuthRouter.get('/google', passport.authenticate('google', { scope: [ 'email', 'profile' ] }));

AuthRouter.get('/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));

AuthRouter.get('/google/success', [isLogedInGoogle], (req: Request, res: Response) => Controller.successGoogleAuth(req, res));
AuthRouter.get('/google/failure', (req: Request, res: Response) => Controller.failureGoogleAth(req, res));
AuthRouter.get('/google/logout', [isLogedInGoogle], (req: Request, res: Response) => Controller.logoutGoogle(req, res));