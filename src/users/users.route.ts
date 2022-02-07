import express from 'express';
import { check } from 'express-validator';
import Container from 'typedi';
import { isLogedIn } from '../middlewares/is-logged-in.middleware';
import { Roles } from '../middlewares/roles.middleware';
import { UsersController } from './users.controller';

export const UsersRouter = express();
const Controller = Container.get(UsersController);

// 'POST' /users
UsersRouter.post('/', [
    isLogedIn,
    Roles(['ADMIN']),
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
], async (req: any, res: any) => Controller.create(req, res));

// 'GET' /users
UsersRouter.get('/',[
    isLogedIn,
    Roles(['PLAYER']),
], async (req: any, res: any) => Controller.getAll(req, res));
UsersRouter.get('/:id', [
    isLogedIn,
    Roles(['ADMIN'])
], async (req: any, res: any) => Controller.getOne(req, res));

// 'PATCH' /users
UsersRouter.patch('/:id',[
    isLogedIn,
    Roles(['ADMIN']),
    check('email', 'Incorrect email').optional().isString().isEmail(),
    check('password', 'The password must have a minimum of 5 characters and a maximum of 30')
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
], async (req: any, res: any) => Controller.update(req, res));

// 'DELETE' /users
UsersRouter.delete('/:id', [
    isLogedIn,
    Roles(['ADMIN'])
], async (req: any, res: any) => Controller.delete(req, res));