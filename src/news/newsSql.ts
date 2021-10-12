import { INewsStorage, NewsResp, QueryMeta } from './INewsStorage';
import { ISqlite } from '../storage/ISqlite';
import { Database } from 'sqlite3';
import { IPassEncrypt } from '../storage/IPassEncrypt';

export class NewsSql implements INewsStorage, ISqlite {
  private _source: ISqlite & IPassEncrypt;

  constructor(source: ISqlite & IPassEncrypt) {
    this._source = source;
  }

  delete(q: QueryMeta): Promise<boolean> {
    return Promise.resolve(false);
  }

  encrypt(s: string): string {
    return this._source.encrypt(s);
  }

  get(q: QueryMeta): Promise<NewsResp> {
    return Promise.reject('');
  }

  getDb(): Database {
    return this._source.getDb();
  }

  put(q: QueryMeta): Promise<number> {
    return Promise.resolve(0);
  }

  update(q: QueryMeta): Promise<boolean> {
    return Promise.resolve(false);
  }
}