import {IPassTransformer} from "../transform/IPassTransformer";
import {User} from "../types/index";
import { IPassEncrypt } from './IPassEncrypt';

/**
 * Абстрактоное хранилище
 */
export abstract class IStorage implements IPassEncrypt{
    private readonly _pass: IPassTransformer;
    protected _admin: User = {
        login: 'admin_owner',
        pass: '',
        uuid: '11111111-2222-3333-4444-555555555555',
        ip: '127.0.0.1',
        access: '123123',
        server: 'server',
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