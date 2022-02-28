import dotenv from 'dotenv';
import path from 'path';
dotenv.config({path: path.resolve(__dirname, '../../.env.test')});
import supertest from 'supertest';
import Container from 'typedi';
import { AuthService } from '../auth/auth.service';
import dbInstance from '../db/instantiate-sequelize';
import { RolesService } from '../roles/roles.service';
import { RoleTypes } from '../roles/roles.type';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { CreateBanDto } from '../bans/dto/create-ban.dto';
import { UsersService } from '../users/users.service';
import { BansService } from '../bans/bans.service';
import * as bcrypt from 'bcryptjs';
import { app } from '../app';
import { User } from '../users/users.model';
import { Role } from '../roles/roles.model';
import { GeneratorDto } from './generate-dto';

describe('users route', () => {
    const usersService = Container.get(UsersService);
    const authService = Container.get(AuthService);
    const rolesService = Container.get(RolesService);
    const bansService = Container.get(BansService);
    const gDto = new GeneratorDto('users');
    let adminToken: string;
    let playerToken: string;
    let playerUser: User;
    let adminUser: User;
    const createUser = async (userDto: CreateUserDto, role: string): Promise<[string, User, Role]> => {
        const userRole = await rolesService.getRoleByValue(role);
        let user = await usersService.createUser(userDto);
        user = await rolesService.setRoleToUser(userRole!, user!);
        const token = await authService.generateToken(user!);
        return [token, user, userRole!];
    }
    beforeAll(async () => {
        await dbInstance.sync();
        [playerToken, playerUser] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
        [adminToken, adminUser] = await createUser(gDto.generateUserDto(), RoleTypes.ADMIN);
    });
    describe('create an user', () => {
        it('should return an user', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const {body} = await supertest(app)
                .post('/users')
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
            expect(body).toMatchObject({
                email: data.email,
                login: data.login,
                firstName: data.firstName,
                lastName: data.lastName
            });
        });
        it('should return an user', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const {body} = await supertest(app)
                .post('/users')
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
            expect(body).toMatchObject({
                email: data.email,
                login: data.login,
                firstName: data.firstName,
                lastName: data.lastName
            });
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            data.firstName = '';
            await supertest(app)
                .post('/users')
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            await usersService.createUser(data);
            await supertest(app)
                .post('/users')
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 401 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            await supertest(app)
                .post('/users')
                .send(data)
                .expect(401);
        });
        it('should return a 403 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            await supertest(app)
                .post('/users')
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
    });
    describe('ban an user', () => {
        it('should return a ban user info', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const ban: CreateBanDto = {
                banReason: 'Spam'
            } 
            const banUser = await usersService.createUser(data);
            const {body} = await supertest(app)
                .post(`/users/ban/${banUser?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(ban)
                .expect(200);
            expect(body).toMatchObject({
                userId: banUser?.id,
                banReason: ban.banReason
            });
        });
        it('should return a ban user info', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const ban: CreateBanDto = {
                banReason: 'Hax'
            } 
            const banUser = await usersService.createUser(data);
            const {body} = await supertest(app)
                .post(`/users/ban/${banUser?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(ban)
                .expect(200);
            expect(body).toMatchObject({
                userId: banUser?.id,
                banReason: ban.banReason
            });
        });
        it('should return a 400 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const ban: CreateBanDto = {
                banReason: 'Hax'
            } 
            const banUser = await usersService.createUser(data);
            await supertest(app)
                .post(`/users/ban/${banUser?.id}aaa`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(ban)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const banUser = await usersService.createUser(data);
            await supertest(app)
                .post(`/users/ban/${banUser?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send({})
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const ban: CreateBanDto = {
                banReason: 'Hax'
            } 
            const banUser = await usersService.createUser(data);
            await supertest(app)
                .post(`/users/ban/${banUser?.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(ban)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const data: CreateUserDto = gDto.generateUserDto();
            const ban: CreateBanDto = {
                banReason: 'Hax'
            } 
            const banUser = await usersService.createUser(data);
            await supertest(app)
                .post(`/users/ban/${banUser?.id}`)
                .send(ban)
                .expect(401);
        });
    });
    describe('unban an user by id', () => {
        it('should return unban info', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const banDto: CreateBanDto = gDto.generateBanDto(adminUser.id!, userData.id!);
            const unbanUser = await usersService.createUser(userData);
            const ban = await bansService.createBan(banDto);
            const {body} = await supertest(app)
                .get(`/users/unban/${unbanUser?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: ban.id,
                banReason: ban.banReason,
                bannedBy: adminUser.id,
                userId: unbanUser?.id
            });
        });
        it('should return unban info', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const banDto: CreateBanDto = gDto.generateBanDto(adminUser.id!, userData.id!);
            const unbanUser = await usersService.createUser(userData);
            const ban = await bansService.createBan(banDto);
            const {body} = await supertest(app)
                .get(`/users/unban/${unbanUser?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: ban.id,
                banReason: ban.banReason,
                bannedBy: adminUser.id,
                userId: unbanUser?.id
            });
        });
        it('should return a 400 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const banDto: CreateBanDto = gDto.generateBanDto(adminUser.id!, userData.id!);
            const unbanUser = await usersService.createUser(userData);
            await bansService.createBan(banDto);
            await supertest(app)
                .get(`/users/unban/${unbanUser?.id}aaa`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const banDto: CreateBanDto = gDto.generateBanDto(adminUser.id!, userData.id!);
            const unbanUser = await usersService.createUser(userData);
            await bansService.createBan(banDto);
            await supertest(app)
                .get(`/users/unban/${unbanUser?.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const banDto: CreateBanDto = gDto.generateBanDto(adminUser.id!, userData.id!);
            const unbanUser = await usersService.createUser(userData);
            await bansService.createBan(banDto);
            await supertest(app)
                .get(`/users/unban/${unbanUser?.id}`)
                .expect(401);
        });
    });
    describe('get all users', () => {
        it('should return all users', async () => {
            await supertest(app)
                .get('/users/')
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return a 403 status code', async () => {
            await supertest(app)
                .get('/users/')
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            await supertest(app)
                .get('/users/')
                .expect(401);
        });
    });
    describe('get an user by id', () => {
        it('should return user', async () => {
            const {body} = await supertest(app)
                .get(`/users/${playerUser.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: playerUser.id,
                roleId: playerUser.roleId
            });
        });
        it('should return 400 status code', async () => {
            await supertest(app)
                .get(`/users/${playerUser.id}a`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            await supertest(app)
                .get(`/users/${playerUser.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            await supertest(app)
                .get(`/users/${playerUser.id}`)
                .expect(401);
        });
    });
    describe('update an user', () => {
        it('should return an updated user', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: UpdateUserDto = {
                firstName: 'Newfirstname'
            };
            const user = await usersService.createUser(userData);
            const {body} = await supertest(app)
                .patch(`/users/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                id: user?.id,
                firstName: data.firstName
            });
        });
        it('should return an updated user', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: UpdateUserDto = {
                firstName: 'Newfirstname',
                lastName: 'Newlastname'
            };
            const user = await usersService.createUser(userData);
            const {body} = await supertest(app)
                .patch(`/users/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                id: user?.id,
                firstName: data.firstName,
                lastName: data.lastName
            });
        });
        it('should return a 400 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: UpdateUserDto = {
                firstName: 'Newfirstname123',
                lastName: 'Newlastname'
            };
            const user = await usersService.createUser(userData);
            await supertest(app)
                .patch(`/users/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: UpdateUserDto = {
                firstName: 'Newfirstname',
                lastName: 'Newlastname'
            };
            const user = await usersService.createUser(userData);
            await supertest(app)
                .patch(`/users/${user?.id}aaa`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: UpdateUserDto = {
                firstName: 'Newfirstname',
                lastName: 'Newlastname'
            };
            const user = await usersService.createUser(userData);
            await supertest(app)
                .patch(`/users/${user?.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: UpdateUserDto = {
                firstName: 'Newfirstname',
                lastName: 'Newlastname'
            };
            const user = await usersService.createUser(userData);
            await supertest(app)
                .patch(`/users/${user?.id}`)
                .send(data)
                .expect(401);
        });
    });
    describe('change a pass user', () => {
        it('should return an updated user', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: ChangePasswordDto = {
                password: 'newpass'
            }
            const user = await usersService.createUser(userData);
            let {body} = await supertest(app)
                .patch(`/users/change-pass/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            const password = await bcrypt.compare(data.password, body.password);
            expect({...body, password}).toMatchObject({
                id: user?.id,
                password: true
            });
        });
        it('should return an updated user', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: ChangePasswordDto = {
                password: 'newpass'
            }
            const user = await usersService.createUser(userData);
            let {body} = await supertest(app)
                .patch(`/users/change-pass/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            const password = await bcrypt.compare(data.password, body.password);
            expect({...body, password}).toMatchObject({
                id: user?.id,
                password: true
            });
        });
        it('should return a 400 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const user = await usersService.createUser(userData);
            await supertest(app)
                .patch(`/users/change-pass/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return an updated user', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: ChangePasswordDto = {
                password: 'newpass'
            }
            const user = await usersService.createUser(userData);
            await supertest(app)
                .patch(`/users/change-pass/${user?.id}a`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: ChangePasswordDto = {
                password: 'newpass'
            }
            const user = await usersService.createUser(userData);
            await supertest(app)
                .patch(`/users/change-pass/${user?.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const data: ChangePasswordDto = {
                password: 'newpass'
            }
            const user = await usersService.createUser(userData);
            await supertest(app)
                .patch(`/users/change-pass/${user?.id}`)
                .send(data)
                .expect(401);
        });
    });
    describe('delete an user' , () => {
        it('should return an information message', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const user = await usersService.createUser(userData);
            await supertest(app)
                .delete(`/users/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return an information message', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const user = await usersService.createUser(userData);
            await supertest(app)
                .delete(`/users/${user?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return a 400 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const user = await usersService.createUser(userData);
            await supertest(app)
                .delete(`/users/${user?.id}aa`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const user = await usersService.createUser(userData);
            await supertest(app)
                .delete(`/users/${user?.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const userData: CreateUserDto = gDto.generateUserDto();
            const user = await usersService.createUser(userData);
            await supertest(app)
                .delete(`/users/${user?.id}`)
                .expect(401);
        });
    })
});