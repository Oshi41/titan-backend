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
import {handleAuth} from "./routes/yggdrasil";
import {ElyByStore} from "./store/elyByStore";
import {FileStore} from "./store/fileStore";
import {SqliteStore} from "./store/sqliteStore";
import {Store} from "./store/store";
import {ConfigTypes, Digest, FileConfig, StoreType} from "./types/types";
import {handleBusy} from "./routes/busyRouter";
import bodyParser from "body-parser";

const getPassTransformer = (digest: Digest): PassTransformer => {
    switch (digest) {
        case "md5":
            return new Md5pass();

        case "plain":
            return new PlainPass();

        default:
            throw new Error('Unknown pass type: ' + digest);
    }
}


/**
 * Возвращаю хранилище
 * @param config
 */
const getStore = (config: ConfigTypes): Store => {
    const dirPath: string = './_store';

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }


    switch (config.store.type) {
        case "sqlite":
            // @ts-ignore
            return new SqliteStore(getPassTransformer(config.store.config.passDigest), config.store.config, dirPath + '/users.sqlite');

        case "ely.by":
            return new ElyByStore();

        case "file":
            // @ts-ignore
            return new FileStore(getPassTransformer(config.store.config.digest), config.store.config);
    }

    throw new Error('unknown store type: ' + config.store.type);
}

export const API_VERSION = '1.0';

// получил конфиг файл
export const config: ConfigTypes = readConfig(path.resolve('./_config.json'));
/**
 * текущее хранилище
 */
export const store: Store = getStore(config);


const app = express();

const apiRouter = express.Router();
let jsonMiddleware = bodyParser.json();

apiRouter.post('/register', jsonMiddleware, handleRegister);
apiRouter.get('/login', handleLogin);
apiRouter.get('/busy', handleBusy);
apiRouter.get('/download', handleDownload);
apiRouter.get('/minecraftServer', handleServerInfo);
apiRouter.get('/myServers', handleAllServers);
apiRouter.get('/storeType', (req, res, next) => res.send(config.store));

apiRouter.post('/authenticate', handleAuth);

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



