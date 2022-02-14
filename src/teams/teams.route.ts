import express, {Request, Response} from 'express';
import { check } from 'express-validator';
import Container from 'typedi';
import { isNotBanned } from '../middlewares/is-banned.middleware';
import { isLogedIn } from '../middlewares/is-logged-in.middleware';
import { Roles } from '../middlewares/roles.middleware';
import { TeamsController } from './teams.controller';

export const TeamsRouter = express();
const Controller = Container.get(TeamsController);

// 'POST' /teams
TeamsRouter.post('/', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN']),
    check('teamName', 'Incorrect team name').isString().isLength({min: 2, max: 20})
], async (req: Request, res: Response) => Controller.create(req, res));

TeamsRouter.post('/set-manager/:teamId', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN']),
    check('userId', 'Incorrect user id').isString().isLength({min: 2, max: 40}),
], async (req: Request, res: Response) => Controller.setManager(req, res));

TeamsRouter.post('/unset-manager/:teamId', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN'])
], async (req: Request, res: Response) => Controller.unsetManager(req, res));

TeamsRouter.post('/kick', [
    isLogedIn,
    isNotBanned,
    Roles(['MANAGER', 'ADMIN']),
    check('userId', 'Incorrect user id').isString().isLength({min: 2, max: 40}),
    check('kickReason', 'Incorrect kick reason').isString().isLength({min: 2, max: 80})
], async (req: Request, res: Response) => Controller.kick(req, res));

TeamsRouter.post('/:teamId', [
    isLogedIn,
    isNotBanned,
    Roles(['ADMIN']),
    check('userId', 'Incorrect user id').isString().isLength({min: 2, max: 40})
], async (req: Request, res: Response) => Controller.addUser(req, res));

// 'GET' /teams
TeamsRouter.get('/', [
    isLogedIn,
    isNotBanned,
], async (req: Request, res: Response) => Controller.get(req, res));
TeamsRouter.get('/all', [
    isLogedIn,
    isNotBanned,
],async (req: Request, res: Response) => Controller.getAll(req, res));
TeamsRouter.get('/:teamId', [
    isLogedIn,
    isNotBanned,
], async (req: Request, res: Response) => Controller.getById(req, res));