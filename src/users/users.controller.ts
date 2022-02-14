import {Request, Response} from 'express'
import * as bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { Service } from 'typedi';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ProfilesService } from '../profiles/profiles.service';
import { GetUserIdParamsDto } from './dto/get-userId.dto';
import { GetAvatarDto } from './dto/get-avatar.dto';
import { CreateBanDto } from '../bans/dto/create-ban.dto';
import { BansService } from '../bans/bans.service';
import { TeamsService } from '../teams/teams.service';

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
                return res.status(400).json({errors});
            const dto: CreateUserDto = req.body;
            const checkEmail = await this.usersService.getUserByEmail(dto.email);
            if(checkEmail)
                return res.status(400).json({message: 'This email is already in use.'});
            const checkLogin = await this.usersService.getUserByLogin(dto.login);
            if(checkLogin)
                return res.status(400).json({message: 'This login is already in use.'});
            const hashPassword = await bcrypt.hash(dto.password!, 5);
            const userId = await this.usersService.generateUserId();
            const newUser = await this.usersService.createUser({...dto, password: hashPassword, id: userId});
            if(!newUser)
                return res.status(500).json({message: 'Error creating user.'});
            const avatarFile = req.files?.avatarFile;
            if(avatarFile)
                await this.profilesService.uploadAvatar(newUser, avatarFile);
            return res.status(201).json(newUser);
        } catch (error) {
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
                return res.status(400).json({message: 'User was not found.'});
            const user = await this.usersService.getUserById(dtoParams.userId);
            if(!user)
                return res.status(400).json({message: 'User was not found.'});
            return res.json(user);
        } catch (error) {
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
                return res.status(400).json({message: 'User was not found.'});
            if(dto.email){
                const checkEmail = await this.usersService.getUserByEmail(dto.email);
                if(checkEmail)
                    return res.status(400).json({message: 'This email is already in use.'});
            }
            if(dto.login){
                const checkLogin = await this.usersService.getUserByLogin(dto.login);
                if(checkLogin)
                    return res.status(400).json({message: 'This login is already in use.'});
            }
            const user = await this.usersService.updateUser(dto, dtoParams.userId);
            if(!user)
                return res.status(400).json({message: 'User was not found.'});
            const avatarFile = req.files?.avatarFile;
            if(avatarFile)
                await this.profilesService.uploadAvatar(user, avatarFile);
            return res.json(user);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error updating user.'});
        }
    }

    async delete(req: Request, res: Response){
        try {
            const dtoParams: GetUserIdParamsDto = req.params;
            if(!dtoParams.userId)
                return res.status(400).json({message: 'User was not found.'});
            const userId = await this.usersService.deleteUser(dtoParams.userId);
            if(!userId)
                return res.status(400).json({message: 'User was not found.'});
            return res.json({message: `The user 'ID: ${userId}' was deleted.`});
        } catch (error) {
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
                return res.status(400).json({message: 'No access.'});
            const dtoBody: CreateBanDto = req.body;
            const dtoParams: GetUserIdParamsDto = req.params;
            if(!dtoParams.userId)
                return res.status(400).json({message: 'User was not found.'});
            const user = await this.usersService.getUserById(dtoParams.userId);
            if(!user)
                return res.status(400).json({message: 'User was not found.'});
            if(user.teamId){
                const team = await this.teamsService.getTeamById(user.teamId);
                if(team)
                    await this.teamsService.kickUser(user, team);
            }
            const banId = await this.bansService.generateBanId();
            const ban = await this.bansService.createBan({...dtoBody, id: banId, userId: user.id, bannedBy: reqUser.id});
            return res.json(ban);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error banning user.'});
        }
    }

    async unban(req: Request, res: Response){
        try {
            const reqUser = req.user as Express.User;
            if(!reqUser)
                return res.status(400).json({message: 'No access.'});
            const dtoParams: GetUserIdParamsDto = req.params;
            if(!dtoParams.userId)
                return res.status(400).json({message: 'User was not found.'});
            const user = await this.usersService.getUserById(dtoParams.userId);
            if(!user)
                return res.status(400).json({message: 'User was not found.'});
            const lastBan = await this.usersService.isBanned(user);
            if(!lastBan)
                return res.status(400).json({message: 'This user is not banned.'});
            await this.bansService.unban(lastBan);
            return res.json(lastBan);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error unbanning user.'});
        }
    }
}