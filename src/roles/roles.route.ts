import express from 'express';
import { check } from 'express-validator';
import Container from 'typedi';
import { isLogedIn } from '../middlewares/is-logged-in.middleware';
import { Roles } from '../middlewares/roles.middleware';
import { RolesController } from './roles.controller';

export const RolesRouter = express();
const Controller = Container.get(RolesController);

// 'POST' /roles
RolesRouter.post('/create', [
    check('value', 'Incorect value').isString().isLength({min: 2, max: 20})
], async (req: any, res: any) => Controller.create(req, res));