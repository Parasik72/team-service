import { Service } from "typedi";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./users.model";

@Service()
export class UsersService {
    async createUser(dto: CreateUserDto): Promise<User>{
        const newUser = await User.create(dto);
        return newUser;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const user = await User.findOne({where:{email}});
        return user;
    }

    async getUserById(userId: number): Promise<User | null> {
        const user = await User.findByPk(userId);
        return user;
    }

    async getAllUsers(): Promise<User[]>{
        const users = await User.findAll();
        return users;
    }

    async updateUser(dto: UpdateUserDto, userId: number): Promise<User | null>{
        const user = await this.getUserById(userId);
        if(!user)
            return user;
        await user.update(dto);
        return user;
    }

    async deleteUser(userId: number): Promise<number | null> {
        const user = await this.getUserById(userId);
        if(!user)
            return user;
        await user.destroy();
        return userId;
    }
}