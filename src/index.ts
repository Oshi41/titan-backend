import bodyParser from 'body-parser';
import {randomUUID} from "crypto";
import express, {Application} from 'express';
import path from 'path';
import {getApiRouter} from './api/1.0';
import {getYggdrasilRouter} from './api/yggdrasil';
import {readCfg} from './init/cfg';
import {checkDownloadFolder} from './init/download';
import {initLog} from './init/log';
import {getPass} from './init/pass';
import {setServers} from './init/srv';
import {IStorage} from './storage/IStorage';
import {UsersSql} from './storage/usersSql';
import {BackendConfig} from './types';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import {Server} from 'https';
import * as jwt from 'express-jwt';

const cors = require('cors');

/**
 * Конфиг приложения
 */
export let config: BackendConfig;

/**
 * Хранилище пользователей
 */
export let usersStorage: IStorage;

/**
 * Секрет для JWT
 */
export const clientSecret = randomUUID();

let app: Application;

const onStartUp = async () => {
  // самый первый шаг
  initLog();

  config = await readCfg();
  await setServers();
  usersStorage = new UsersSql(getPass(config.passEncrypt));
  await checkDownloadFolder();

  app = express();
  const {url: apiUrl, router: apiRouter} = getApiRouter();
  app.use(apiUrl, apiRouter);

  const {url: yggUrl, router: yggRouter} = getYggdrasilRouter();
  app.use(yggUrl, yggRouter);

  app.use(cors());

  app.use(bodyParser.json());

  // статические файлы
  app.use(express.static(path.resolve('./frontend')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('./frontend/index.html'));
  });

  const server: Server = https.createServer({
    key: fs.readFileSync(path.resolve('_storage', 'ssl', 'selfsigned.key')),
    cert: fs.readFileSync(path.resolve('_storage', 'ssl', 'selfsigned.cert')),
  }, app);

  http.createServer(app)
    .listen(config.http, () => {
      console.log('http is listening on port:' + config.http);
    });

  server.listen(config.https, () => {
    console.log('https is listening on port:' + config.https);
  });
};

onStartUp();