import {Request, Response} from 'express'
import { validationResult } from 'express-validator';
import { Service } from 'typedi';
import { HttpException, HttpExceptionMessages } from '../exceptions/HttpException';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';

@Service()
export class RolesController{
    constructor(private rolesService: RolesService){}
    async create(req: Request, res: Response){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                throw new HttpException(400, errors);
            const dto: CreateRoleDto = req.body;
            const checkRole = await this.rolesService.getRoleByValue(dto.value);
            if(checkRole)
                throw new HttpException(400, 'This role is already exists.');
            const roleId = await this.rolesService.generateRoleId();
            const role = await this.rolesService.createRole({...dto, id: roleId});
            return res.status(201).json(role);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error creating role.'});
        }
    }

    async getAll(req: Request, res: Response){
        try {
            const roles = await this.rolesService.getAllRoles();
            return res.json(roles);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error getting all roles.'});
        }
    }

    async delete(req: Request, res: Response){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                throw new HttpException(400, errors);
            const {value} = req.params;
            if(!value)
                throw new HttpException(400, HttpExceptionMessages.IncorrectData);
            const roleValue = await this.rolesService.deleteRoleByValue(value);
            if(!roleValue)
                throw new HttpException(400, 'This role was not found.');
            return res.json(roleValue);
        } catch (error) {
            if(error instanceof HttpException)
                return res.status(error.statusCode).json({message: error.message});
            console.log(error);
            return res.status(500).json({message: 'Error creating role.'});
        }
    }
}