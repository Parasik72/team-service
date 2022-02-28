import dotenv from 'dotenv';
import path from 'path';
import supertest from 'supertest';
dotenv.config({path: path.resolve(__dirname, '../../.env.test')});
import Container from "typedi";
import { app } from '../app';
import { AuthService } from "../auth/auth.service";
import dbInstance from "../db/instantiate-sequelize";
import { Role } from "../roles/roles.model";
import { RolesService } from "../roles/roles.service";
import { RoleTypes } from "../roles/roles.type";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/users.model";
import { UsersService } from "../users/users.service";
import { GeneratorDto } from "./generate-dto";

describe('profiles', () => {
    const usersService = Container.get(UsersService);
    const authService = Container.get(AuthService);
    const rolesService = Container.get(RolesService);
    const gDto = new GeneratorDto('profiles');
    let adminToken: string;
    let playerToken: string;
    const createUser = async (userDto: CreateUserDto, role: string): Promise<[string, User, Role]> => {
        const userRole = await rolesService.getRoleByValue(role);
        let user = await usersService.createUser(userDto);
        user = await rolesService.setRoleToUser(userRole!, user!);
        const token = await authService.generateToken(user!);
        return [token, user, userRole!];
    }
    beforeAll(async () => {
        await dbInstance.sync();
        [playerToken] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
        [adminToken] = await createUser(gDto.generateUserDto(), RoleTypes.ADMIN);
    });
    describe('get your profile', () => {
        it('should return a user profile', async () => {
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const {body} = await supertest(app)
                .get('/profiles')
                .set("authorization", `Bearer ${userToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: user?.id,
                email: user?.email
            });
        });
        it('should return an user profile', async () => {
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.ADMIN);
            const {body} = await supertest(app)
                .get('/profiles')
                .set("authorization", `Bearer ${userToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: user?.id,
                email: user?.email
            });
        });
        it('should return a 401 status code', async () => {
            await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await supertest(app)
                .get('/profiles')
                .expect(401);
        });
    });
    describe('change an user profile', () => {
        it('should return a user profile ', async () => {
            const [userToken] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const data = gDto.generateChangeProfileDto();
            const {body} = await supertest(app)
                .patch('/profiles')
                .set("authorization", `Bearer ${userToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                avatar: data.avatar,
                login: data.login
            });
        });
        it('should return an user profile ', async () => {
            const [userToken] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const data = gDto.generateChangeProfileDto();
            const {body} = await supertest(app)
                .patch('/profiles')
                .set("authorization", `Bearer ${userToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                avatar: data.avatar,
                login: data.login
            });
        });
        it('should return a 401 status code ', async () => {
            await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const data = gDto.generateChangeProfileDto();
            await supertest(app)
                .patch('/profiles')
                .send(data)
                .expect(401);
        });
    });
});