/**
 * Тип шифрования пароля
 */
export type Digest = 'plain' | 'md5';

/**
 * Тип хранилища
 */
export type StoreType = 'sqlite';

/**
 * Описание конфига приложения
 */
export interface ConfigTypes {
    /**
     * Порт, который слушает сервис
     */
    port: number;

    /**
     * Тип хранилища
     */
    store: StoreType;

    /**
     * Тип хранения пароля
     */
    digest: Digest;
}

/**
 * Что приходит на запрос регистрации
 */
export interface LoginRequest {
    /**
     * Имя пользователя
     */
    login: string;

    /**
     * Пароль
     */
    pass: string;
}

/**
 * Описание пользователя
 */
export interface User {
    /**
     * Логин
     */
    login: string;

    /**
     * MD5 hash пароля
     */
    pass: string;
}

/**
 * Описание сервера от обычного запроса
 */
export interface ServerInfo {
    servericon: string;
    ip: string;
    port: number;
    debug: {
        ping: any;
        query: any;
        srv: any;
        querymismatch: any;
        ipinsrv: any;
        cnameinsrv: any;
        animatedmotd: any;
        cachetime: any;
        apiversion: string;
    };
    motd: {
        raw: string[];
        clean: string[];
        html: string[];
    };
    players: {
        online: number;
        max: number;
    };
    version: string;
    online: boolean;
    protocol: number;
    hostname: string;
}

/**
 * Описание forge сервера
 */
export interface ForgeInfo {
    description: string;
    players: {
        max: number;
        online: number;
        sample: { id: string, name: string }[];
    };
    version: {
        name: string;
        protocol: number;
    };
    modinfo: {
        type: string;
        modList: { modid: string, version: string }[];
    };
    latency: number;
}

/**
 * Сайт данного мода
 */
export interface ModInfo {
    modid: string;
    page: string;
}

/**
 * дополнительная инфа о сервере
 */
export interface ExtraServerInfo {
    address: string;
}

