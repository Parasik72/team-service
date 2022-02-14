import {Request, Response, NextFunction} from 'express';
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'jwtsecret123';

export const isLogedIn = (req: Request, res: Response, next: NextFunction) => {
    try {
        if(req.method === 'OPTIONS')
            return next();
        const token = req.headers.authorization?.split(' ')[1];
        if(!token)
            return res.status(401).json({message: 'No authorization'});
        const userJWT: jwt.JwtPayload | string = jwt.verify(token, JWT_SECRET);
        const user = userJWT as Express.User;
        if(!user)
            return res.status(401).json({message: 'No authorization'});
        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({message: 'No authorization'});
    }
}