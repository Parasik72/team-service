import express from "express";
import { AuthRouter } from "./auth/auth.route";
import { ProfilesRouter } from "./profiles/profiles.route";
import { RolesRouter } from "./roles/roles.route";
import { TeamRequestsRouter } from "./team-requests/team-requests.route";
import { TeamsRouter } from "./teams/teams.route";
import { UsersRouter } from "./users/users.route";

export const Router = express();

const WS_PORT = Number(process.env.WS_PORT) || 6000;
const WS_HOST = process.env.WS_HOST || 'host';

Router.use('/auth', AuthRouter);
Router.use('/users', UsersRouter);
Router.use('/profiles', ProfilesRouter);
Router.use('/teams', TeamsRouter);
Router.use('/team-requests', TeamRequestsRouter);
Router.use('/roles', RolesRouter);
Router.get('/echo', (req, res) => {
    res.status(200).json({message: 'Hello world!'});
});
Router.use('/ws', (req, res) => {
    res.render('index', {WS_PORT, WS_HOST});
});
Router.use((req, res) => {
    return res.status(404).json({message: 'This endpoint was not found!'});
});