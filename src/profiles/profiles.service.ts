import path from "path";
import { Service } from "typedi";
import * as uuid from 'uuid';
import fs from 'fs';
import { User } from "../users/users.model";

const STATIC_PATH = process.env.STATIC_PATH || 'static_path';

@Service()
export class ProfilesService {
    uploadFile(file: any): string{
        const filePath = this.generateFileName(file);
        if(!fs.existsSync(STATIC_PATH))
            fs.mkdirSync(STATIC_PATH, {recursive: true});
        file.mv(filePath);
        return filePath;
    }

    generateFileName(file: any): string {
        const extension = file.name.split('.').pop();
        let filePath: string;
        do {
            const fileName = uuid.v4();
            filePath = path.resolve(STATIC_PATH, fileName) + `.${extension}`;
        } while (fs.existsSync(filePath));
        return filePath;
    }

    deleteFile(filePath: string): string | null{
        if(!fs.existsSync(filePath))
            return null;
        fs.unlinkSync(filePath);
        return filePath;
    }

    async uploadAvatar(user: User, avatarFile: any): Promise<User> {
        if(user.avatar)
            this.deleteFile(user.avatar);
        const avatar = this.uploadFile(avatarFile);
        user.avatar = avatar;
        await user.save();
        return user;
    }

    async setAvatarUrl(user: User, avatar: string): Promise<User> {
        user.avatar = avatar;
        await user.save();
        return user;
    }
}