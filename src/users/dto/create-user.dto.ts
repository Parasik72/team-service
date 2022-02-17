export interface CreateUserDto {
    readonly id?: string;
    readonly email: string;
    readonly login: string;
    readonly password?: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly roleId?: string;
}