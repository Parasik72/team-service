import {Request, Response} from 'express';
import * as bcrypt from 'bcryptjs';
import { Service } from "typedi";
import { UsersService } from '../users/users.service';
import { ChangeProfileDto } from './dto/change-profile.dto';
import { ProfilesService } from './profiles.service';
import { jwtPayloadDto } from '../auth/dto/jwtPayload.dto';

@Service()
export class ProfilesController {
    constructor(private usersService: UsersService,
                private profilesService: ProfilesService){}
    async getProfile(req: Request, res: Response){
        try {
            const dtoParams = req.user as jwtPayloadDto;
            if(!dtoParams.id)
                return res.status(400).json({message: 'User was not found.'});
            const user = await this.usersService.getUserById(dtoParams.id);
            if(!user)
                return res.status(403).json({message: 'No authorization'});
            return res.json(user);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error getting user profile.'});
        }
    }

    async changeProfile(req: Request, res: Response){
        try {
            const dto: ChangeProfileDto = req.body;
            const dtoParams = req.user as jwtPayloadDto;
            if(!dtoParams.id)
                return res.status(400).json({message: 'User was not found.'});
            let user = await this.usersService.getUserById(dtoParams.id);
            if(!user)
                return res.status(400).json({message: 'User was not found.'});
            let password = '';
            if(dto.password && !this.usersService.isGoogleAccount(user))
                password = await bcrypt.hash(dto.password, 5);
            user = await this.usersService.updateUser({...dto, password}, user);
            const avatarFile = req.files?.avatarFile;
            if(avatarFile)
                await this.profilesService.uploadAvatar(user, avatarFile);
            return res.json(user);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error changing user profile.'});
        }
    }
}