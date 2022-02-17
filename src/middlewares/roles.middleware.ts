import {Request, Response, NextFunction} from 'express';
import { jwtPayloadDto } from '../auth/dto/jwtPayload.dto';
import { RoleType } from '../roles/roles.type';

export const Roles = (roles: RoleType[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if(req.method === 'OPTIONS')
                return next();
            const user = req.user as jwtPayloadDto;
            if(!user)
                return res.status(401).json({message: 'No authorization'});
            for (const requiredRole of roles)
                if(requiredRole === user.role)
                    return next();
            return res.status(403).json({message: 'No access'});
        } catch (error) {
            return res.status(403).json({message: 'No access'});
        }
    }
}