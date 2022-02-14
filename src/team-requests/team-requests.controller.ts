import { Request, Response } from 'express'
import { validationResult } from 'express-validator';
import { Service } from 'typedi';
import { HttpException } from '../exceptions/HttpException';
import { TeamRequestApprovementsService } from '../team-request-approvement/team-requests-approvement.service';
import { GetTeamByIdParamsDto } from '../teams/dto/get-team-by-id.dto';
import { TeamsService } from '../teams/teams.service';
import { UsersService } from '../users/users.service';
import { AcceptReqeustParamsDto } from './dto/accept-request.dto';
import { CreateTeamRequestDto } from './dto/create-team-request.dto';
import { TeamRequestsService } from './team-requests.service';
import { TeamRequestTypes } from './team-requests.type';

@Service()
export class TeamRequestController {
    constructor(private usersService: UsersService,
                private teamsService: TeamsService,
                private teamRequestsService: TeamRequestsService,
                private teamRequestApprovementsService: TeamRequestApprovementsService){}
    async joinTheTeam(req: Request, res: Response){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                return res.status(400).json({errors});
            const dto: CreateTeamRequestDto = req.body;
            const userId = req.user?.id;
            const validationResultReq = await this.teamRequestsService.validateTeamRequestForCreation(userId!, dto.teamId);
            if(validationResultReq instanceof HttpException)
                return res.status(validationResultReq.statusCode).json({message: validationResultReq.message});
            const [user, team] = validationResultReq;
            const checkUserOnTheTeam = this.teamsService.userOnTheTeam(user, team);
            if(checkUserOnTheTeam)
                return res.status(400).json({message: 'This user is already on the team.'});
            const id = await this.teamRequestsService.generateTeamRequestsId();
            const teamRequest = await this.teamRequestsService.createTeamRequest({...dto, id, userId, requestType: 'Join the team', status: 'Awaiting'});
            return res.json(teamRequest);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error send joining to the team request.'});
        }
    }

    async leaveTheTeam(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const validationResultReq = await this.teamRequestsService.validateTeamRequestForCreation(userId!);
            if(validationResultReq instanceof HttpException)
                return res.status(validationResultReq.statusCode).json({message: validationResultReq.message});
            const [user, team] = validationResultReq;
            const id = await this.teamRequestsService.generateTeamRequestsId();
            const teamRequest = await this.teamRequestsService.createTeamRequest({id, userId, requestType: 'Leave the team', status: 'Awaiting', teamId: team.id});
            return res.json(teamRequest);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error send left the team request.'});
        }
    }

    async getAll(req: Request, res: Response){
        try {
            const teamRequests = await this.teamRequestsService.getAllTeamRequests();
            return res.json(teamRequests);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error getting all team request.'});
        }
    }

    async deleteRequest(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if(!userId)
                return res.status(400).json({message: 'The user was not found.'});
            const user = await this.usersService.getUserById(userId);
            if(!user)
                return res.status(400).json({message: 'The user was not found.'});
            const getUsersAnAwaitingRequest = this.teamRequestsService.getUsersAnAwaitingRequest(user);
            if(!getUsersAnAwaitingRequest)
                return res.status(400).json({message: `This team request is already verified.`});
            await this.teamRequestsService.deleteTeamRequest(getUsersAnAwaitingRequest);
            return res.json({message: 'Your team request was declined successfully.'})
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error deleting team request.'});
        }
    }

    async managerPost(req: Request, res: Response) {
        try {
            const dtoParams: GetTeamByIdParamsDto = req.params;
            const userId = req.user?.id;
            const validationResultReq = await this.teamRequestsService.validateTeamRequestForCreation(userId!, dtoParams.teamId);
            if(validationResultReq instanceof HttpException)
                return res.status(validationResultReq.statusCode).json({message: validationResultReq.message});
            const [user, team] = validationResultReq;
            const id = await this.teamRequestsService.generateTeamRequestsId();
            const teamRequest = await this.teamRequestsService.createTeamRequest({id, userId, requestType: 'Manager post', status: 'Awaiting', teamId: team.id});
            return res.json(teamRequest);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error send team request on a manager post.'});
        }
    }

    async moveToAnotherTeam(req: Request, res: Response){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                return res.status(400).json({errors});
            const dto: CreateTeamRequestDto = req.body;
            const userId = req.user?.id;
            const validationResultReq = await this.teamRequestsService.validateTeamRequestForCreation(userId!);
            if(validationResultReq instanceof HttpException)
                return res.status(validationResultReq.statusCode).json({message: validationResultReq.message});
            const [user, team] = validationResultReq;
            const id = await this.teamRequestsService.generateTeamRequestsId();
            const teamRequest = await this.teamRequestsService.createTeamRequest({id, userId, requestType: 'Move to another team', status: 'Awaiting', teamId: team.id});
            const teamRequestApprovementId = await this.teamRequestApprovementsService.generateTeamRequestsApprovementId();
            await this.teamRequestApprovementsService.createTeamRequestApprovement({
                id: teamRequestApprovementId, 
                teamRequestId:teamRequest.id, 
                fromTeamId: user.teamId!, 
                toTeamId: dto.teamId
            });
            return res.json(teamRequest);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error send team request on a manager post.'});
        }
    }

    async acceptRequest(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const dtoParams: AcceptReqeustParamsDto = req.params;
            const validationResultReq = await this.teamRequestsService.validateTeamRequestForAcceptingOrDeclining(userId!, dtoParams);
            if(validationResultReq instanceof HttpException)
                return res.status(validationResultReq.statusCode).json({message: validationResultReq.message});
            let [user, team, teamRequest] = validationResultReq;
            const isAdmin = await this.usersService.isAdmin(user.id);
            if(teamRequest.requestType === TeamRequestTypes.MANAGER_POST && !isAdmin)
                return res.status(400).json({message: `You don't have access to accept this team request.`});
            if(teamRequest.teamRequestApprovement)
                teamRequest.teamRequestApprovement = await this.teamRequestApprovementsService.acceptApprovement(teamRequest.teamRequestApprovement, teamRequest, team);
            teamRequest = await this.teamRequestsService.acceptTeamRequest(teamRequest);
            const userForExecute = await this.usersService.getUserById(teamRequest.userId);
            if(!userForExecute)
                return res.status(400).json({message: 'The user was not found.'});
            await this.teamRequestsService.executeRequest(teamRequest, team, userForExecute);
            return res.json(teamRequest);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error accepting team request.'});
        }
    }

    async declineRequest(req: Request, res: Response){
        try {
            const userId = req.user?.id;
            const dtoParams: AcceptReqeustParamsDto = req.params;
            const validationResultReq = await this.teamRequestsService.validateTeamRequestForAcceptingOrDeclining(userId!, dtoParams);
            if(validationResultReq instanceof HttpException)
                return res.status(validationResultReq.statusCode).json({message: validationResultReq.message});
            let [user, team, teamRequest] = validationResultReq;
            if(teamRequest.teamRequestApprovement)
                teamRequest.teamRequestApprovement = await this.teamRequestApprovementsService.declineApprovement(teamRequest.teamRequestApprovement, team);
            teamRequest =  await this.teamRequestsService.declineTeamRequest(teamRequest);
            return res.json(teamRequest);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error declining team request.'});
        }
    }
}