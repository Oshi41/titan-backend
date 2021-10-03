/**
 * Преобразовывает пароль
 */
export interface PassTransformer {
    /**
     * Возвращает строку на основе пароля
     * @param pass
     */
    transform(pass: string): string;
}