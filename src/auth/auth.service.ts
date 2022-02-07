import { Service } from "typedi";
import transporter from "../email/transporter";
import { User } from "../users/users.model";
import jwt from 'jsonwebtoken'

@Service()
export class AuthService {
    async generateToken(user: User): Promise<string> {
        const roles = await user.$get('roles');
        const payload = {
            id: user.id,
            email: user.email,
            roles: roles
        }
        const secret = process.env.JWT_SECRET || 'jwtsecret';
        return jwt.sign(payload, secret, {expiresIn: '2h'});
    }

    async sendEmail(to: string, subject: string, text: string){
        await transporter.sendMail({
            to,
            subject,
            text
        });
    }

    async createResetPasswordLink(userId: string, value: string): Promise<string> {
        const BASE_URL = process.env.BASE_URL;
        const PORT = process.env.PORT;
        const link = `${BASE_URL}:${PORT}/auth/reset-pass/${userId}/${value}`;
        return link;
    }
}