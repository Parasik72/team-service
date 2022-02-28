import express, {Request, Response} from 'express';
import { check } from "express-validator";
import Container from "typedi";
import { isNotBanned } from '../middlewares/is-banned.middleware';
import { isLogedIn } from "../middlewares/is-logged-in.middleware";
import { ProfilesController } from "./profiles.controller";

export const ProfilesRouter = express();
const Controller = Container.get(ProfilesController);

// 'GET' /profiles
ProfilesRouter.get('/', [
    isLogedIn,
    isNotBanned,
], async (req: Request, res: Response) => Controller.getProfile(req, res));

// 'PATCH' /profiles
ProfilesRouter.patch('/', [
    isLogedIn,
    isNotBanned,
    check('login', 'The login must have a minimum of 5 characters and a maximum of 30')
        .optional()
        .isString()
        .isLength({min: 5, max: 30}),
    check('password', 'The password must have a minimum of 5 characters and a maximum of 30')
        .optional()
        .isString()
        .isLength({min: 5, max: 30}),
], async (req: Request, res: Response) => Controller.changeProfile(req, res));