import { TeamRequestStatusType, TeamRequestType } from "../team-requests.type";

export interface CreateTeamRequestDto {
    id?: string;
    requestType?: TeamRequestType;
    userId?: string;
    teamId: string;
    toTeamId?: string;
    status?: TeamRequestStatusType;
}