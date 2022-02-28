import {Request, Response} from 'express';
import { validationResult } from 'express-validator';
import { Service } from 'typedi';
import { CreateTeamKickDto } from '../team-kicks/dto/create-team-kick.dto';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { AddUserToTeamDto } from './dto/add-user-to-team.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { GetTeamByIdParamsDto } from './dto/get-team-by-id.dto';
import { SetManagerBodyDto, SetManagerParamsDto } from './dto/set-manager.dto';
import { TeamsService } from './teams.service';
import { TeamKicksService } from '../team-kicks/team-kicks.service';
import { TeamRequestsService } from '../team-requests/team-requests.service';
import { HttpException, HttpExceptionMessages } from '../exceptions/HttpException';

@Service()
export class TeamsController {
    constructor(private teamsService: TeamsService,
                private usersService: UsersService,
                private rolesService: RolesService,
                private teamKicksService: TeamKicksService,
                private teamRequestsService: TeamRequestsService){}
    async create(req: Request, res: Response){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                throw new HttpException(400, errors);
            const dto: CreateTeamDto = req.body;
            const checkName = await this.teamsService.getTeamByName(dto.teamName);
            if(checkName)
                throw new HttpException(400, 'This team name is already exists.');
            const id = await this.teamsService.generateTeamId();
            const team = await this.teamsService.createTeam({...dto, id});
            return res.status(201).json(team);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error creating team.'});
        }
    }

    async addUser(req: Request, res: Response){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                throw new HttpException(400, errors);
            const dto: AddUserToTeamDto = req.body;
            const { teamId } = req.params;
            const team = await this.teamsService.getTeamById(teamId);
            if(!team)
                throw new HttpException(400, HttpExceptionMessages.TeamWasNotFound);
            const user = await this.usersService.getUserById(dto.userId);
            if(!user)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            await this.teamsService.addUserToTeam(user, team);
            return res.json(team);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error adding user to team.'});
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const teams = await this.teamsService.getAll();
            return res.json(teams);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error getting all teams.'});
        }
    }

    async getById(req: Request, res: Response){
        try {
            const dto: GetTeamByIdParamsDto = req.params;
            const team = await this.teamsService.getTeamById(dto.teamId!);
            if(!team)
                throw new HttpException(400, HttpExceptionMessages.TeamWasNotFound);
            return res.json(team);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error getting team by id.'});
        }
    }

    async get(req: Request, res: Response){
        try {
            const reqUser = req.user as Express.User;
            if(!reqUser)
                throw new HttpException(403, HttpExceptionMessages.NoAccess);
            const user = await this.usersService.getUserById(reqUser?.id);
            if(!user)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            const team = await this.teamsService.getTeamById(user.teamId!);
            if(!team)
                throw new HttpException(400, HttpExceptionMessages.TeamWasNotFound);
            return res.json(team);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error getting the team.'});
        }
    }

    async setManager(req: Request, res: Response){
        try {
            const dtoBody: SetManagerBodyDto = req.body;
            const dtoParams: SetManagerParamsDto = req.params;
            const user = await this.usersService.getUserById(dtoBody.userId);
            if(!user)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            const team = await this.teamsService.getTeamById(dtoParams?.teamId!);
            if(!team)
                throw new HttpException(400, HttpExceptionMessages.TeamWasNotFound);
            const role = await this.rolesService.getRoleByValue('MANAGER');
            if(!role)
                throw new HttpException(400, 'Manager role was not found.');
            const checkUserOnTheTeam = this.teamsService.userOnTheTeam(user, team);
            if(!checkUserOnTheTeam)
                await this.teamsService.addUserToTeam(user, team);
            await this.teamsService.setManagerTeam(user, team);
            return res.json(team);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error setting the team manager.'});
        }
    }

    async unsetManager(req: Request, res: Response) {
        try {
            const dtoParams: SetManagerParamsDto = req.params;
            let team = await this.teamsService.getTeamById(dtoParams?.teamId!);
            if(!team)
                throw new HttpException(400, HttpExceptionMessages.TeamWasNotFound);
            if(!team.managerId)
                throw new HttpException(400, `This team hasn't a manager.`);
            const manager = await this.usersService.getUserById(team.managerId);
            if(!manager)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            team = await this.teamsService.unsetManagerTeam(manager, team);
            return res.json(team);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error unsetting the team manager.'});
        }
    }

    async kick(req: Request, res: Response){
        try {
            const reqUser = req.user as Express.User;
            if(!reqUser)
                throw new HttpException(403, HttpExceptionMessages.NoAccess);
            const dtoBody: CreateTeamKickDto = req.body;
            const user = await this.usersService.getUserById(reqUser.id);
            if(!user)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            const kickUser = await this.usersService.getUserById(dtoBody.userId);
            if(!kickUser)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            const isAdmin = await this.usersService.isAdmin(user.id);
            if(!user.teamId && !isAdmin)
                throw new HttpException(400, `You don't have access to kick this user.`);
            if(!kickUser.teamId)
                throw new HttpException(400, `This user is not a member of any team.`);
            const team = await this.teamsService.getTeamById(kickUser.teamId);
            if(!team)
                throw new HttpException(400, HttpExceptionMessages.TeamWasNotFound);
            if(kickUser.teamId !== user.teamId && !isAdmin)
                throw new HttpException(400, `You don't have access to kick this user.`);
            const teamKickId = await this.teamKicksService.generateTeamKickId();
            const teamKick = await this.teamKicksService.createTeamKick({
                ...dtoBody, 
                id: teamKickId, 
                userId: kickUser.id, 
                kickReason: dtoBody.kickReason, 
                teamId: team.id,
                kickedBy: user.id
            });
            const awaitingTeamRequest = await this.teamRequestsService.getUsersAnAwaitingRequest(kickUser);
            if(awaitingTeamRequest)
                await this.teamRequestsService.declineTeamRequest(awaitingTeamRequest);
            await this.teamsService.kickUser(kickUser, team);
            return res.json(teamKick);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error kicking the user from team.'});
        }
    }
}