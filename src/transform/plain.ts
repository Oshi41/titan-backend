import {IPassTransformer} from "./IPassTransformer";

/**
 * Пароль без преобразований
 * @param original - оригинальное значение
 */
export const plainPass: IPassTransformer = original => original;