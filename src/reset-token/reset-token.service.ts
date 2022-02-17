import { Service } from "typedi";
import { v4 } from "uuid";
import { ResetToken } from "./reset-token.model";

@Service()
export class TokenService {
    async getTokenByUserId(userId: string): Promise<ResetToken | null> {
        return await ResetToken.findOne({where: {userId}});
    }

    async createToken(userId: string, value: string): Promise<ResetToken>{
        const token = await ResetToken.create({
            userId,
            value
        });
        return token;
    }

    async getTokenByUserIdAndTokenVal(userId: string, value: string): Promise<ResetToken | null>{
        const token = await ResetToken.findOne({where: {
            userId,
            value
        }});
        return token;
    }

    async generateResetToken(): Promise<string> {
        let role: ResetToken | null, id: string;
        do {
            id = v4();
            role = await ResetToken.findByPk(id);
        } while (role);
        return id;
    }
}