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
}