/**
 * обертка для работы с хранилищем.
 * В случае ошибок вернет текстовый результат в Promise.reject()
 */
import {PassTransformer} from "../password/passTransformer";
import {User} from "../types/types";

/**
 * Базовый класс для хранилища
 */
export abstract class Store {
    private _transform: PassTransformer;

    protected constructor(transform: PassTransformer) {
        this._transform = transform;
    }

    /**
     * Проверка на занятый логин
     * @param login - имя пользователя
     */
    public abstract busy(login: string): Promise<boolean>;

    /**
     * Проверяю правильность ввода
     * @param login - логин
     * @param pass - пароль уже в том виде, который есть в БД
     * @protected
     */
    protected abstract checkInner(login: string, pass: string): Promise<User>;

    /**
     * Добавляю запись в БД
     * @param login
     * @param pass
     * @protected
     */
    protected abstract addInner(login: string, pass: string): Promise<boolean>;

    /**
     * Проверка пароля
     * @param login - имя пользователя
     * @param pass - пароль (в неизменном виде)
     */
    public check(login: string, pass: string): Promise<User> {
        return this.checkInner(login, this._transform.transform(pass));
    }

    /**
     * Добавляем пользователя
     * @param login - имя пользователя
     * @param pass - пароль (в неизменном виде)
     */
    public add(login: string, pass: string): Promise<boolean>{
        return this.addInner(login, this._transform.transform(pass));
    }
}