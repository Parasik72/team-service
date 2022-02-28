import dotenv from 'dotenv';
import path from 'path';
dotenv.config({path: path.resolve(__dirname, '../../.env.test')});
import supertest from "supertest";
import Container from "typedi";
import { AuthService } from "../auth/auth.service";
import dbInstance from "../db/instantiate-sequelize";
import { RolesService } from "../roles/roles.service";
import { RoleTypes } from "../roles/roles.type";
import { CreateTeamDto } from "../teams/dto/create-team.dto";
import { SetManagerBodyDto } from "../teams/dto/set-manager.dto";
import { AddUserToTeamDto } from "../teams/dto/add-user-to-team.dto";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { TeamsService } from "../teams/teams.service";
import { UsersService } from "../users/users.service";
import { app } from '../app';
import { User } from '../users/users.model';
import { Role } from '../roles/roles.model';
import { GeneratorDto } from './generate-dto';
import { Team } from '../teams/teams.model';
import { CreateTeamKickDto } from '../team-kicks/dto/create-team-kick.dto';

describe('teams route', () => {
    const usersService = Container.get(UsersService);
    const authService = Container.get(AuthService);
    const rolesService = Container.get(RolesService);
    const teamsService = Container.get(TeamsService);
    const gDto = new GeneratorDto('teams');
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
        await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
        [adminToken] = await createUser(gDto.generateUserDto(), RoleTypes.ADMIN);
    });
    describe('create a team', () => {
        it('should return a team', async () => {
            const data: CreateTeamDto = {
                teamName: 'createteam1'
            };
            const {body} = await supertest(app)
                .post('/teams')
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
            expect(body).toMatchObject({
                teamName: data.teamName
            });
        });
        it('should return a team', async () => {
            const data: CreateTeamDto = {
                teamName: 'createteam2'
            };
            const {body} = await supertest(app)
                .post('/teams')
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(201);
            expect(body).toMatchObject({
                teamName: data.teamName
            });
        });
        it('should return a 400 status code', async () => {
            await supertest(app)
                .post('/teams')
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const data: CreateTeamDto = {
                teamName: 'createteam4'
            };
            await supertest(app)
                .post('/teams')
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const data: CreateTeamDto = {
                teamName: 'createteam5a'
            };
            await supertest(app)
                .post('/teams')
                .send(data)
                .expect(401);
        });
    });
    describe('set a manager', () => {
        it('should return a team information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            const data : SetManagerBodyDto = {
                userId: user?.id!
            }
            const {body} = await supertest(app)
                .post(`/teams/set-manager/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                id: team.id,
                managerId: user?.id!
            });
        });
        it('should return a team information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            const data : SetManagerBodyDto = {
                userId: user?.id!
            }
            const {body} = await supertest(app)
                .post(`/teams/set-manager/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                id: team.id,
                managerId: user?.id!
            });
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            await supertest(app)
                .post(`/teams/set-manager/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            const data : SetManagerBodyDto = {
                userId: user?.id!
            }
            await supertest(app)
                .post(`/teams/set-manager/${team.id}aa`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            const data : SetManagerBodyDto = {
                userId: user?.id! + 'aaa'
            }
            await supertest(app)
                .post(`/teams/set-manager/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            const data : SetManagerBodyDto = {
                userId: user?.id!
            }
            await supertest(app)
                .post(`/teams/set-manager/${team.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            const team = await teamsService.createTeam(dataTeam);
            const data : SetManagerBodyDto = {
                userId: user?.id!
            }
            await supertest(app)
                .post(`/teams/set-manager/${team.id}`)
                .send(data)
                .expect(401);
        });
    });
    describe('unset manager', () => {
        it('should return a team information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.setManagerTeam(user!, team);
            const {body} = await supertest(app)
                .post(`/teams/unset-manager/${team?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: team?.id,
                managerId: null
            });
        });
        it('should return a team information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.setManagerTeam(user!, team);
            const {body} = await supertest(app)
                .post(`/teams/unset-manager/${team?.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                id: team?.id,
                managerId: null
            });
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.setManagerTeam(user!, team);
            await supertest(app)
                .post(`/teams/unset-manager/${team?.id}aa`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.setManagerTeam(user!, team);
            await supertest(app)
                .post(`/teams/unset-manager/${team?.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto()
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.setManagerTeam(user!, team);
            await supertest(app)
                .post(`/teams/unset-manager/${team?.id}`)
                .expect(401);
        });
    });
    describe('kick a user from a team', () => {
        it('should return a team kick information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await teamsService.managerPost(manager!, team);
            team = await teamsService.addUserToTeam(user!, team!);
            const teamKick: CreateTeamKickDto = {
                userId: user?.id!,
                kickReason: 'At will'
            };
            const {body} = await supertest(app)
                .post(`/teams/kick`)
                .set("authorization", `Bearer ${managerToken}`)
                .send(teamKick)
                .expect(200);
            expect(body).toMatchObject({
                userId: user?.id!,
                kickedBy: manager.id
            });
        });
        it('should return a team kick information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await teamsService.managerPost(manager!, team);
            team = await teamsService.addUserToTeam(user!, team!);
            const teamKick: CreateTeamKickDto = {
                userId: user?.id!,
                kickReason: 'At will'
            };
            const {body} = await supertest(app)
                .post(`/teams/kick`)
                .set("authorization", `Bearer ${managerToken}`)
                .send(teamKick)
                .expect(200);
            expect(body).toMatchObject({
                userId: user?.id!,
                kickedBy: manager.id
            });
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await teamsService.managerPost(manager!, team);
            team = await teamsService.addUserToTeam(user!, team!);
            const teamKick: CreateTeamKickDto = {
                userId: user?.id! + 'aaa',
                kickReason: 'At will'
            };
            await supertest(app)
                .post(`/teams/kick`)
                .set("authorization", `Bearer ${managerToken}`)
                .send(teamKick)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await teamsService.managerPost(manager!, team);
            team = await teamsService.addUserToTeam(user!, team!);
            await supertest(app)
                .post(`/teams/kick`)
                .set("authorization", `Bearer ${managerToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await teamsService.managerPost(manager!, team);
            team = await teamsService.addUserToTeam(user!, team!);
            const teamKick: CreateTeamKickDto = {
                userId: user?.id! + 'aaa',
                kickReason: 'At will'
            };
            await supertest(app)
                .post(`/teams/kick`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(teamKick)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await teamsService.managerPost(manager!, team);
            team = await teamsService.addUserToTeam(user!, team!);
            const teamKick: CreateTeamKickDto = {
                userId: user?.id! + 'aaa',
                kickReason: 'At will'
            };
            await supertest(app)
                .post(`/teams/kick`)
                .send(teamKick)
                .expect(401);
        });
    });
    describe('add user to team', () => {
        it('should return a team information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            const data: AddUserToTeamDto = {
                userId: user?.id!
            };
            const {body} = await supertest(app)
                .post(`/teams/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                teamName: team.teamName
            });
        });
        it('should return a team information', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            const data: AddUserToTeamDto = {
                userId: user?.id!
            };
            const {body} = await supertest(app)
                .post(`/teams/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200);
            expect(body).toMatchObject({
                teamName: team.teamName
            });
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            const data: AddUserToTeamDto = {
                userId: user?.id! + 'aaa'
            };
            await supertest(app)
                .post(`/teams/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await supertest(app)
                .post(`/teams/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            const data: AddUserToTeamDto = {
                userId: user?.id!
            };
            await supertest(app)
                .post(`/teams/${team.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .send(data)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataUser: CreateUserDto = gDto.generateUserDto();
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const user = await usersService.createUser(dataUser);
            let team: Team | null = await teamsService.createTeam(dataTeam);
            const data: AddUserToTeamDto = {
                userId: user?.id!
            };
            await supertest(app)
                .post(`/teams/${team.id}`)
                .send(data)
                .expect(401);
        });
    });
    describe('get your team', () => {
        it('should return a team information', async () => {
            const [playerToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.addUserToTeam(user!, team!);
            const {body} = await supertest(app)
                .get(`/teams`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(200);
            expect(body).toMatchObject({
                teamName: team.teamName
            });
        });
        it('should return a team information', async () => {
            const [playerToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.addUserToTeam(user!, team!);
            const {body} = await supertest(app)
                .get(`/teams`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(200);
            expect(body).toMatchObject({
                teamName: team.teamName
            });
        });
        it('should return a 400 status code', async () => {
            const [playerToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team: Team | null = await teamsService.createTeam(dataTeam);
            await supertest(app)
                .get(`/teams`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(400);
        });
        it('should return a 401 status code', async () => {
            const [playerToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team: Team | null = await teamsService.createTeam(dataTeam);
            team = await teamsService.addUserToTeam(user!, team!);
            await supertest(app)
                .get(`/teams`)
                .expect(401);
        });
    });
    describe('get all teams', () => {
        it('should return all teams', async () => {
            await supertest(app)
                .get(`/teams/all`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return all teams', async () => {
            await supertest(app)
                .get(`/teams/all`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(200);
        });
        it('should return a 401 status code', async () => {
            await supertest(app)
                .get(`/teams/all`)
                .expect(401);
        });
    });
    describe('get a team by id', () => {
        it('should return a team information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const team: Team | null = await teamsService.createTeam(dataTeam);
            await supertest(app)
                .get(`/teams/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return a team information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const team: Team | null = await teamsService.createTeam(dataTeam);
            await supertest(app)
                .get(`/teams/${team.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(200);
        });
        it('should return a 400 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const team: Team | null = await teamsService.createTeam(dataTeam);
            await supertest(app)
                .get(`/teams/${team.id}aaa`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const team: Team | null = await teamsService.createTeam(dataTeam);
            await supertest(app)
                .get(`/teams/${team.id}`)
                .expect(401);
        });
    });
});