import dotenv from 'dotenv';
import path from 'path';
import supertest from 'supertest';
dotenv.config({path: path.resolve(__dirname, '../../.env.test')});
import Container from "typedi";
import { app } from '../app';
import dbInstance from '../db/instantiate-sequelize';
import { UsersService } from "../users/users.service";
import { GeneratorDto } from './generate-dto';
import * as bcrypt from 'bcryptjs';
import { TokenService } from '../reset-token/reset-token.service';
import { ResetPassDto } from '../auth/dto/reset-pass.dto';

describe('auth', () => {
    const usersService = Container.get(UsersService);
    const resettokenService = Container.get(TokenService);
    const gDto = new GeneratorDto('auth');
    beforeAll(async () => {
        await dbInstance.sync();
    });
    describe('registration', () => {
        it('should return an user token', async () => {
            const data = gDto.generateUserDto();
            await supertest(app)
                .post(`/auth/register`)
                .send(data)
                .expect(201);
        });
        it('should return an user token', async () => {
            const data = gDto.generateUserDto();
            await supertest(app)
                .post(`/auth/register`)
                .send(data)
                .expect(201);
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            await usersService.createUser(data);
            await supertest(app)
                .post(`/auth/register`)
                .send(data)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            await supertest(app)
                .post(`/auth/register`)
                .send({...data, firstName: ''})
                .expect(400);
        });
    });
    describe('login', () => {
        it('should return an user token', async () => {
            const data = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(data.password, 5);
            await usersService.createUser({...data, password: hashPassword});
            await supertest(app)
                .post(`/auth/login`)
                .send(data)
                .expect(200);
        });
        it('should return an user token', async () => {
            const data = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(data.password, 5);
            await usersService.createUser({...data, password: hashPassword});
            await supertest(app)
                .post(`/auth/login`)
                .send(data)
                .expect(200);
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(data.password, 5);
            await usersService.createUser({...data, password: hashPassword});
            await supertest(app)
                .post(`/auth/login`)
                .send({...data, password: ''})
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            await supertest(app)
                .post(`/auth/login`)
                .send(data)
                .expect(400);
        });
    });
    describe('forgot password', () => {
        it('should return a reset link information', async () => {
            const data = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(data.password, 5);
            const user = await usersService.createUser({...data, password: hashPassword});
            await supertest(app)
                .post(`/auth/forgot-pass`)
                .send({email: user?.email})
                .expect(201);
        });
        it('should return a reset link information', async () => {
            const data = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(data.password, 5);
            const user = await usersService.createUser({...data, password: hashPassword});
            await supertest(app)
                .post(`/auth/forgot-pass`)
                .send({email: user?.email})
                .expect(201);
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(data.password, 5);
            await usersService.createUser({...data, password: hashPassword});
            await supertest(app)
                .post(`/auth/forgot-pass`)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const data = gDto.generateUserDto();
            await supertest(app)
                .post(`/auth/forgot-pass`)
                .send({email: data.email})
                .expect(400);
        });
    });
    describe('reset-pass', () => {
        it('should return a successful message', async () => {
            const userData = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(userData.password, 5);
            const user = await usersService.createUser({...userData, password: hashPassword});
            const valueToken = await resettokenService.generateResetToken();
            const rtoken = await resettokenService.createToken(user?.id!, valueToken);
            const data: ResetPassDto = {
                password: 'newpass'
            }
            await supertest(app)
                .post(`/auth/reset-pass/${user?.id}/${rtoken.value}`)
                .send(data)
                .expect(200);
            const getUser = await usersService.getUserById(user?.id!);
            const password = await bcrypt.compare(data.password, getUser?.password!);
            expect(password).toBe(true);
        });
        it('should return a successful message', async () => {
            const userData = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(userData.password, 5);
            const user = await usersService.createUser({...userData, password: hashPassword});
            const valueToken = await resettokenService.generateResetToken();
            const rtoken = await resettokenService.createToken(user?.id!, valueToken);
            const data: ResetPassDto = {
                password: 'newpass123'
            }
            await supertest(app)
                .post(`/auth/reset-pass/${user?.id}/${rtoken.value}`)
                .send(data)
                .expect(200);
            const getUser = await usersService.getUserById(user?.id!);
            const password = await bcrypt.compare(data.password, getUser?.password!);
            expect(password).toBe(true);
        });
        it('should return a 400 status code', async () => {
            const userData = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(userData.password, 5);
            const user = await usersService.createUser({...userData, password: hashPassword});
            const valueToken = await resettokenService.generateResetToken();
            const rtoken = await resettokenService.createToken(user?.id!, valueToken);
            const data: ResetPassDto = {
                password: 'newpass'
            }
            await supertest(app)
                .post(`/auth/reset-pass/${user?.id}/${rtoken.value}`)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const userData = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(userData.password, 5);
            const user = await usersService.createUser({...userData, password: hashPassword});
            const valueToken = await resettokenService.generateResetToken();
            const rtoken = await resettokenService.createToken(user?.id!, valueToken);
            const data: ResetPassDto = {
                password: 'newpass'
            }
            await supertest(app)
                .post(`/auth/reset-pass/${user?.id}aaa/${rtoken.value}`)
                .send(data)
                .expect(400);
        });
        it('should return a 400 status code', async () => {
            const userData = gDto.generateUserDto();
            const hashPassword = await bcrypt.hash(userData.password, 5);
            const user = await usersService.createUser({...userData, password: hashPassword});
            const valueToken = await resettokenService.generateResetToken();
            const rtoken = await resettokenService.createToken(user?.id!, valueToken);
            const data: ResetPassDto = {
                password: 'newpass'
            }
            await supertest(app)
                .post(`/auth/reset-pass/${user?.id}/${rtoken.value}aaa`)
                .send(data)
                .expect(400);
        });
    });
});