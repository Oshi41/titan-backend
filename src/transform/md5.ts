import md5 from "md5";
import {IPassTransformer} from "./IPassTransformer";

/**
 * Создает md5 на основе пароля
 * @param original - оригинальная строка
 */
export const md5Pass: IPassTransformer = original => {
    return md5(original);
}