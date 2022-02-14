import express, {Request, Response} from 'express';
import { check } from 'express-validator';
import Container from 'typedi';
import { isNotBanned } from '../middlewares/is-banned.middleware';
import { isLogedIn } from '../middlewares/is-logged-in.middleware';
import { Roles } from '../middlewares/roles.middleware';
import { RolesController } from './roles.controller';

export const RolesRouter = express();
const Controller = Container.get(RolesController);

// 'POST' /roles
RolesRouter.post('/create', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN']),
    check('value', 'Incorrect value').isString().isLength({min: 2, max: 20})
], async (req: Request, res: Response) => Controller.create(req, res));

// 'GET' /roles
RolesRouter.get('/all', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN'])
], async (req: Request, res: Response) => Controller.getAll(req, res));

// 'DELETE' /roles
RolesRouter.delete('/delete/:value', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN']),
    check('value', 'Incorrect value').isString().isLength({min: 2, max: 20})
], async (req: Request, res: Response) => Controller.delete(req, res));