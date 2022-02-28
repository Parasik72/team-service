import dotenv from 'dotenv';
import path from 'path';
import Container from 'typedi';
dotenv.config({path: path.resolve(__dirname, '../../.env.test')});
import dbInstance from "../db/instantiate-sequelize";
import { RolesService } from '../roles/roles.service';
import { RoleTypes } from '../roles/roles.type';

(async () => {
    console.log('Reseting the DB...');
    const rolesService = Container.get(RolesService);
    await dbInstance.truncate({cascade: true});
    await rolesService.createRole({id: RoleTypes.PLAYER, value: RoleTypes.PLAYER});
    await rolesService.createRole({id: RoleTypes.MANAGER, value: RoleTypes.MANAGER});
    await rolesService.createRole({id: RoleTypes.ADMIN, value: RoleTypes.ADMIN});
})();