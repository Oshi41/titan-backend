import {Database, RunResult, Statement} from "sqlite3";
import sqlite3 from "sqlite3";
import {User} from "../types/types";
import {IStore} from "./store";
import * as sqlite from 'sqlite3';

export class SqliteStore implements IStore {
    private tableName = 'USERS';
    private _database: Database;

    constructor(path: string) {
        sqlite3.verbose();

        this._database = new Database(path, sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, err => {
            if (err) {
                console.log(err);
                throw new Error(err.message);
            }
        });

        // создал схему, если все хорошо
        this._database.run(`CREATE TABLE IF NOT EXISTS ${this.tableName}
                            (
                                login varchar(30) PRIMARY KEY,
                                pass varchar(60)
                            )`, (err: Error | null) => {
            if (err){
                console.log(err);
                throw new Error(err.message);
            }
        });
    }

    add(login: string, pass: string): Promise<boolean> {
        const promise = new Promise<boolean>((resolve, reject) => {
            this._database.run(`INSERT INTO ${this.tableName} (login, pass)
                                VALUES (?, ?)`, [login, pass], (result: RunResult, err: Error | null) => {
                if (err) {
                    console.log(err);
                    reject(err.message);
                    return;
                }

                resolve(true);
            });
        });

        return promise;
    }

    busy(login: string): Promise<boolean> {
        const promise = new Promise<boolean>((resolve, reject) => {
            this._database.get(`SELECT *
                                from ${this.tableName}
                                where login=?`, [login], (err: Error | null, row: User) => {
                if (err) {
                    console.log(err);
                    reject(err.message);
                    return;
                }

                resolve(row !== undefined);
            });
        });

        return promise;
    }

    check(login: string, pass: string): Promise<boolean> {
        const promise = new Promise<boolean>((resolve, reject) => {
            this._database.get(`SELECT *
                                from ${this.tableName}
                                where login=?
                                  and pass=?`, [login, pass], (err: Error | null, row: User) => {
                if (err) {
                    console.log(err);
                    reject(err.message);
                    return;
                }

                resolve(row !== undefined);
            });
        });

        return promise;
    }
}