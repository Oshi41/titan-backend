/**
 * Преобразователь пароля
 */
export interface IPassTransformer {
    (original: string): string;
}