import { Service } from "typedi";
import { v4 } from "uuid";
import { ProfilesService } from "../profiles/profiles.service";
import { Role } from "../roles/roles.model";
import { RolesService } from "../roles/roles.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./users.model";
import { TeamRequest } from "../team-requests/team-requests.model";
import { RoleType } from "../roles/roles.type";
import { Ban } from "../bans/bans.model";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Service()
export class UsersService {
    constructor(private rolesService: RolesService,
                private profilesService: ProfilesService){}
    async createUser(dto: CreateUserDto): Promise<User | null>{
        const role = await this.rolesService.getRoleByValue('PLAYER');
        if(!role)
            return null;
        const newUser = await User.create({...dto, roleId: role.id});
        newUser.role = role;
        return newUser;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return User.findOne({where:{email}, include: [Role]});
    }

    async getUserById(userId: string): Promise<User | null> {
        return User.findByPk(userId, {include: [Role, TeamRequest, Ban], attributes: {exclude: ['password']}});
    }

    async gerUserByIdWithPassword(userId: string): Promise<User | null> {
        return User.findByPk(userId, {include: [Role, TeamRequest, Ban]});
    }

    async getAllUsers(): Promise<User[]>{
        return User.findAll({include: [Role, TeamRequest], attributes: {exclude: ['password']}});
    }

    async updateUser(dto: UpdateUserDto | ChangePasswordDto, user: User): Promise<User>{
        await user.update(dto);
        return user;
    }

    async deleteUser(userId: string): Promise<string | null> {
        const user = await this.getUserById(userId);
        if(!user)
            return null;
        if(user.avatar)
            this.profilesService.deleteFile(user.avatar);
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
        return User.findOne({where: {login}, include: [Ban, Role]});
    }

    async isAdmin(userId: string) {
        const user = await this.getUserById(userId);
        if(!user)
            return false;
        const adminRole: RoleType = "ADMIN";
        const role = await this.rolesService.getRoleByValue(adminRole);
        if(!role)
            return false;
        if(user.role.value === role.value)
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

    async setGoogleUser(user: User){
        user.set('isGoogleAccount', true);
        await user.save();
    }
}