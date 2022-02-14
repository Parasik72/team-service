import { Column, Model, Table, DataType, HasOne, BelongsToMany, ForeignKey, BelongsTo, HasMany} from 'sequelize-typescript';
import { Role } from '../roles/roles.model';
import { ResetToken } from '../reset-token/reset-token.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './user-role.model';
import { Team } from '../teams/teams.model';
import { TeamRequest } from '../team-requests/team-requests.model';
import { Ban } from '../bans/bans.model';

interface UserAttributes {
    id: string;
    email: string;
    login: string;
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
        unique: true,
        allowNull: false,
    })
    declare login: string;

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

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare avatar: string;

    @HasOne(() => ResetToken)
    declare resetToken: ResetToken;

    @HasMany(() => TeamRequest)
    declare teamRequests: TeamRequest[];

    @ForeignKey(() => Team)
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare teamId: string | null;

    @BelongsTo(() => Team)
    declare team: Team;

    @BelongsToMany(() => Role, () => UserRole)
    declare roles: Role[];

    @HasMany(() => Ban)
    declare bans: Ban[];
}

declare global {
    namespace Express {
        export interface User {
            id: string;
            email: string;
            isGoogleAccount: boolean;
            roles: [];
        }
    }
}