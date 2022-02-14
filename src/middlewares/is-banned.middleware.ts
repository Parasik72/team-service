import {Request, Response, NextFunction} from 'express'
import { Ban } from '../bans/bans.model';
import { User } from '../users/users.model';

export const isNotBanned = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(req.method === 'OPTIONS')
            return next();
        const userReq = req.user as Express.User;
        if(!userReq)
            return res.status(401).json({message: 'Not authorized'});
        const user = await User.findOne({where: {email: userReq.email}, include: [Ban]});
        if(!user)
            return res.status(401).json({message: 'Not authorized'});
        if(user.bans.length > 0){
            const lastBan = user.bans[user.bans.length - 1];
            if(!lastBan.unBannedAt)
                return res.status(400).json({message: `BANNED! By: <${lastBan.bannedBy}> Reason: ${lastBan.banReason}`});
        }
        return next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({message: 'Not authorized'});
    }
}