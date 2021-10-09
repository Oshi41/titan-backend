import * as fs from "fs";
import path from "path";
import {Database} from "sqlite3";
import * as sqlite from "sqlite3";
import {getUniqueMachineId} from "../utils/index";
import {IPassTransformer} from "../transform/IPassTransformer";
import {User} from "../types/index";
import {IStorage} from "./IStorage";
import {v4 as randomUUID} from 'uuid';

const file = path.resolve('_storage', 'users.sqlite');

const table = 'users';

export class Sqlite extends IStorage {
    private _db: Database;

    constructor(pass: IPassTransformer) {
        super(pass);

        if (!fs.existsSync(path.dirname(file))) {
            fs.mkdirSync(path.dirname(file));
            console.log('folder created');
        }

        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, '', "utf-8");
            console.log('created db file');
        }

        this._db = sqlite.cached.Database(file);

        this._db.serialize(() => {

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

            this._db.run(`create table if not exists ${table}
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
                    })
                }
            });
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
                this._db.run(`insert into ${table} (${Object.keys(user).join(', ')})
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

    find(...args: [string, unknown][]): Promise<User[]> {
        return new Promise((resolve, reject) => {
            const sql = `select *
                         from ${table}
                         where ${args.map(x => `${x[0]}='${x[1]}'`).join(' and ')}`;
            this._db.all(sql, (err: Error | null, rows: User[]) => {
                if (err) {
                    return reject(err.message);
                }

                return resolve(rows ?? []);
            })
        });
    }

    update(user: User): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const users: User[] = await this.find(['login', user.login]);
            if (users?.length !== 1) {
                return reject('No user founded, use add method imstead!');
            }

            const original = users[0];


            const sql = `update ${table}
                         set ${Object.entries(user).map(([k, v]) => `${k}='${v}'`).join(', ')} ` +
                `where login = '${original.login}'`;

            this._db.run(sql, (err: Error | null) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }

                return resolve(true);
            })
        });
    }
}