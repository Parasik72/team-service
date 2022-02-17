import { Service } from "typedi";
import * as uuid from 'uuid';
import { CreateTeamKickDto } from "./dto/create-team-kick.dto";
import { TeamKick } from "./team-kicks.model";

@Service()
export class TeamKicksService {
    async generateTeamKickId(): Promise<string> {
        let teamKick: TeamKick | null, id: string;
        do {
            id = uuid.v4();
            teamKick = await TeamKick.findByPk(id);
        } while (teamKick);
        return id;
    }

    async createTeamKick(dto: CreateTeamKickDto): Promise<TeamKick> {
        return await TeamKick.create(dto);
    }
}