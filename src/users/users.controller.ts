import {Request, Response} from 'express'
import * as bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { Service } from 'typedi';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ProfilesService } from '../profiles/profiles.service';
import { GetUserIdParamsDto } from './dto/get-userId.dto';
import { CreateBanDto } from '../bans/dto/create-ban.dto';
import { BansService } from '../bans/bans.service';
import { TeamsService } from '../teams/teams.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { HttpException, HttpExceptionMessages } from '../exceptions/HttpException';

@Service()
export class UsersController{
    constructor(private usersService: UsersService,
                private profilesService: ProfilesService,
                private bansService: BansService,
                private teamsService: TeamsService){}
    async create(req: Request, res: Response){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                throw new HttpException(400, errors);
            const dto: CreateUserDto = req.body;
            const checkEmail = await this.usersService.getUserByEmail(dto.email);
            if(checkEmail)
                throw new HttpException(400, HttpExceptionMessages.EmailInUse);
            const checkLogin = await this.usersService.getUserByLogin(dto.login);
            if(checkLogin)
                throw new HttpException(400, HttpExceptionMessages.LoginInUse);
            const hashPassword = await bcrypt.hash(dto.password!, 5);
            const userId = await this.usersService.generateUserId();
            const newUser = await this.usersService.createUser({...dto, password: hashPassword, id: userId});
            if(!newUser)
                throw new HttpException(400, HttpExceptionMessages.CreatingUser);
            const avatarFile = req.files?.avatarFile;
            if(avatarFile)
                await this.profilesService.uploadAvatar(newUser, avatarFile);
            return res.status(201).json(newUser);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error creating user.'});
        }
    }

    async getAll(req: Request, res: Response){
        try {
            const users = await this.usersService.getAllUsers();
            return res.json(users)
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error getting all users.'});
        }
    }

    async getOne(req: Request, res: Response){
        try {
            const dtoParams: GetUserIdParamsDto = req.params;
            if(!dtoParams.userId)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            const user = await this.usersService.getUserById(dtoParams.userId);
            if(!user)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            return res.json(user);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error getting an user.'});
        }
    }

    async update(req: Request, res: Response){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                return res.status(400).json({errors});
            const dto: UpdateUserDto = req.body;
            const dtoParams: GetUserIdParamsDto = req.params;
            if(!dtoParams.userId)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            let user = await this.usersService.getUserById(dtoParams.userId);
            if(!user)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            if(dto.email){
                const checkEmail = await this.usersService.getUserByEmail(dto.email);
                if(checkEmail)
                    throw new HttpException(400, HttpExceptionMessages.EmailInUse);
            }
            if(dto.login){
                const checkLogin = await this.usersService.getUserByLogin(dto.login);
                if(checkLogin)
                    throw new HttpException(400, HttpExceptionMessages.LoginInUse);
            }
            user = await this.usersService.updateUser(dto, user);
            if(!user)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            const avatarFile = req.files?.avatarFile;
            if(avatarFile)
                await this.profilesService.uploadAvatar(user, avatarFile);
            return res.json(user);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error updating user.'});
        }
    }

    async delete(req: Request, res: Response){
        try {
            const dtoParams: GetUserIdParamsDto = req.params;
            if(!dtoParams.userId)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            const userId = await this.usersService.deleteUser(dtoParams.userId);
            if(!userId)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            return res.json({message: `The user 'ID: ${userId}' was deleted.`});
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error deleting user.'});
        }
    }

    async ban(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                return res.status(400).json({errors});
            const reqUser = req.user as Express.User;
            if(!reqUser)
                throw new HttpException(403, HttpExceptionMessages.NoAccess);
            const dtoBody: CreateBanDto = req.body;
            const dtoParams: GetUserIdParamsDto = req.params;
            if(!dtoParams.userId)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            const user = await this.usersService.getUserById(dtoParams.userId);
            if(!user)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            if(user.teamId){
                const team = await this.teamsService.getTeamById(user.teamId);
                if(team)
                    await this.teamsService.kickUser(user, team);
            }
            const banId = await this.bansService.generateBanId();
            const ban = await this.bansService.createBan({...dtoBody, id: banId, userId: user.id, bannedBy: reqUser.id});
            return res.json(ban);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error banning user.'});
        }
    }

    async unban(req: Request, res: Response){
        try {
            const reqUser = req.user as Express.User;
            if(!reqUser)
                throw new HttpException(403, HttpExceptionMessages.NoAccess);
            const dtoParams: GetUserIdParamsDto = req.params;
            if(!dtoParams.userId)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            const user = await this.usersService.getUserById(dtoParams.userId);
            if(!user)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            const lastBan = await this.usersService.isBanned(user);
            if(!lastBan)
                throw new HttpException(400, 'This user is not banned.');
            await this.bansService.unban(lastBan);
            return res.json(lastBan);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error unbanning user.'});
        }
    }

    async changePass(req: Request, res: Response){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                return res.status(400).json({errors});
            const dto: ChangePasswordDto = req.body;
            const dtoParams: GetUserIdParamsDto = req.params;
            if(!dtoParams.userId)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            let user = await this.usersService.getUserById(dtoParams.userId);
            if(!user)
                throw new HttpException(400, HttpExceptionMessages.UserWasNotFound);
            if(this.usersService.isGoogleAccount(user))
                throw new HttpException(400, `Google account can't change his password.`);
            if(dto.password){
                const hashPassword = await bcrypt.hash(dto.password!, 5)
                user = await this.usersService.updateUser({...dto, password: hashPassword}, user);
            }
            return res.json(user);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error changing user password.'});
        }
    }
}