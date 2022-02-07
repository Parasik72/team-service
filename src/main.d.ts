declare namespace NodeJS {
    export interface ProcessEnv {
        PORT: number;
        BASE_URL: string;
        WS_PORT: number;
        JWT_SECRET: string;
        SESSION_SECRET: string;
        POSTGRES_HOST: string;
        POSTGRES_PORT: number;
        POSTGRES_USERNAME: string;
        POSTGRES_PASSWORD: string;
        POSTGRES_DATABASE: string;
        EMAIL_HOST: string;
        EMAIL_PORT: number;
        EMAIL_USER: string;
        EMAIL_PASS: string;
        PASSPORT_CLIENT_ID: string;
        PASSPORT_CLIENT_SECRET: string;
        PASSPORT_CALLBACK_URL: string;
    }
}