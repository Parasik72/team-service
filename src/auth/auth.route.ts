import express from 'express';
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
], async (req: any, res: any) => Controller.register(req, res));

AuthRouter.post('/login',[
    check('email', 'Incorrect email').isString().isEmail(),
    check('password', 'The password must have a minimum of 5 characters and a maximum of 30')
        .isString()
        .isLength({min: 5, max: 30}),
], async (req: any, res: any) => Controller.login(req, res));

AuthRouter.post('/forgot-pass', [
    check('email', 'Incorrect email').isString().isEmail()
],async (req: any, res: any) => Controller.forgotPass(req, res));

AuthRouter.post('/reset-pass/:userId/:token', [
    check('password', 'The password must have a minimum of 5 characters and a maximum of 30')
        .isString()
        .isLength({min: 5, max: 30})
],async (req: any, res: any) => Controller.resetPass(req, res));

// 'GET' /auth
AuthRouter.get('/google', passport.authenticate('google', { scope: [ 'email', 'profile' ] }));

AuthRouter.get('/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));

AuthRouter.get('/google/success', [isLogedInGoogle], (req: any, res: any) => Controller.successGoogleAuth(req, res));
AuthRouter.get('/google/failure', (req: any, res: any) => Controller.failureGoogleAth(req, res));
AuthRouter.get('/google/logout', [isLogedInGoogle], (req: any, res: any) => Controller.logoutGoogle(req, res));