import { ETeamRequestStatusType, ETeamRequestTypes } from "../team-requests.type";

export interface CreateTeamRequestDto {
    id?: string;
    requestType?: ETeamRequestTypes;
    userId?: string;
    teamId: string;
    toTeamId?: string;
    status?: ETeamRequestStatusType;
}