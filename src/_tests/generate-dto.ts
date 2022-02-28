import { ETeamRequestStatusType, ETeamRequestTypes } from "../team-requests/team-requests.type";
import { RoleTypes } from '../roles/roles.type';

export class GeneratorDto{
    constructor(private prefix: string, 
                private userIndex = 0, 
                private banIndex = 0,
                private teamIndex = 0,
                private teamRequestIndex = 0,
                private teamRequestApprovementIndex = 0,
                private roleIndex = 0,
                private changeProfileIndex = 0){}
    generateUserDto() {
        ++this.userIndex;
        return {
            email: `${this.prefix}user${this.userIndex}@test.com`,
            login: `${this.prefix}user${this.userIndex}`,
            password: `${this.prefix}user${this.userIndex}`,
            firstName: "User",
            lastName: "User",
            id: `${this.prefix}user${this.userIndex}`
        }
    }
    generateBanDto(bannedById: string, bannedId: string) {
        ++this.banIndex;
        return {
            id: `${this.prefix}ban${this.banIndex}`,
            banReason: 'Spam',
            bannedBy: bannedById,
            userId: bannedId
        }
    }
    generateTeamDto() {
        ++this.teamIndex;
        return {
            teamName: `${this.prefix}team${this.teamIndex}`,
            id: `${this.prefix}team${this.teamIndex}`
        }
    }
    generateTeamRequestDto(requestType: ETeamRequestTypes, userId: string, teamId: string, toTeamId: string | undefined = undefined) {
        ++this.teamRequestIndex;
        return {
            id: `${this.prefix}teamRequest${this.teamRequestIndex}`,
            requestType,
            userId,
            teamId,
            toTeamId,
            status: ETeamRequestStatusType.AWAITING,
        }
    }
    generateTeamRequestApprovementDto(teamRequestId: string, fromTeamId: string, toTeamId: string) {
        ++this.teamRequestApprovementIndex;
        return {
            id: `${this.prefix}teamRequestApprovement${this.teamRequestApprovementIndex}`,
            teamRequestId,
            fromTeamId,
            toTeamId
        }
    }
    generateRoleDto(roleType: RoleTypes){
        ++this.roleIndex;
        return {
            id: `${this.prefix}role${this.roleIndex}`,
            value: this.prefix + roleType + this.roleIndex
        }
    }
    generateChangeProfileDto(){
        ++this.changeProfileIndex;
        return {
            avatar: `avatar.png`,
            login: `${this.prefix}newlogin${this.changeProfileIndex}`,
            password: 'newpassword'
        }
    }
};