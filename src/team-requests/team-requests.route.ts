import express, {Request, Response} from 'express';
import { check } from 'express-validator';
import Container from 'typedi';
import { isNotBanned } from '../middlewares/is-banned.middleware';
import { isLogedIn } from '../middlewares/is-logged-in.middleware';
import { Roles } from '../middlewares/roles.middleware';
import { TeamRequestController } from './team-requests.controller';

export const TeamRequestsRouter = express();
const Controller = Container.get(TeamRequestController);

// 'POST' /team-requests
TeamRequestsRouter.post('/join-the-team', [
    isLogedIn,
    isNotBanned,
    Roles(['PLAYER']),
    check('teamId', 'Incorrect team id').isString().isLength({min: 1, max: 40})
], async (req: Request, res: Response) => Controller.joinTheTeam(req, res));

TeamRequestsRouter.post('/move-to-another-team', [
    isLogedIn,
    isNotBanned,
    Roles(['PLAYER']),
    check('teamId', 'Incorrect team id').isString().isLength({min: 1, max: 40})
], async (req: Request, res: Response) => Controller.moveToAnotherTeam(req, res));

// 'GET' /team-requests
TeamRequestsRouter.get('/all', [
    isLogedIn,
    isNotBanned,
    Roles(['MANAGER', 'ADMIN'])
]
, async (req: Request, res: Response) => Controller.getAll(req, res));

TeamRequestsRouter.get('/leave-the-team', [
    isLogedIn,
    isNotBanned,
    Roles(['PLAYER'])
], async (req: Request, res: Response) => Controller.leaveTheTeam(req, res));

TeamRequestsRouter.get('/manager-post/:teamId', [
    isLogedIn,
    isNotBanned,
    Roles(['PLAYER'])
], async (req: Request, res: Response) => Controller.managerPost(req, res));

TeamRequestsRouter.get('/accept/:teamRequestId', [
    isLogedIn,
    isNotBanned,
    Roles(['MANAGER', 'ADMIN'])
], async (req: Request, res: Response) => Controller.acceptRequest(req, res));

TeamRequestsRouter.get('/decline/:teamRequestId', [
    isLogedIn,
    isNotBanned,
    Roles(['MANAGER', 'ADMIN'])
], async (req: Request, res: Response) => Controller.declineRequest(req, res));

// 'DELETE' /team-requests
TeamRequestsRouter.delete('/', [
    isLogedIn,
    isNotBanned,
], async (req: Request, res: Response) => Controller.deleteRequest(req, res))