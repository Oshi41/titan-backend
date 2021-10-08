import bodyParser from 'body-parser';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import { readConfig } from './config';
import { Md5pass } from './password/md5pass';
import { PassTransformer } from './password/passTransformer';
import { PlainPass } from './password/plainPass';
import { handleBusy } from './routes/busyRouter';
import { handleDownload } from './routes/downloadController';
import { handleAllServers, handleServerInfo } from './routes/handleServerInfo';
import { handleLogin } from './routes/loginController';
import { handleRegister, } from './routes/registerController';
import { handleUuid } from './routes/uuidController';
import { handleAuth, handleMeta } from './routes/yggdrasil';
import { ElyByStore } from './store/elyByStore';
import { FileStore } from './store/fileStore';
import { SqliteStore } from './store/sqliteStore';
import { Store } from './store/store';
import { ConfigTypes, Digest, FileConfig, SqLiteConfig, StoreType } from './types/types';
import { init as loggerInit } from './logger';

loggerInit();

const cors = require('cors');

const getPassTransformer = (digest: Digest): PassTransformer => {
  switch (digest) {
    case 'md5':
      return new Md5pass();

    case 'plain':
      return new PlainPass();

    default:
      throw new Error('Unknown pass type: ' + digest);
  }
};


/**
 * Возвращаю хранилище
 * @param config
 */
const getStore = (config: ConfigTypes): Store => {
  const dirPath: string = './_store';

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  const keys: string[] = Object.keys(config.store);

  if (keys?.length === 1) {

    switch (keys[0] as StoreType) {
      case StoreType.SQLITE:
        // @ts-ignore
        const sqlCfg: SqLiteConfig = config.store[StoreType.SQLITE];
        return new SqliteStore(getPassTransformer(sqlCfg.passDigest), sqlCfg, dirPath + '/users.sqlite');

      case StoreType.ELY:
        return new ElyByStore();

      case StoreType.FILE:
        // @ts-ignore
        const fileCfg: FileConfig = config.store[StoreType.FILE];
        return new FileStore(getPassTransformer(fileCfg.digest), fileCfg);
    }
  }

  throw new Error('unknown store type');
};

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
apiRouter.get('/uuid', handleUuid);
apiRouter.get('/storeType', (req, res, next) => res.send(config.store));

const yggdrasilRouter = express.Router();
yggdrasilRouter.get('/', handleMeta);
yggdrasilRouter.post('*', handleAuth);

app.use(cors());

// статические файлы
app.use(jsonMiddleware);
app.use(express.static(path.resolve('./frontend')));

// роутер
app.use('/api/' + API_VERSION + '/yggdrasil', yggdrasilRouter);
app.use('/api/' + API_VERSION, apiRouter);
app.get('*', (req, res) => {
  res.sendFile(path.resolve('./frontend/index.html'));
});

app.listen(config.port);

console.log(`Service is listening on ${config.port} port`);
