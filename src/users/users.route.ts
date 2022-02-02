import express from 'express';
import { body, check } from 'express-validator';
import Container from 'typedi';
import { UsersController } from './users.controller';

export const UsersRouter = express();
const Controller = Container.get(UsersController);

// 'POST' /users
UsersRouter.post('/', [
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
UsersRouter.get('/', async (req, res) => Controller.getAll(req, res));
UsersRouter.get('/:id', async (req, res) => Controller.getOne(req, res));

// 'PATCH' /users
UsersRouter.patch('/:id',[
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
UsersRouter.delete('/:id', async (req, res) => Controller.delete(req, res));