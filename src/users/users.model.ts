import { Column, Model, Table, DataType, HasOne, BelongsToMany} from 'sequelize-typescript';
import { Role } from '../roles/roles.model';
import { ResetToken } from '../reset-token/reset-token.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './user-role.model';

interface UserAttributes {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isGoogleAccount: boolean;
}

@Table({tableName: 'User', timestamps: false})
export class User extends Model<UserAttributes, CreateUserDto>{
    @Column({
        type: DataType.STRING, 
        unique: true,
        primaryKey: true
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: ''
    })
    declare password: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare firstName: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare lastName: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    declare isGoogleAccount: boolean;

    @HasOne(() => ResetToken)
    declare resetToken: ResetToken;

    @BelongsToMany(() => Role, () => UserRole)
    declare roles: Role[];
}