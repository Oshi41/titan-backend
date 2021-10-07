import {response} from "express";
import {Database, OPEN_READWRITE, RunResult} from "sqlite3";
import sqlite3 from "sqlite3";
import {PassTransformer} from "../password/passTransformer";
import {SqLiteConfig, User} from "../types/types";
import {Store} from "./store";
import * as sqlite from 'sqlite3';
import {v4 as randomUuid} from 'uuid';

export class SqliteStore extends Store {
    private readonly _config: SqLiteConfig;
    private readonly _path: string;

    constructor(props: PassTransformer, config: SqLiteConfig, path: string) {
        super(props);
        this._config = config;
        this._path = path;

        sqlite3.verbose();
        this.getDatabase(sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE).then(x => x.close());
    }

    protected addInner(login: string, pass: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {

            const uuid: string = randomUuid();
            const sql = `INSERT INTO ${this._config.table} (${this._config.usernameColumn}, ${this._config.passwordColumn}, ${this._config.uuidColumn})
                         VALUES (?, ?, ?)`;

            this.getDatabase(sqlite.OPEN_READWRITE).then(database => {
                database.run(sql, [login, pass, uuid], (result: RunResult, err: Error | null) => {
                    if (err) {
                        console.log(err);
                        reject(err.message);
                    } else {
                        console.log(`Added record: login=${login}, pass=${pass} uuid=${uuid}`);
                        resolve(true);
                    }

                    database.close();
                })
            });
        })
    }

    busy(login: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.getDatabase()
                .then(database => {
                    database.get(`select *
                                  from ${this._config.table}
                                  where ${this._config.usernameColumn} = ?`, [login], (err: Error | null, row: any) => {
                        if (err) {
                            console.log(err);
                            reject(err.message);
                        } else {
                            resolve(row !== undefined);
                        }

                        //database.close();
                    });
                });
        });
    }

    protected checkInner(login: string, pass: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            return this.getDatabase()
                .then(database => {
                    database.get(`select *
                                  from ${this._config.table}
                                  where ${this._config.usernameColumn} = ?
                                    and ${this._config.passwordColumn} = ?`, [login, pass], (err: Error | null, row: any) => {
                        if (err) {
                            console.log(err);
                            reject(err.message);
                        } else {
                            if (row === undefined) {
                                reject('No such user');
                            } else {
                                const result: User = {
                                    login: row[this._config.usernameColumn],
                                    pass: row[this._config.passwordColumn],
                                    uuid: row[this._config.uuidColumn],
                                    access: row[this._config.accessTokenColumn],
                                    server: row[this._config.serverIDColumn],
                                };

                                resolve(result);
                            }
                        }

                        database.close();
                    });
                });
        });
    }

    private getDatabase(mode = sqlite.OPEN_READONLY): Promise<Database> {
        return new Promise<Database>((resolve, reject) => {
            const db = new Database(this._path, mode, err => {
                if (err) {
                    console.log(err);
                    throw new Error(err.message);
                } else {

                    if (mode) {
                        // создал схему, если все хорошо
                        db.run(`CREATE TABLE IF NOT EXISTS ${this._config.table}
                                (
                                    ${this._config.usernameColumn}
                                    TEXT
                                    not
                                    null
                                    PRIMARY
                                    KEY,

                                    ${this._config.passwordColumn}
                                    TEXT
                                    not
                                    null,

                                    ${this._config.uuidColumn}
                                    UNIQUEIDENTIFIER
                                    not
                                    null,

                                    ${this._config.accessTokenColumn}
                                    UNIQUEIDENTIFIER,

                                    ${this._config.serverIDColumn}
                                    UNIQUEIDENTIFIER
                                )`, (err: Error | null) => {
                            if (err) {
                                console.log(err);
                                reject(err.message);
                            }
                            resolve(db);
                        });
                    } else {
                        resolve(db);
                    }
                }
            });
        })
    }
}