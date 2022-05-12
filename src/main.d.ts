declare namespace NodeJS {
    export interface ProcessEnv {
        PORT: number;
        BASE_URL: string;
        WS_PORT: number;
        WS_HOST: string;
        JWT_SECRET: string;
        SESSION_SECRET: string;
        STATIC_PATH: string;
        POSTGRES_HOST: string;
        POSTGRES_PORT: number;
        POSTGRES_USER: string;
        POSTGRES_PASSWORD: string;
        POSTGRES_DB: string;
        EMAIL_HOST: string;
        EMAIL_PORT: number;
        EMAIL_USER: string;
        EMAIL_PASS: string;
        PASSPORT_CLIENT_ID: string;
        PASSPORT_CLIENT_SECRET: string;
        PASSPORT_CALLBACK_URL: string;
    }
}

declare namespace Express {
    export interface User {
        id: string;
        email: string;
        isGoogleAccount: boolean;
        role: string;
        bans: [];
    }
}