import express, {Request, Response} from 'express';
import { check } from 'express-validator';
import Container from 'typedi';
import { isNotBanned } from '../middlewares/is-banned.middleware';
import { isLogedIn } from '../middlewares/is-logged-in.middleware';
import { Roles } from '../middlewares/roles.middleware';
import { UsersController } from './users.controller';

export const UsersRouter = express();
const Controller = Container.get(UsersController);

// 'POST' /users
UsersRouter.post('/', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN']),
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
], async (req: Request, res: Response) => Controller.create(req, res));

UsersRouter.post('/ban/:userId', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN']),
    check('banReason', 'Incorect team id').isString().isLength({min: 2, max: 40}),
], async (req: Request, res: Response) => Controller.ban(req, res));

// 'GET' /users
UsersRouter.get('/', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN']),
], async (req: Request, res: Response) => Controller.getAll(req, res));

UsersRouter.get('/unban/:userId', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN']),
], async (req: Request, res: Response) => Controller.unban(req, res));

UsersRouter.get('/:userId', [
    isLogedIn,
    isNotBanned,
    Roles(['MANAGER', 'ADMIN'])
], async (req: Request, res: Response) => Controller.getOne(req, res));

// 'PATCH' /users
UsersRouter.patch('/:userId',[
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN']),
    check('email', 'Incorrect email').optional().isString().isEmail(),
    check('login', 'The login must have a minimum of 5 characters and a maximum of 30')
        .optional()
        .isString()
        .isLength({min: 5, max: 30}),
    check('firstName', 'Incorrect firstname')
        .optional()
        .isString()
        .matches(/^[A-Z]+[a-zA-z]+$/)
        .isLength({min: 2, max:25}),
    check('lastName', 'Incorrect lastname')
        .optional()
        .isString()
        .matches(/^[A-Z]+[a-zA-z]+$/)
        .isLength({min: 2, max:25})
], async (req: Request, res: Response) => Controller.update(req, res));

UsersRouter.patch('/change-pass/:userId', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN']),
    check('password', 'The password must have a minimum of 5 characters and a maximum of 30')
        .optional()
        .isString()
        .isLength({min: 5, max: 30}),
], async (req: Request, res: Response) => Controller.changePass(req, res));

// 'DELETE' /users
UsersRouter.delete('/:userId', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN'])
], async (req: Request, res: Response) => Controller.delete(req, res));