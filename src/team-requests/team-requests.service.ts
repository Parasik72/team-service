import { Service } from "typedi";
import { CreateTeamRequestDto } from "./dto/create-team-request.dto";
import { TeamRequest } from "./team-requests.model";
import * as uuid from 'uuid';
import { User } from "../users/users.model";
import { ETeamRequestStatusType, ETeamRequestTypes } from "./team-requests.type";
import { TeamRequestApprovement } from "../team-request-approvement/team-requests-approvement.model";
import { Team } from "../teams/teams.model";
import { TeamsService } from "../teams/teams.service";
import { UsersService } from "../users/users.service";
import { HttpException, HttpExceptionMessages } from "../exceptions/HttpException";
import { AcceptReqeustParamsDto } from "./dto/accept-request.dto";
import { DeclineReqeustParamsDto } from "./dto/decline-request.dto";

@Service()
export class TeamRequestsService {
    constructor(private teamsService: TeamsService,
                private usersService: UsersService){}
    async createTeamRequest(dto: CreateTeamRequestDto): Promise<TeamRequest> {
        return TeamRequest.create(dto);
    }

    async getAllTeamRequests(): Promise<TeamRequest[]> {
        return TeamRequest.findAll();
    }

    async generateTeamRequestsId(): Promise<string> {
        let teamRequest: TeamRequest | null, id: string;
        do {
            id = uuid.v4();
            teamRequest = await TeamRequest.findByPk(id);
        } while (teamRequest);
        return id;
    }

    async deleteTeamRequest(teamRequest: TeamRequest): Promise<void> {
        if(teamRequest.teamRequestApprovement)
            await teamRequest.teamRequestApprovement.destroy();
        await teamRequest.destroy();
        return;
    }

    async getTeamRequestById(id: string): Promise<TeamRequest | null> {
        return TeamRequest.findByPk(id, {include: [TeamRequestApprovement]});
    }

    canUserSendAReqeust(user: User): boolean {
        if(user.teamRequests.length <= 0)
            return true;
        const lastRequest = user.teamRequests[user.teamRequests.length - 1];
        if(lastRequest.status !== ETeamRequestStatusType.AWAITING)
            return true;
        return false;
    }

    getUsersAnAwaitingRequest(user: User): TeamRequest | null {
        if(user.teamRequests.length <= 0)
            return null;
        const lastRequest = user.teamRequests[user.teamRequests.length - 1];
        if(lastRequest.status !== ETeamRequestStatusType.AWAITING)
            return null;
        return lastRequest;
    }

    isTeamRequestVerified(teamRequest: TeamRequest): boolean{
        return teamRequest.status !== ETeamRequestStatusType.AWAITING;
    }

    async acceptTeamRequest(teamRequest: TeamRequest): Promise<TeamRequest> {
        const teamRequestApprovement = teamRequest.teamRequestApprovement;
        if(!teamRequestApprovement || 
            (teamRequestApprovement.fromTeamApprove && teamRequestApprovement.toTeamApprove)) {
                teamRequest.status = ETeamRequestStatusType.ACCEPTED;
                await teamRequest.save();
            }
        return teamRequest;
    }

    async declineTeamRequest(teamRequest: TeamRequest): Promise<TeamRequest> {
        teamRequest.status = ETeamRequestStatusType.DECLINED;
        await teamRequest.save();
        return teamRequest;
    }

    async executeRequest(teamRequest: TeamRequest, team: Team, user: User): Promise<void> {
        if(teamRequest.status !== ETeamRequestStatusType.ACCEPTED)
            return;
        switch (teamRequest.requestType) {
            case ETeamRequestTypes.JOIN_THE_TEAM:
                await this.teamsService.addUserToTeam(user, team);
                break;
            case ETeamRequestTypes.LEAVE_THE_TEAM:
                await this.teamsService.leaveTheTeam(user, team);
                break;
            case ETeamRequestTypes.MOVE_TO_ANOTHER_TEAM:
                await this.teamsService.moveToAnotherTeam(user, teamRequest.teamRequestApprovement.toTeamId);
                break;
            case ETeamRequestTypes.MANAGER_POST:
                await this.teamsService.managerPost(user, team);
                break;
            default:
                return;
        }
    }

    async validateTeamRequestForCreation(userId: string | undefined, teamId?: string): Promise<[User, Team] | HttpException>{
        if(!userId)
            return new HttpException(400, HttpExceptionMessages.UserWasNotFound);
        const user = await this.usersService.getUserById(userId);
        if(!user)
            return new HttpException(400, HttpExceptionMessages.UserWasNotFound);
        const team = await this.teamsService.getTeamById(teamId ? teamId : user.teamId!);
        if(!team)
            return new HttpException(400, HttpExceptionMessages.TeamWasNotFound);
        const canUserSendAReqeust = this.canUserSendAReqeust(user);
        if(!canUserSendAReqeust)
            return new HttpException(400, 'This user has already an awaiting team request.');
        return [user, team];
    }

    async validateTeamRequestForAcceptingOrDeclining(userId: string, dtoParams: AcceptReqeustParamsDto | DeclineReqeustParamsDto): 
    Promise<[User, Team, TeamRequest] | HttpException>{
        if(!userId)
            return new HttpException(400, HttpExceptionMessages.UserWasNotFound);
        const user = await this.usersService.getUserById(userId);
        if(!user)
            return new HttpException(400, HttpExceptionMessages.UserWasNotFound);
        const isAdmin = await this.usersService.isAdmin(user.id);
        if(!user.teamId && !isAdmin)
            return new HttpException(400, HttpExceptionMessages.TeamWasNotFound);
        let team = await this.teamsService.getTeamById(user.teamId!);
        if(!team && !isAdmin)
            return new HttpException(400, HttpExceptionMessages.TeamWasNotFound);
        let teamRequest = await this.getTeamRequestById(dtoParams?.teamRequestId!);
        if(!teamRequest)
            return new HttpException(400, 'The team request was not found.');
        if(isAdmin)
            team = await this.teamsService.getTeamById(teamRequest.teamId);
        if(!team)
            return new HttpException(400, HttpExceptionMessages.TeamWasNotFound);
        const isTeamRequestVerified = this.isTeamRequestVerified(teamRequest);
        if(isTeamRequestVerified)
            return new HttpException(400, 'This team request is already verified.');
        if(teamRequest.teamId !== team.id)
            return new HttpException(400, `You don't have access to accept this team request.`);
        return [user, team, teamRequest];
    }
}