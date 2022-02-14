import {Request, Response} from 'express';
import { validationResult } from 'express-validator';
import { Service } from 'typedi';
import { CreateTeamKickDto } from '../team-kicks/dto/create-team-kick.dto';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { AddUserToTeam } from './dto/add-user-to-team.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { GetTeamByIdParamsDto } from './dto/get-team-by-id.dto';
import { SetManagerBodyDto, SetManagerParamsDto } from './dto/set-manager.dto';
import { TeamsService } from './teams.service';
import { TeamKicksService } from '../team-kicks/team-kicks.service';
import { TeamRequestsService } from '../team-requests/team-requests.service';

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
                return res.status(400).json({errors});
            const dto: CreateTeamDto = req.body;
            const checkName = await this.teamsService.getTeamByName(dto.teamName);
            if(checkName)
                return res.status(400).json({message: 'This team name is already exists.'});
            const id = await this.teamsService.generateTeamId();
            const team = await this.teamsService.createTeam({...dto, id});
            return res.json(team);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error creating team.'});
        }
    }

    async addUser(req: Request, res: Response){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                return res.status(400).json({errors});
            const dto: AddUserToTeam = req.body;
            const { teamId } = req.params;
            const team = await this.teamsService.getTeamById(teamId);
            if(!team)
                return res.status(400).json({message: 'The team was not found.'});
            const user = await this.usersService.getUserById(dto.userId);
            if(!user)
                return res.status(400).json({message: 'The user was not found.'});
            await this.teamsService.addUserToTeam(user, team);
            return res.json(team);
        } catch (error) {
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
            return res.json(team);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error getting team by id.'});
        }
    }

    async get(req: Request, res: Response){
        try {
            const reqUser = req.user as Express.User;
            if(!reqUser)
                return res.status(400).json({message: 'No access.'});
            const user = await this.usersService.getUserById(reqUser?.id);
            if(!user)
                return res.status(400).json({message: 'The user was not found.'});
            const team = await this.teamsService.getTeamById(user.teamId!);
            if(!team)
                return res.status(400).json({message: 'The team was not found.'});
            return res.json(team);
        } catch (error) {
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
                return res.status(400).json({message: 'The user was not found.'});
            const team = await this.teamsService.getTeamById(dtoParams?.teamId!);
            if(!team)
                return res.status(400).json({message: 'The team was not found.'});
            const role = await this.rolesService.getRoleByValue('MANAGER');
            if(!role)
                return res.status(400).json({message: 'Manager role was not found.'});
            const checkUserOnTheTeam = this.teamsService.userOnTheTeam(user, team);
            if(!checkUserOnTheTeam)
                await this.teamsService.addUserToTeam(user, team);
            await this.teamsService.setManagerTeam(user, team);
            return res.json(team);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error setting the team manager.'});
        }
    }

    async unsetManager(req: Request, res: Response) {
        try {
            const dtoParams: SetManagerParamsDto = req.params;
            let team = await this.teamsService.getTeamById(dtoParams?.teamId!);
            if(!team)
                return res.status(400).json({message: 'The team was not found.'});
            if(!team.managerId)
                return res.status(400).json({message: `This team hasn't a manager.`});
            const manager = await this.usersService.getUserById(team.managerId);
            if(!manager)
                return res.status(400).json({message: 'The user was not found.'});
            team = await this.teamsService.unsetManagerTeam(manager, team);
            return res.json(team);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error unsetting the team manager.'});
        }
    }

    async kick(req: Request, res: Response){
        try {
            const reqUser = req.user as Express.User;
            if(!reqUser)
                return res.status(400).json({message: 'No access.'});
            const dtoBody: CreateTeamKickDto = req.body;
            const user = await this.usersService.getUserById(reqUser.id);
            if(!user)
                return res.status(400).json({message: 'The user was not found.'});
            const kickUser = await this.usersService.getUserById(dtoBody.userId);
            if(!kickUser)
                return res.status(400).json({message: 'The user was not found.'});
            const isAdmin = await this.usersService.isAdmin(user.id);
            if(!user.teamId && !isAdmin)
                return res.status(400).json({message: `You don't have access to kick this user.`});
            if(!kickUser.teamId)
                return res.status(400).json({message: `This user is not a member of any team.`});
            const team = await this.teamsService.getTeamById(kickUser.teamId);
            if(!team)
                return res.status(400).json({message: 'The team was not found.'});
            if(kickUser.teamId !== user.teamId && !isAdmin)
                return res.status(400).json({message: `You don't have access to kick this user.`});
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
            console.log(error);
            return res.status(500).json({message: 'Error kicking the user from team.'});
        }
    }
}