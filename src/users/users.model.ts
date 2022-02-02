import { DataTypes, Model} from 'sequelize'
import dbInstance from '../db/instantiate-sequalize';
import { CreateUserDto } from './dto/create-user.dto';

interface UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export class User extends Model<UserAttributes, CreateUserDto>{}
User.init({
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: dbInstance,
    modelName: 'User',
    timestamps: false
});