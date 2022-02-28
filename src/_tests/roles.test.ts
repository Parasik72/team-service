import dotenv from 'dotenv';
import path from 'path';
dotenv.config({path: path.resolve(__dirname, '../../.env.test')});
import supertest from "supertest";
import Container from "typedi";
import { app } from "../app";
import { AuthService } from "../auth/auth.service";
import dbInstance from "../db/instantiate-sequelize";
import { CreateRoleDto } from "../roles/dto/create-role.dto";
import { Role } from "../roles/roles.model";
import { RolesService } from "../roles/roles.service";
import { RoleTypes } from "../roles/roles.type";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/users.model";
import { UsersService } from "../users/users.service";
import { GeneratorDto } from "./generate-dto";

describe('roles', () => {
    const usersService = Container.get(UsersService);
    const authService = Container.get(AuthService);
    const rolesService = Container.get(RolesService);
    const gDto = new GeneratorDto('roles');
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
    describe('create role', () => {
        it('should return a role', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.PLAYER);
            await supertest(app)
                .post(`/roles/create`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
        });
        it('should return a role', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.MANAGER);
            await supertest(app)
                .post(`/roles/create`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
        });
        it('should return a role', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.ADMIN);
            await supertest(app)
                .post(`/roles/create`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
        });
        it('should return a 400 status code', async () => {
            await supertest(app)
                .post(`/roles/create`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.ADMIN);
            await supertest(app)
                .post(`/roles/create`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.ADMIN);
            await supertest(app)
                .post(`/roles/create`)
                .send(data)
                .expect(401);
        });
    });
    describe('get all roles', () => {
        it('should return all roles', async () => {
            await supertest(app)
                .get(`/roles/all`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return a 403 status code', async () => {
            await supertest(app)
                .get(`/roles/all`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            await supertest(app)
                .get(`/roles/all`)
                .expect(401);
        });
    });
    describe('delete role by value', () => {
        it('should return a deleted role information', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.ADMIN);
            const role = await rolesService.createRole(data);
            const {body} = await supertest(app)
                .delete(`/roles/delete/${role.value}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toEqual(role.value);
        });
        it('should return a deleted role information', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.PLAYER);
            const role = await rolesService.createRole(data);
            const {body} = await supertest(app)
                .delete(`/roles/delete/${role.value}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toEqual(role.value);
        });
        it('should return a 400 status code', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.ADMIN);
            const role = await rolesService.createRole(data);
            await supertest(app)
                .delete(`/roles/delete/${role.value}aaa`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.PLAYER);
            const role = await rolesService.createRole(data);
            await supertest(app)
                .delete(`/roles/delete/${role.value}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const data: CreateRoleDto = gDto.generateRoleDto(RoleTypes.PLAYER);
            const role = await rolesService.createRole(data);
            await supertest(app)
                .delete(`/roles/delete/${role.value}`)
                .expect(401);
        });
    });
});