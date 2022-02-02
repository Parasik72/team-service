declare namespace NodeJS {
    export interface ProcessEnv {
        PORT: number;
        POSTGRES_HOST: string;
        POSTGRES_PORT: number;
        POSTGRES_USERNAME: string;
        POSTGRES_PASSWORD: string;
        POSTGRES_DATABASE: string;
        WS_PORT: number;
    }
}