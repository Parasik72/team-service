import { Service } from "typedi";
import { Team } from "./teams.model";
import * as uuid from 'uuid';
import { CreateTeamDto } from "./dto/create-team.dto";
import { User } from "../users/users.model";
import { TeamRequest } from "../team-requests/team-requests.model";
import { UsersService } from "../users/users.service";
import { RolesService } from "../roles/roles.service";
import { TeamKick } from "../team-kicks/team-kicks.model";

@Service()
export class TeamsService {
    constructor(private usersService: UsersService,
                private rolesService: RolesService){}
    async getTeamByName(teamName: string): Promise<Team | null> {
        const team = await Team.findOne({where: {teamName}});
        return team;
    }

    async getTeamById(id: string): Promise<Team | null> {
        const team = await Team.findByPk(id, {include: [User]});
        return team;
    }

    async generateTeamId(): Promise<string> {
        let team: Team | null, id: string;
        do {
            id = uuid.v4();
            team = await Team.findByPk(id);
        } while (team);
        return id;
    }

    async createTeam(dto: CreateTeamDto): Promise<Team> {
        const team = await Team.create(dto);
        return team;
    }

    async addUserToTeam(user: User, team: Team): Promise<Team> {
        await team.$add('users', user);
        team.users.push(user);
        return team;
    }

    async getAll(): Promise<Team[]> {
        const teams = await Team.findAll({include: [User, TeamRequest, TeamKick]});
        return teams;
    }

    userOnTheTeam(user: User, team: Team): boolean {
        if(user.teamId && user.teamId === team.id)
            return true;
        return false;
    }

    async setManagerTeam(user: User, team: Team): Promise<Team | null> {
        team.managerId = user.id;
        const managerRole = await this.rolesService.getRoleByValue('MANAGER');
        if(!managerRole)
            return null;
        await this.rolesService.setRoleToUser(managerRole, user);
        await team.save();
        return team;
    }

    async unsetManagerTeam(user: User, team: Team): Promise<Team | null> {
        team.managerId = null;
        const managerRole = await this.rolesService.getRoleByValue('MANAGER');
        if(!managerRole)
            return null;
        await this.rolesService.unsetRoleFromUser(managerRole, user);
        await team.save();
        return team;
    }

    async getManagerTeam(team: Team): Promise<User | null> {
        if(!team.managerId)
            return null;
        const manager = await this.usersService.getUserById(team.managerId);
        if(!manager)
            return null;
        return manager;
    }

    async leaveTheTeam(user: User, team: Team): Promise<User> {
        if(team.managerId === user.id){
            team.managerId = null;
            await team.save();
        }
        user.teamId = null;
        await user.save();
        return user;
    }

    async moveToAnotherTeam(user: User, teamId: string): Promise<User | null> {
        const team = await Team.findByPk(teamId);
        if(!team)
            return null;
        user.teamId = team.id;
        await user.save();
        return user;
    }

    async kickUser(user: User, team: Team): Promise<User>{
        if(team.managerId === user.id)
            await this.unsetManagerTeam(user, team);
        user.teamId = null;
        await user.save();
        return user;
    }
}