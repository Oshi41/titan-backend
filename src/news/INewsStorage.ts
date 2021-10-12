import { IPassTransformer } from '../transform/IPassTransformer';
import { NewsItem, User } from '../types';
import { IPassEncrypt } from '../storage/IPassEncrypt';

/**
 * аргумент запроса
 */
export type QueryMeta = {
  user?: User;

  /**
   * Параметр для удаления/изменения/добавления новости
   */
  newsItem?: NewsItem;

  /**
   * индекс запрашиваемой страницы
   */
  page?: number;

  /**
   * Размер страницы
   */
  size?: number;

  /**
   * Сортировка по полям
   */
  orderBy?: [ string, 'acs' | 'desc' ][],

  /**
   * Должно быть валидной SQL инструкцией
   */
  filters?: string;
};

export type NewsResp = {
  /**
   * Общее кол-во страниц
   */
  total_page_count: number;

  /**
   * Список новостей
   */
  news: NewsItem[];
}

export interface INewsStorage extends IPassEncrypt {

  /**
   * Запрашиваю список новостей
   * @param {QueryMeta} q - текущий запрос
   * @returns {Promise<NewsResp>}
   */
  get(q: QueryMeta): Promise<NewsResp>;

  /**
   * Помещаю новость
   * @returns {Promise<number>}
   * @param q
   */
  put(q: QueryMeta): Promise<NewsItem>;

  /**
   * Обновляю текущую новость
   * @returns {Promise<boolean>}
   * @param q
   */
  update(q: QueryMeta): Promise<boolean>;

  /**
   * Удаляю данную новость
   * @returns {Promise<boolean>}
   * @param q
   */
  delete(q: QueryMeta): Promise<boolean>;
}