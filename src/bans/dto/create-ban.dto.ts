export interface CreateBanDto {
    id?: string;
    userId?: string;
    banReason: string;
    bannedBy?: string;
    unBannedAt?: Date;
}