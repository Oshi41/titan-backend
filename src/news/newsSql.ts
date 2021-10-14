import {INewsStorage, NewsResp, QueryMeta} from './INewsStorage';
import {ISqlite} from '../storage/ISqlite';
import {Database} from 'sqlite3';
import path from 'path';
import {IPassTransformer} from '../transform/IPassTransformer';
import {checkSqlString, createPath} from '../utils';
import * as sqlite from 'sqlite3';
import {NewsItem} from '../types';
import {Blob} from 'buffer';
import {v4 as uuid} from 'uuid';

const file = path.resolve('_storage', 'news.sqlite');
const table = 'news';

const debugItem = {
  id: '',
  image: new Blob([]),
  html: '',
  date: '',
  author: '',
  name: ''
} as NewsItem;

export class NewsSql implements INewsStorage, ISqlite {
  private readonly _transform: IPassTransformer;
  // @ts-ignore
  private _db: Database;

  constructor(transform: IPassTransformer) {
    this._transform = transform;

    createPath(file)
      .then(x => {
        this._db = sqlite.cached.Database(file, err => {
          if (err) {
            console.log(err);
            throw new Error(err?.message);
            // создаем БД впервые
          } else if (x === true) {
            this.getDb()
              .serialize(() => {
                // просто как референс!!!
                // const example = {
                //   id: '',
                //   date: '',
                //   name: '',
                //   author: '',
                //   html: '',
                //   image: new Blob([])
                // } as NewsItem;

                this.getDb()
                  .run(`create table ${table}
                        (` +
                    `id text primary key unique,` +
                    `date text not null,` +
                    `name text not null,` +
                    `author text not null,` +
                    `html text not null,` +
                    `image blob` +
                    ')', err1 => {
                    if (err1) {
                      console.log(err1);
                      throw new Error(err1?.message);
                    } else {
                      console.log('news db was created!');
                    }
                  });
              });
          }
        });
      });
  }

  delete(q: QueryMeta): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const id: string | undefined = q?.newsItem?.id;
      if (id === undefined) {
        return reject('no ID provided!');
      }

      this.getDb()
        .all(`delete
              from ${table}
              where id = '${id}'`, (err: Error | null, rows: NewsItem[]) => {
          if (err) {
            console.log(err.message);
            return reject(err.message);
          }

          this.get({
            filters: `where id = '${id}'`
          })
            .then(value => {
              return resolve(value.news.length === 0);
            });
        });

      // this.get({
      //   newsItem: {
      //     id
      //   } as NewsItem
      // })
      //   .then(x => {
      //     if (x.news.length !== 1) {
      //       return resolve(false);
      //     }
      //
      //     this.getDb()
      //       .run(`delete
      //             from ${table}
      //             where id = ${id}`, err => {

      //
      //         return resolve(true);
      //       });
      //   });


    });
  }

  encrypt(s: string): string {
    return this._transform(s);
  }

  get(q: QueryMeta): Promise<NewsResp> {
    return new Promise((resolve, reject) => {
      if (q.filters && !checkSqlString(q.filters, Object.keys(debugItem))) {
        return reject('Wrong SQL request!');
      }

      let sql = `select *
                 from ${table} `;

      if (q.filters) {
        sql += `${q.filters} `;
      }

      this.getDb()
        .all(sql, (err: Error | null, rows: NewsItem[]) => {
          if (err) {
            console.log(err);
            return reject(err.message);
          }

          let result = rows;
          let total = 0;

          // @ts-ignore
          if (q?.page >= 0 && q?.size > 0) {
            // @ts-ignore
            result = result.slice(q.page * q.size, (1 + q.page) * q.size);
            // @ts-ignore
            total = Math.ceil(rows.length / q.size);
          }

          const resp = {
            news: result,
            total_page_count: total
          } as NewsResp;

          resolve(resp);
        });
    });
  }

  getDb(): Database {
    return this._db;
  }

  put(q: QueryMeta): Promise<NewsItem> {
    return new Promise((resolve, reject) => {
      if (!q.newsItem) {
        console.log('no item provided');
        return reject('no item provided');
      }

      // генерирую новый ID
      if (!q.newsItem.id) {
        q.newsItem.id = uuid();
      }

      const columns: string = Object.keys(q.newsItem)
        .join(', ');
      const values: any = Object.values(q.newsItem)
        .map(x => `'${x}'`)
        .join(', ');
      const sql = `insert into ${table} (${columns})
                   values (${values})`;

      this.getDb()
        .run(sql, err => {
          if (err) {
            console.log('no item provided');
            return reject(err.message);
          }

          resolve({...q.newsItem} as NewsItem);
        });
    });
  }

  update(q: QueryMeta): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!q.newsItem) {
        console.log('no item provided');
        return reject('no item provided');
      }

      const sql = `update ${table}
                   set ${Object.entries(q.newsItem)
                           .map(([key, value]) => `${key} = '${value}'`)
                           .join(', ')}` +
        `where id = '${q.newsItem.id}'`;

      this.getDb()
        .run(sql, err => {
          if (err) {
            console.log('no item provided');
            return reject(err.message);
          }

          resolve(true);
        });
    });
  }
}