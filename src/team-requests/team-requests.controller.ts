import { Request, Response } from 'express'
import { validationResult } from 'express-validator';
import { Service } from 'typedi';
import { HttpException, HttpExceptionMessages } from '../exceptions/HttpException';
import { TeamRequestApprovementsService } from '../team-request-approvement/team-requests-approvement.service';
import { GetTeamByIdParamsDto } from '../teams/dto/get-team-by-id.dto';
import { TeamsService } from '../teams/teams.service';
import { UsersService } from '../users/users.service';
import { AcceptReqeustParamsDto } from './dto/accept-request.dto';
import { CreateTeamRequestDto } from './dto/create-team-request.dto';
import { TeamRequestsService } from './team-requests.service';
import { ETeamRequestStatusType, ETeamRequestTypes } from './team-requests.type';

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
                throw validationResultReq;
            const [user, team] = validationResultReq;
            const checkUserOnTheTeam = this.teamsService.userOnTheTeam(user, team);
            if(checkUserOnTheTeam)
                throw new HttpException(400, 'This user is already on the team.');
            const id = await this.teamRequestsService.generateTeamRequestsId();
            const teamRequest = await this.teamRequestsService.createTeamRequest({
                ...dto, 
                id, 
                userId, 
                requestType: ETeamRequestTypes.JOIN_THE_TEAM, 
                status: ETeamRequestStatusType.AWAITING
            });
            return res.status(201).json(teamRequest);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error send joining to the team request.'});
        }
    }

    async leaveTheTeam(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const validationResultReq = await this.teamRequestsService.validateTeamRequestForCreation(userId!);
            if(validationResultReq instanceof HttpException)
                throw validationResultReq;
            const [user, team] = validationResultReq;
            const id = await this.teamRequestsService.generateTeamRequestsId();
            const teamRequest = await this.teamRequestsService.createTeamRequest({
                id, 
                userId, 
                requestType: ETeamRequestTypes.LEAVE_THE_TEAM, 
                status: ETeamRequestStatusType.AWAITING, 
                teamId: team.id
            });
            return res.status(201).json(teamRequest);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
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
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            const user = await this.usersService.getUserById(userId);
            if(!user)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            const getUsersAnAwaitingRequest = this.teamRequestsService.getUsersAnAwaitingRequest(user);
            if(!getUsersAnAwaitingRequest)
                throw new HttpException(400, `This team request is already verified.`);
            await this.teamRequestsService.deleteTeamRequest(getUsersAnAwaitingRequest);
            return res.json({message: 'Your team request was declined successfully.'})
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
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
                throw validationResultReq;
            const [user, team] = validationResultReq;
            const id = await this.teamRequestsService.generateTeamRequestsId();
            const teamRequest = await this.teamRequestsService.createTeamRequest({
                id, 
                userId, 
                requestType: ETeamRequestTypes.MANAGER_POST, 
                status: ETeamRequestStatusType.AWAITING, 
                teamId: team.id
            });
            return res.status(201).json(teamRequest);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
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
                throw validationResultReq;
            const [user, team] = validationResultReq;
            const id = await this.teamRequestsService.generateTeamRequestsId();
            const teamRequest = await this.teamRequestsService.createTeamRequest({
                id, 
                userId, 
                requestType: ETeamRequestTypes.MOVE_TO_ANOTHER_TEAM, 
                status: ETeamRequestStatusType.AWAITING, 
                teamId: team.id
            });
            const teamRequestApprovementId = await this.teamRequestApprovementsService.generateTeamRequestsApprovementId();
            await this.teamRequestApprovementsService.createTeamRequestApprovement({
                id: teamRequestApprovementId, 
                teamRequestId:teamRequest.id, 
                fromTeamId: user.teamId!, 
                toTeamId: dto.teamId
            });
            return res.status(201).json(teamRequest);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
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
                throw validationResultReq;
            let [user, team, teamRequest] = validationResultReq;
            const isAdmin = await this.usersService.isAdmin(user.id);
            if(teamRequest.requestType === ETeamRequestTypes.MANAGER_POST && !isAdmin)
                throw new HttpException(400, `You don't have access to accept this team request.`);
            if(teamRequest.teamRequestApprovement)
                teamRequest.teamRequestApprovement = await this.teamRequestApprovementsService.acceptApprovement(teamRequest.teamRequestApprovement, teamRequest, team);
            teamRequest = await this.teamRequestsService.acceptTeamRequest(teamRequest);
            const userForExecute = await this.usersService.getUserById(teamRequest.userId);
            if(!userForExecute)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            await this.teamRequestsService.executeRequest(teamRequest, team, userForExecute);
            return res.json(teamRequest);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
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
                throw validationResultReq;
            let [user, team, teamRequest] = validationResultReq;
            if(teamRequest.teamRequestApprovement)
                teamRequest.teamRequestApprovement = await this.teamRequestApprovementsService.declineApprovement(teamRequest.teamRequestApprovement, team);
            teamRequest = await this.teamRequestsService.declineTeamRequest(teamRequest);
            return res.json(teamRequest);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error declining team request.'});
        }
    }
}