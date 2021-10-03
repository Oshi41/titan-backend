import * as fs from 'fs';
import 'reflect-metadata'
import {Express} from 'express-serve-static-core';
import path from "path";
import {createExpressServer} from "routing-controllers";
import {readConfig} from "./config";
import {Md5pass} from "./password/md5pass";
import {PassTransformer} from "./password/passTransformer";
import {PlainPass} from "./password/plainPass";
import {LoginController} from "./routes/loginController";
import {RegisterController} from "./routes/registerController";
import {SqliteStore} from "./store/sqliteStore";
import {IStore} from "./store/store";
import {ConfigTypes, Digest, StoreType} from "./types/types";

/**
 * Получаю возможный шифровщик пароля
 * @param type
 */
const getPassTransformer = (type: Digest): PassTransformer => {
    switch (type) {
        case "md5":
            return new Md5pass();

        case "plain":
            return new PlainPass();

        default:
            throw new Error('unknown type: ' + type);
    }
};

/**
 * Возвращаю хранилище
 * @param type - тип хранилища
 */
const getStore = (type: StoreType): IStore => {
    const dirPath: string = './_store';

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }


    switch (type) {
        case "sqlite":
            return new SqliteStore(dirPath + '/users.sqlite');

        default:
            throw new Error('unknown store type: ' + type);
    }
}

export const API_VERSION = '1.0';

// получил конфиг файл
const config: ConfigTypes = readConfig(path.resolve('./_config.json'));

/**
 * текущий шифровщик пароля
 */
export const pass: PassTransformer = getPassTransformer(config.digest);

/**
 * текущее хранилище
 */
export const store: IStore = getStore(config.store);

const app: Express = createExpressServer(({
    routePrefix: `/api/${API_VERSION}`,
    controllers: [
        RegisterController,
        LoginController,
        // DefaultRouter,
    ],
    defaultErrorHandler: true,
}));

app.listen(config.port);

console.log(`Service is listening on ${config.port} port`);



