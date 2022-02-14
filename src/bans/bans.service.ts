import { Service } from "typedi";
import { Ban } from "./bans.model";
import { CreateBanDto } from "./dto/create-ban.dto";
import * as uuid from 'uuid';
import { User } from "../users/users.model";

@Service()
export class BansService {
    async generateBanId(){
        let ban: Ban | null, id: string;
        do {
            id = uuid.v4();
            ban = await Ban.findByPk(id);
        } while (ban);
        return id;
    }

    async createBan(dto: CreateBanDto): Promise<Ban> {
        const ban = await Ban.create(dto);
        return ban;
    }

    async unban(ban: Ban): Promise<Ban> {
        ban.unBannedAt = new Date(Date.now());
        await ban.save();
        return ban;
    }
}