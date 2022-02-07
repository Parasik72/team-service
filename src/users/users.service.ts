import { Service } from "typedi";
import { v4 } from "uuid";
import { Role } from "../roles/roles.model";
import { RolesService } from "../roles/roles.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./users.model";

@Service()
export class UsersService {
    constructor(private rolesService: RolesService){}
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
        const user = await User.findByPk(userId);
        return user;
    }

    async getAllUsers(): Promise<User[]>{
        const users = await User.findAll({include: [Role]});
        return users;
    }

    async updateUser(dto: UpdateUserDto, userId: string): Promise<User | null>{
        const user = await this.getUserById(userId);
        if(!user)
            return user;
        await user.update(dto);
        return user;
    }

    async deleteUser(userId: string): Promise<string | null> {
        const user = await this.getUserById(userId);
        if(!user)
            return user;
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
}