import fileUpload from 'express-fileupload';

export interface GetAvatarDto {
    avatarFile?: fileUpload.UploadedFile | undefined;
}