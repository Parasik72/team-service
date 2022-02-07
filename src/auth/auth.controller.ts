import {Request, Response} from 'express';
import { Service } from 'typedi';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { validationResult } from 'express-validator';
import { ForgotPassDto } from './dto/forgot-pass.dto';
import { TokenService } from '../reset-token/reset-token.service';
import { ResetPassDto } from './dto/reset-pass.dto';
import { UserGoogleDto } from './dto/user-google.dto';

@Service()
export class AuthController{
    constructor(private authService: AuthService,
                private usersService: UsersService,
                private tokenService: TokenService){}
    async register(req: Request, res: Response){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                return res.status(400).json({errors});
            const dto: CreateUserDto = req.body;
            const candidate = await this.usersService.getUserByEmail(dto.email);
            if(candidate)
                return res.status(400).json({message: 'This email is already in use.'});
            const hashPassword = await bcrypt.hash(dto.password!, 5);
            const userId = await this.usersService.generateUserId();
            const newUser = await this.usersService.createUser({...dto, password: hashPassword, id: userId});
            if(!newUser)
                return res.status(500).json({message: 'Error creating user.'});
            const token = await this.authService.generateToken(newUser);
            return res.status(201).json({token});
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error registration'});
        }
    }

    async login(req: Request, res: Response){
        try {
            const dto: LoginDto = req.body;
            const user = await this.usersService.getUserByEmail(dto.email);
            if(!user)
                return res.status(400).json({message: 'Incorect data'});
            const checkGoogleAccount = this.usersService.isGoogleAccount(user);
            if(checkGoogleAccount)
                return res.status(400).json({message: `This is a google account. Use '/auth/google' url to login`});
            const hashPassword = String(user.get('password'));
            const comparePasswords = await bcrypt.compare(dto.password,hashPassword);
            if(!comparePasswords)
                return res.status(400).json({message: 'Incorect data'});
            const token = await this.authService.generateToken(user);
            return res.status(201).json({token});
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error login'});
        }
    }

    async forgotPass(req: Request, res: Response){
        try {
            const dto: ForgotPassDto = req.body;
            const user = await this.usersService.getUserByEmail(dto.email);
            if(!user)
                return res.status(400).json({message: 'Incorect data'});
            const checkGoogleAccount = this.usersService.isGoogleAccount(user);
            if(checkGoogleAccount)
                return res.status(400).json({message: 'The google account cannot be changed'});
            const userId = String(user.get('id'));
            let token = await this.tokenService.getTokenByUserId(userId);
            let tokenValue;
            if(!token){
                tokenValue = await this.tokenService.generateResetToken();
                token = await this.tokenService.createToken(userId, tokenValue);
                await token.save();
            }else
                tokenValue = String(token.get('value'));
            const link = await this.authService.createResetPasswordLink(userId, tokenValue);
            const userEmail = String(user.get('email'));
            await this.authService.sendEmail(userEmail, 'Reset password', link);
            return res.json({message: `The reset link sent to <${userEmail}> email.`});
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error forgot password'});
        }
    }

    async resetPass(req: Request, res: Response) {
        try {
            const {userId, token} = req.params;
            const dto: ResetPassDto = req.body;
            const user = await this.usersService.getUserById(String(userId));
            if(!user)
                return res.status(400).json({message: 'Invalid link'});
            const tokenDB = await this.tokenService.getTokenByUserIdAndTokenVal(String(userId), token);
            if(!tokenDB)
                return res.status(400).json({message: 'Invalid link'});
            const hashPassword = await bcrypt.hash(dto.password, 5);
            await user.set('password', hashPassword);
            await user.save();
            await tokenDB.destroy();
            return res.json({message: `The password was changed sucessfully.`});
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error reset password'});
        }
    }

    async successGoogleAuth(req: any, res: any) {
        try {
            const dto: UserGoogleDto = req.user;
            const userId = dto.id + 'google';
            let user = await this.usersService.getUserById(userId);
            if(!user){
                const checkEmail = await this.usersService.getUserByEmail(dto.email);
                if(checkEmail)
                    return res.status(400).json({message: 'This email is already in use'});
                user = await this.usersService.createUser({...dto, id: userId, firstName: dto.given_name, lastName: dto.family_name});
                if(!user)
                    return res.status(500).json({message: 'Error creating user.'});
                user.set('isGoogleAccount', true);
                await user.save();
            }
            const token = await this.authService.generateToken(user);
            return res.json({token});
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error google auth'});
        }
    }

    async failureGoogleAth(req: any, res: any){
        return res.json(400).json({message: 'Failure login'});
    }

    async logoutGoogle(req: any, res: any){
        req.session.destroy(()=>{});
        return res.json({message: 'Logged out from Google Account'})
    }
}