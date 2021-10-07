/**
 * Тип шифрования пароля
 */
export type Digest = 'plain' | 'md5';

/**
 * Тип хранилища
 */
export type StoreType = 'sqlite' | 'ely.by' | 'file';

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
    store: {
        type: StoreType,
        config?: SqLiteConfig | FileConfig
    }
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
     * Пароль
     */
    pass?: string;

    /**
     * UUID пользователя
     */
    uuid?: string;

    /**
     * токен доступа
     */
    access?: string;

    /**
     * Сервер
     */
    server?: string;
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

/**
 * Настройка sql
 */
export interface SqLiteConfig {
    /**
     * Таблица
     */
    table: string;

    /**
     * ID колонки
     */
    uuidColumn: string;

    /**
     * Поле с именами пользователей
     */
    usernameColumn: string;

    /**
     * Поле с accessToken
     */
    accessTokenColumn: string;

    /**
     * Поле с serverID
     */
    serverIDColumn: string;

    /**
     *
     */
    passwordColumn: string;

    /**
     * Как храним пароль
     */
    passDigest: Digest;
}

/**
 * Настройки для файлов
 */
export interface FileConfig {
    /**
     * Путь к файлу
     */
    file: string;

    /**
     * Тип хранения для файла
     */
    digest: Digest;
}

/**
 * Описание пользователя, хранящееся в файле
 */
export interface FileUser {
    username: string;
    password: string;
    ip: string;
}

