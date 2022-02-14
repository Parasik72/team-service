import { Service } from "typedi";
import { v4 } from "uuid";
import { User } from "../users/users.model";
import { CreateRoleDto } from "./dto/create-role.dto";
import { Role } from "./roles.model";

@Service()
export class RolesService {
    async generateRoleId(): Promise<string>{
        let role: Role | null, id: string;
        do {
            id = v4();
            role = await Role.findByPk(id);
        } while (role);
        return id;
    }

    async createRole(dto: CreateRoleDto): Promise<Role> {
        const role = await Role.create(dto);
        return role;
    }

    async getRoleByValue(value: string): Promise<Role | null> {
        const role = await Role.findOne({where: {value}});
        return role;
    }

    async getAllRoles(): Promise<Role[]> {
        const roles = await Role.findAll();
        return roles;
    }

    async deleteRoleByValue(value: string): Promise<string | null> {
        const role = await Role.findOne({where: {value}});
        if(!role)
            return null;
        await role.destroy();
        return value;
    }

    async setRoleToUser(role: Role, user: User): Promise<User> {
        await user.$add('roles', role);
        if(user.roles)
            user.roles.push(role);
        else
            user.roles = [role];
        return user;
    }

    async unsetRoleFromUser(role: Role, user: User): Promise<User> {
        user.roles = user.roles.filter(roleItem => roleItem.value !== role.value);
        await user.save();
        return user;
    }
}