import {Request, Response} from 'express'
import * as bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { Service } from 'typedi';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Service()
export class UsersController{
    constructor(private usersService: UsersService){}
    async create(req: Request, res: Response){
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
            const {id} = req.params;
            if(!id)
                return res.status(400).json({message: 'User was not found.'});
            const user = await this.usersService.getUserById(String(id));
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
            const {id} = req.params;
            if(!id)
                return res.status(400).json({message: 'User was not found.'});
            if(dto.email){
                const checkEmail = await this.usersService.getUserByEmail(dto.email);
                if(checkEmail)
                    return res.status(400).json({message: 'This email is already in use.'});
            }
            const user = await this.usersService.updateUser(dto, String(id));
            if(!user)
                return res.status(400).json({message: 'User was not found.'});
            return res.json(user);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error updating user.'});
        }
    }

    async delete(req: Request, res: Response){
        try {
            const {id} = req.params;
            if(!id)
                return res.status(400).json({message: 'User was not found.'});
            const userId = await this.usersService.deleteUser(String(id));
            if(!userId)
                return res.status(400).json({message: 'User was not found.'});
            return res.json({message: `The user 'ID: ${userId}' was deleted.`});
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error deleting user.'});
        }
    }
}