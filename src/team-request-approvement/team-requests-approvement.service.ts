import { Service } from "typedi";
import { CreateTeamRequestApprovementDto } from "./dto/create-team-request-approvement.dto";
import { TeamRequest } from "../team-requests/team-requests.model";
import { Team } from "../teams/teams.model";
import { TeamRequestApprovement } from "./team-requests-approvement.model";
import * as uuid from 'uuid';

@Service()
export class TeamRequestApprovementsService {
    async acceptApprovement(teamRequestApprovement: TeamRequestApprovement, teamRequest: TeamRequest, team: Team): Promise<TeamRequestApprovement> {
        if(teamRequestApprovement.fromTeamId == team.id){
            teamRequestApprovement.fromTeamApprove = true;
            await teamRequestApprovement.save();
            teamRequest.teamId = teamRequestApprovement.toTeamId;
            await teamRequest.save();
            return teamRequestApprovement;
        }
        teamRequestApprovement.toTeamApprove = true;
        await teamRequestApprovement.save();
        teamRequest.teamId = teamRequestApprovement.fromTeamId;
        await teamRequest.save();
        return teamRequestApprovement;
    }

    async declineApprovement(teamRequestApprovement: TeamRequestApprovement, team: Team){
        if(teamRequestApprovement.fromTeamId == team.id){
            teamRequestApprovement.fromTeamApprove = false;
            await teamRequestApprovement.save();
            return teamRequestApprovement;
        }
        teamRequestApprovement.toTeamApprove = false;
        await teamRequestApprovement.save();
        return teamRequestApprovement;
    }

    async createTeamRequestApprovement(dto: CreateTeamRequestApprovementDto): Promise<TeamRequestApprovement> {
        return TeamRequestApprovement.create(dto);
    }

    async generateTeamRequestsApprovementId(): Promise<string> {
        let teamRequestApprovement: TeamRequestApprovement | null, id: string;
        do {
            id = uuid.v4();
            teamRequestApprovement = await TeamRequestApprovement.findByPk(id);
        } while (teamRequestApprovement);
        return id;
    }
}