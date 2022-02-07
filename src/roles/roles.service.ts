import { Service } from "typedi";
import { v4 } from "uuid";
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
}