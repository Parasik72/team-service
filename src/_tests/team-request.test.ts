import dotenv from 'dotenv';
import path from 'path';
dotenv.config({path: path.resolve(__dirname, '../../.env.test')});
import supertest from "supertest";
import Container from 'typedi';
import { app } from '../app';
import { AuthService } from '../auth/auth.service';
import dbInstance from '../db/instantiate-sequelize';
import { Role } from '../roles/roles.model';
import { RolesService } from '../roles/roles.service';
import { RoleTypes } from '../roles/roles.type';
import { TeamRequestApprovementsService } from '../team-request-approvement/team-requests-approvement.service';
import { CreateTeamRequestDto } from '../team-requests/dto/create-team-request.dto';
import { TeamRequestsService } from '../team-requests/team-requests.service';
import { ETeamRequestStatusType, ETeamRequestTypes } from '../team-requests/team-requests.type';
import { CreateTeamDto } from '../teams/dto/create-team.dto';
import { TeamsService } from '../teams/teams.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/users.model';
import { UsersService } from '../users/users.service';
import { GeneratorDto } from './generate-dto';

describe('team requests', () => {
    const usersService = Container.get(UsersService);
    const authService = Container.get(AuthService);
    const rolesService = Container.get(RolesService);
    const teamsService = Container.get(TeamsService);
    const teamRequestsService = Container.get(TeamRequestsService);
    const teamRequestApprovementsService = Container.get(TeamRequestApprovementsService);
    const gDto = new GeneratorDto('team-requests');
    let adminToken: string;
    let playerToken: string;
    let managerToken: string;
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
        [managerToken] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
        [adminToken] = await createUser(gDto.generateUserDto(), RoleTypes.ADMIN);
    });
    describe('join the team', () => {
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const team = await teamsService.createTeam(dataTeam);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            const {body} = await supertest(app)
                .post(`/team-requests/join-the-team`)
                .set("authorization", `Bearer ${userToken}`)
                .send(teamRequest)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const team = await teamsService.createTeam(dataTeam);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            const {body} = await supertest(app)
                .post(`/team-requests/join-the-team`)
                .set("authorization", `Bearer ${userToken}`)
                .send(teamRequest)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a 400 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const team = await teamsService.createTeam(dataTeam);
            await supertest(app)
                .post(`/team-requests/join-the-team`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const team = await teamsService.createTeam(dataTeam);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            await supertest(app)
                .post(`/team-requests/join-the-team`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(teamRequest)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const team = await teamsService.createTeam(dataTeam);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            }
            await supertest(app)
                .post(`/team-requests/join-the-team`)
                .send(teamRequest)
                .expect(401);
        });
    });
    describe('move to another team', () => {
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            const {body} = await supertest(app)
                .post(`/team-requests/move-to-another-team`)
                .set("authorization", `Bearer ${userToken}`)
                .send(teamRequest)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            const {body} = await supertest(app)
                .post(`/team-requests/move-to-another-team`)
                .set("authorization", `Bearer ${userToken}`)
                .send(teamRequest)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a 400 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            await supertest(app)
                .post(`/team-requests/move-to-another-team`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            await supertest(app)
                .post(`/team-requests/move-to-another-team`)
                .set("authorization", `Bearer ${adminToken}`)
                .send(teamRequest)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            const teamRequest: CreateTeamRequestDto = {
                teamId: team.id
            };
            await supertest(app)
                .post(`/team-requests/move-to-another-team`)
                .send(teamRequest)
                .expect(401);
        });
    });
    describe('get all team requests', () => {
        it('should return all team requests', async () => {
            await supertest(app)
                .get(`/team-requests/all`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
        });
        it('should return all team requests', async () => {
            await supertest(app)
                .get(`/team-requests/all`)
                .set("authorization", `Bearer ${managerToken}`)
                .expect(200);
        });
        it('should return a 403 status code', async () => {
            await supertest(app)
                .get(`/team-requests/all`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            await supertest(app)
                .get(`/team-requests/all`)
                .expect(401);
        });
    });
    describe('leave the team', () => {
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            const {body} = await supertest(app)
                .get(`/team-requests/leave-the-team`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            await supertest(app)
                .get(`/team-requests/leave-the-team`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(201);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.managerPost(manager, team);
            await supertest(app)
                .get(`/team-requests/leave-the-team`)
                .set("authorization", `Bearer ${managerToken}`)
                .expect(403);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            await supertest(app)
                .get(`/team-requests/leave-the-team`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            await supertest(app)
                .get(`/team-requests/leave-the-team`)
                .expect(401);
        });
    });
    describe('manager post', () => {
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const {body} = await supertest(app)
                .get(`/team-requests/manager-post/${team.id}`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const {body} = await supertest(app)
                .get(`/team-requests/manager-post/${team.id}`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(201);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id
            });
        });
        it('should return a 400 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await supertest(app)
                .get(`/team-requests/manager-post/${team.id}aaa`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await supertest(app)
                .get(`/team-requests/manager-post/${team.id}`)
                .set("authorization", `Bearer ${managerToken}`)
                .expect(403);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await supertest(app)
                .get(`/team-requests/manager-post/${team.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await supertest(app)
                .get(`/team-requests/manager-post/${team.id}`)
                .expect(401);
        });
    });
    describe('accept a request', () => {
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.managerPost(manager, team);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            const {body} = await supertest(app)
                .get(`/team-requests/accept/${teamRequest.id}`)
                .set("authorization", `Bearer ${managerToken}`)
                .expect(200);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id,
                status: ETeamRequestStatusType.ACCEPTED
            });
        });
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.managerPost(manager, team);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            const {body} = await supertest(app)
                .get(`/team-requests/accept/${teamRequest.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id,
                status: ETeamRequestStatusType.ACCEPTED
            });
        });
        it('should return a team request information', async () => {
            const dataTeamFrom: CreateTeamDto = gDto.generateTeamDto();
            const dataTeamTo: CreateTeamDto = gDto.generateTeamDto();
            let teamFrom = await teamsService.createTeam(dataTeamFrom);
            let teamTo = await teamsService.createTeam(dataTeamTo);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const [managerTokenFrom, managerFrom] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            const [managerTokenTo, managerTo] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.addUserToTeam(user, teamFrom);
            await teamsService.managerPost(managerFrom, teamFrom);
            await teamsService.managerPost(managerTo, teamTo);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.MOVE_TO_ANOTHER_TEAM,
                    user.id,
                    teamFrom.id,
                    teamTo.id
                ));
            await teamRequestApprovementsService.createTeamRequestApprovement(gDto.generateTeamRequestApprovementDto(
                    teamRequest.id,
                    teamFrom.id,
                    teamTo.id
                ));
            const {body: bodyFirst} = await supertest(app)
                .get(`/team-requests/accept/${teamRequest.id}`)
                .set("authorization", `Bearer ${managerTokenFrom}`)
                .expect(200);
            expect(bodyFirst).toMatchObject({
                userId: user?.id!,
                teamId: teamTo.id,
                status: ETeamRequestStatusType.AWAITING
            });
            const {body: bodySecond} = await supertest(app)
                .get(`/team-requests/accept/${teamRequest.id}`)
                .set("authorization", `Bearer ${managerTokenTo}`)
                .expect(200);
            expect(bodySecond).toMatchObject({
                userId: user?.id!,
                teamId: teamFrom.id,
                status: ETeamRequestStatusType.ACCEPTED
            });
            const getUser = await usersService.getUserById(user.id);
            expect(getUser).toMatchObject({
                id: user.id,
                teamId: teamTo.id
            });
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.managerPost(manager, team);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            await supertest(app)
                .get(`/team-requests/accept/${teamRequest.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.managerPost(manager, team);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            await supertest(app)
                .get(`/team-requests/accept/${teamRequest.id}`)
                .expect(401);
        });
    });
    describe('decline a request', () => {
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            const {body} = await supertest(app)
                .get(`/team-requests/decline/${teamRequest.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id,
                status: ETeamRequestStatusType.DECLINED
            });
        });
        it('should return a team request information', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const [managerToken, manager] = await createUser(gDto.generateUserDto(), RoleTypes.MANAGER);
            await teamsService.managerPost(manager, team);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            const {body} = await supertest(app)
                .get(`/team-requests/decline/${teamRequest.id}`)
                .set("authorization", `Bearer ${managerToken}`)
                .expect(200);
            expect(body).toMatchObject({
                userId: user?.id!,
                teamId: team.id,
                status: ETeamRequestStatusType.DECLINED
            });
        });
        it('should return a 400 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            await supertest(app)
                .get(`/team-requests/decline/${teamRequest.id}aaa`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect(400);
        });
        it('should return a 403 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            await supertest(app)
                .get(`/team-requests/decline/${teamRequest.id}`)
                .set("authorization", `Bearer ${playerToken}`)
                .expect(403);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                    ETeamRequestTypes.JOIN_THE_TEAM,
                    user.id,
                    team.id
                ));
            await supertest(app)
                .get(`/team-requests/decline/${teamRequest.id}`)
                .expect(401);
        });
    });
    describe('decline your team request', () => {
        it('should return a 200 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                ETeamRequestTypes.JOIN_THE_TEAM,
                user.id,
                team.id
            ));
            await supertest(app)
                .delete(`/team-requests`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(200);
        });
        it('should return a 200 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await teamsService.addUserToTeam(user, team);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                ETeamRequestTypes.LEAVE_THE_TEAM,
                user.id,
                team.id
            ));
            await supertest(app)
                .delete(`/team-requests`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(200);
        });
        it('should return a 400 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            await supertest(app)
                .delete(`/team-requests`)
                .set("authorization", `Bearer ${userToken}`)
                .expect(400);
        });
        it('should return a 401 status code', async () => {
            const dataTeam: CreateTeamDto = gDto.generateTeamDto();
            let team = await teamsService.createTeam(dataTeam);
            const [userToken, user] = await createUser(gDto.generateUserDto(), RoleTypes.PLAYER);
            const teamRequest = await teamRequestsService.createTeamRequest(gDto.generateTeamRequestDto(
                ETeamRequestTypes.JOIN_THE_TEAM,
                user.id,
                team.id
            ));
            await supertest(app)
                .delete(`/team-requests`)
                .expect(401);
        });
    });
});