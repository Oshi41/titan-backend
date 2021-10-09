import {IPassTransformer} from "../transform/IPassTransformer";
import {User} from "../types/index";

/**
 * Абстрактоное хранилище
 */
export abstract class IStorage {
    private readonly _pass: IPassTransformer;
    protected _admin: User = {
        login: '',
        pass: '',
        uuid: '',
        access: '',
        server: '',
        ip: '',
    };

    protected constructor(pass: IPassTransformer) {
        this._pass = pass;
    }

    /**
     * ВОзаращаю зашифрованную строку
     * @param text
     * @protected
     */
    public encrypt(text: string): string {
        return this._pass(text);
    }

    /**
     * Добавляем пользователя в БД
     * @param user
     */
    public abstract add(user: User): Promise<User>;

    /**
     * Поиск User по колонкам
     * @param args
     */
    public abstract find(...args: [string, unknown][]): Promise<User[]>;

    /**
     * Удаление объекта
     * @param user
     */
    public abstract delete(user: User): Promise<boolean>;

    /**
     * Обновляем объект. Ключ поменяться не должен!!!
     * @param user
     */
    public abstract update(user: User): Promise<boolean>;

    /**
     * возвращает инстанс администратора Майнкрафта
     */
    public admin(): User {
        return this._admin;
    }
}