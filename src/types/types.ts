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



