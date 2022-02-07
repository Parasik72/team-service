import { BelongsToMany, Column, DataType, Model, Table} from 'sequelize-typescript'
import { UserRole } from '../users/user-role.model';
import { User } from '../users/users.model';
import { CreateRoleDto } from './dto/create-role.dto';

interface RoleAttributes {
    id: string;
    value: string;
}

@Table({tableName: 'Role', timestamps: false})
export class Role extends Model<RoleAttributes, CreateRoleDto>{
    @Column({
        type: DataType.STRING,
        unique: true,
        primaryKey: true
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare value: string;

    @BelongsToMany(() => User, () => UserRole)
    declare users: User[];
}