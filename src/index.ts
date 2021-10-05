import {exists} from "fs";
import * as fs from 'fs';

const cors = require('cors');
import path from "path";
import express from 'express';
import {readConfig} from "./config";
import {Md5pass} from "./password/md5pass";
import {PassTransformer} from "./password/passTransformer";
import {PlainPass} from "./password/plainPass";
import {handleDownload} from "./routes/downloadController";
import {handleAllServers, handleServerInfo} from "./routes/handleServerInfo";
import {handleLogin} from "./routes/loginController";
import {handleRegister,} from "./routes/registerController";
import {SqliteStore} from "./store/sqliteStore";
import {IStore} from "./store/store";
import {ConfigTypes, Digest, StoreType} from "./types/types";
import {handleBusy} from "./routes/busyRouter";
import bodyParser from "body-parser";

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
export const config: ConfigTypes = readConfig(path.resolve('./_config.json'));

/**
 * текущий шифровщик пароля
 */
export const pass: PassTransformer = getPassTransformer(config.digest);

/**
 * текущее хранилище
 */
export const store: IStore = getStore(config.store);


const app = express();

const apiRouter = express.Router();
let jsonMiddleware = bodyParser.json();

apiRouter.post('/register', jsonMiddleware, handleRegister);
apiRouter.get('/login', handleLogin);
apiRouter.get('/busy', handleBusy);
apiRouter.get('/download', handleDownload);
apiRouter.get('/minecraftServer', handleServerInfo);
apiRouter.get('/myServers', handleAllServers);

app.use(cors());

// статические файлы
app.use(jsonMiddleware);
app.use(express.static(path.resolve('./frontend')));

// роутер
app.use('/api/' + API_VERSION, apiRouter);
app.get('*', (req, res) => {
    res.sendFile(path.resolve('./frontend/index.html'));
});

app.listen(config.port);

console.log(`Service is listening on ${config.port} port`);



