import * as fs from 'fs';
import path from 'path';
import { Database } from 'sqlite3';
import * as sqlite from 'sqlite3';
import { createPath, getUniqueMachineId } from '../utils/index';
import { IPassTransformer } from '../transform/IPassTransformer';
import { User } from '../types/index';
import { IStorage } from './IStorage';
import { v4 as randomUUID } from 'uuid';
import { ISqlite } from './ISqlite';
import { IPassEncrypt } from './IPassEncrypt';

const file = path.resolve('_storage', 'users.sqlite');

const table = 'users';

export class UsersSql extends IStorage implements ISqlite {
  // @ts-ignore
  private _db: Database;

  constructor(pass: IPassTransformer) {
    super(pass);

    createPath(file).then(value => {
      if (value === false) {
        console.log('cannot create db file:' + file);
        throw new Error('cannot create db file:' + file);
      }

      this._db = sqlite.cached.Database(file);

      if (value) {
        this.getDb().serialize(() => {

          const columns: string = Object.keys(this.admin()).map((value, index) => {
            switch (index) {
              case 0:
                return `${value} text unique not null primary key`;

              case 1:
                return `${value} text not null check(length(${value}) >= 5)`;

              case 2:
                return `${value} text not null unique`;

              case 3:
              case 4:
                return `${value} text not null`;

              default:
                return `${value} text`;
            }
          }).join(', ');

          this.getDb().run(`create table if not exists ${table}
                            (
                                ${columns}
                            )`, (error: Error | null) => {
            if (error) {
              console.log(error);
              throw new Error(error.message);
            } else {
              console.log('database was created');

              getUniqueMachineId().then(x => {

                console.log('!!!!!!!!!!!!!!!!!!unique machine ID is:' + x + '!!!!!!!!!!!!!!!!!!!!!!!!');

                this._admin = {
                  login: 'admin_owner',
                  pass: this.encrypt(x),
                  uuid: '11111111-2222-3333-4444-555555555555',
                  ip: '127.0.0.1',
                  access: '123123',
                  server: 'server',
                };

                this.add(this.admin());
              });
            }
          });
        });
      }
    });
  }

  async add(user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      if (!user.uuid) {
        user.uuid = randomUUID();
      }

      if (!user.access) {
        user.access = randomUUID();
      }

      if (!user.server) {
        user.server = randomUUID();
      }

      user.pass = user.pass ? this.encrypt(user.pass) : '';

      try {
        this.getDb().run(`insert into ${table} (${Object.keys(user).join(', ')})
                          values (${Object.values(user).map(x => `'${x}'`).join(', ')})`, (err: Error | null) => {
          if (err) {
            return reject(err.message);
          }

          return resolve(user);
        });
      } catch (e) {
        console.log(e);
        return reject(e + '');
      }
    });
  }

  delete(user: User): Promise<boolean> {
    return Promise.resolve(false);
  }

  find(...args: [ string, unknown ][]): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const sql = `select *
                   from ${table}
                   where ${args.map(x => `${x[0]}='${x[1]}'`).join(' and ')}`;
      this.getDb().all(sql, (err: Error | null, rows: User[]) => {
        if (err) {
          return reject(err.message);
        }

        return resolve(rows ?? []);
      });
    });
  }

  update(user: User): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const users: User[] = await this.find([ 'login', user.login ]);
      if (users?.length !== 1) {
        return reject('No user founded, use add method imstead!');
      }

      const original = users[0];


      const sql = `update ${table}
                   set ${Object.entries(user).map(([ k, v ]) => `${k}='${v}'`).join(', ')} ` +
        `where login = '${original.login}'`;

      this.getDb().run(sql, (err: Error | null) => {
        if (err) {
          console.log(err);
          return reject(err);
        }

        return resolve(true);
      });
    });
  }

  getDb(): Database {
    return this._db;
  }
}