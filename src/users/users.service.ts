import { Service } from "typedi";
import { v4 } from "uuid";
import { ProfilesService } from "../profiles/profiles.service";
import { Role } from "../roles/roles.model";
import { RolesService } from "../roles/roles.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./users.model";
import * as bcrypt from 'bcryptjs';
import { TeamRequest } from "../team-requests/team-requests.model";
import { RoleType } from "../roles/roles.type";
import { Ban } from "../bans/bans.model";
import { TeamsService } from "../teams/teams.service";

@Service()
export class UsersService {
    constructor(private rolesService: RolesService,
                private profilesService: ProfilesService,
                private teamsService: TeamsService){}
    async createUser(dto: CreateUserDto): Promise<User | null>{
        const role = await this.rolesService.getRoleByValue('PLAYER');
        if(!role)
            return null;
        const newUser = await User.create(dto);
        await newUser.$set('roles', [role?.id!]);
        newUser.roles = [role!];
        return newUser;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const user = await User.findOne({where:{email}});
        return user;
    }

    async getUserById(userId: string): Promise<User | null> {
        const user = await User.findByPk(userId, {include: [Role, TeamRequest, Ban]});
        return user;
    }

    async getAllUsers(): Promise<User[]>{
        const users = await User.findAll({include: [Role, TeamRequest]});
        return users;
    }

    async updateUser(dto: UpdateUserDto, userId: string): Promise<User | null>{
        const user = await this.getUserById(userId);
        if(!user)
            return null;
        let hashPassword: string | undefined = dto.password;
        if(dto.password)
            hashPassword = await bcrypt.hash(dto.password!, 5);
        await user.update({...dto, password: hashPassword});
        return user;
    }

    async deleteUser(userId: string): Promise<string | null> {
        const user = await this.getUserById(userId);
        if(!user)
            return null;
        if(user.avatar)
            this.profilesService.deleteFile(user.avatar);
        if(user.teamId){
            const team = await this.teamsService.getTeamById(user.teamId);
            if(team)
                await this.teamsService.kickUser(user, team);
        }
        await user.destroy();
        return userId;
    }

    async generateUserId(): Promise<string>{
        let user: User | null, id: string;
        do {
            id = v4();
            user = await User.findByPk(id);
        } while (user);
        return id;
    }

    isGoogleAccount(user: User): boolean{
        return Boolean(user.get('isGoogleAccount'));
    }

    async getUserByLogin(login: string): Promise<User | null> {
        const user = await User.findOne({where: {login}, include: [Ban]});
        return user;
    }

    async isAdmin(userId: string) {
        const user = await this.getUserById(userId);
        if(!user)
            return false;
        const adminRole: RoleType = "ADMIN";
        const role = await this.rolesService.getRoleByValue(adminRole);
        if(!role)
            return false;
        for (const userRole of user.roles)
            if(userRole.value === role.value)
                return true;
        return false;
    }

    async isBanned(user: User): Promise<Ban | null> {
        if(user.bans.length <= 0)
            return null;
        const lastBan = user.bans[user.bans.length - 1];
        if(lastBan.unBannedAt)
            return null;
        return lastBan;
    }
}