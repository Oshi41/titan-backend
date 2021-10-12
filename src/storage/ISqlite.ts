import { Database } from 'sqlite3';

/**
 * Предоставляет доступ к SQL БД
 */
export interface ISqlite {
  /**
   * Возвращает текущую БД
   * @returns {Database}
   */
  getDb(): Database;
}