import {Request, Response} from 'express';
import { Service } from "typedi";
import { UsersService } from '../users/users.service';
import { ChangeProfileDto } from './dto/change-profile.dto';
import { ProfilesService } from './profiles.service';

@Service()
export class ProfilesController {
    constructor(private usersService: UsersService,
                private profilesService: ProfilesService){}
    async getProfile(req: any, res: Response){
        try {
            const {id} = req.user;
            const user = await this.usersService.getUserById(id);
            if(!user)
                return res.status(403).json({message: 'No authorization'});
            return res.json(user);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error getting user profile.'});
        }
    }

    async changeProfile(req: any, res: Response){
        try {
            const dto: ChangeProfileDto = req.body;
            const {id, isGoogleAccount} = req.user;
            if(!id)
                return res.status(403).json({message: 'No authorization'});
            if(isGoogleAccount)
                return res.status(400).json({message: 'The google account cannot be changed'});
            const user = await this.usersService.updateUser(dto, String(id));
            if(!user)
                return res.status(400).json({message: 'User was not found.'});
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