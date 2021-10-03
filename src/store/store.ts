/**
 * обертка для работы с хранилищем.
 * В случае ошибок вернет текстовый результат в Promise.reject()
 */
export interface IStore {

    /**
     * Проверка на занятый логин
     * @param login
     */
    busy(login: string): Promise<boolean>;

    /**
     * Проверка пароля
     * @param login - имя пользователя
     * @param pass - пароль
     */
    check(login: string, pass: string): Promise<boolean>;

    /**
     * Добавляем пользователя
     * @param login - имя пользователя
     * @param pass - пароль
     */
    add(login: string, pass: string): Promise<boolean>;
}