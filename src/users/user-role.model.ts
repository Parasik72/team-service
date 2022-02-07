import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Role } from "../roles/roles.model";
import { User } from "./users.model";

@Table({tableName: 'UserRole', createdAt: false, updatedAt: false})
export class UserRole extends Model<UserRole>{
    @Column({
        type: DataType.INTEGER, 
        unique: true,
        autoIncrement: true,
        primaryKey: true
    })
    declare id: number;

    @ForeignKey(() => Role)
    @Column({
        type: DataType.STRING
    })
    declare roleId: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.STRING
    })
    declare userId: string;
}