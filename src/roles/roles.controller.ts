import {Request, Response} from 'express'
import { validationResult } from 'express-validator';
import { Service } from 'typedi';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';

@Service()
export class RolesController{
    constructor(private rolesService: RolesService){}
    async create(req: Request, res: Response){
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
                return res.status(400).json({errors});
            const dto: CreateRoleDto = req.body;
            const checkRole = await this.rolesService.getRoleByValue(dto.value);
            if(checkRole)
                return res.status(400).json({message: 'This role is already exists.'});
            const roleId = await this.rolesService.generateRoleId();
            const role = await this.rolesService.createRole({...dto, id: roleId});
            return res.status(201).json(role);
        } catch (error) {
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
                return res.status(400).json({errors});
            const {value} = req.params;
            if(!value)
                return res.status(400).json({message: 'Incorect value'});
            const roleValue = await this.rolesService.deleteRoleByValue(value);
            if(!roleValue)
                return res.status(400).json({message: 'This role was not found.'});
            return res.status(201).json(roleValue);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: 'Error creating role.'});
        }
    }
}