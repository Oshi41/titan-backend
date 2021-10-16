import {BackendConfig, NewsItem, Roles, User} from './types';
import bodyParser from 'body-parser';
import express, {Application} from 'express';
import Nedb from "nedb";
import path from 'path';
import {v4 as uuid} from "uuid";
import {getApiRouter} from './api/1.0';
import {getYggdrasilRouter} from './api/yggdrasil';
import {readCfg} from './init/cfg';
import {getNewsDb, getUsersDb} from "./init/db";
import {checkDownloadFolder} from './init/download';
import {initLog} from './init/log';
import {getPass} from "./init/pass";
import {setServers} from './init/srv';
import {IPassTransformer} from "./transform/IPassTransformer";
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import {Server} from 'https';
import {getUniqueMachineId} from "./utils/index";

const cors = require('cors');

/////////////////////////////////////
// Поля в файле инициализируются в //
// порядке объявления!             //
/////////////////////////////////////

/**
 * Секрет для JWT
 */
const _clientSecret = process.env.NODE_ENV === 'production'
  ? uuid()
  : '12345';

/**
 * Конфиг приложения
 */
let _config: BackendConfig;

/**
 * Текущий преобразователь пароля
 */
let _transform: IPassTransformer;

/**
 * Администратор. Иничиализируется ДО запросов к БД,
 * т.к. на момент создания БД уже должен быть заполненным
 */
let _admin: User = {
  login: 'admin_owner',
  pass: '', // это просто чтобы TS не жаловался, заменю в любом случае
  uuid: '11111111-2222-3333-4444-555555555555',
  ip: '127.0.0.1',
  access: uuid(), // тут будет рандомное число
  server: 'server',
  roles: [],
} as User;

/**
 * Хранилище пользователей
 */
let _usersStorage: Nedb<User>;

/**
 * Хранилище для новостей
 */
let _newsStorage: Nedb<NewsItem>;

let app: Application;

const onStartUp = async () => {
  // самый первый шаг
  initLog();

  // Получил уникальный ID для машины
  const unique: string = await getUniqueMachineId();
  console.log(`unique machine id is: ${unique}`);

  // прочитал конфиг
  _config = await readCfg();

  // создал папки для списка серверов
  await setServers();

  // Должно быть раньше, чем инициализация БД!!!
  _transform = getPass(_config.passEncrypt);

  for (let value in Roles) {
    // @ts-ignore
    _admin.roles.push(Roles[value] as Roles);
  }

  // заполнил пароль
  _admin.pass = _transform(unique);

  // Получил БД пользователей
  _usersStorage = await getUsersDb();

  // прочитал данные админа
  _usersStorage.findOne({login: _admin.login}, (err, doc) => {
    if (err) {
      throw err;
    }

    _admin = doc;
  });

  // Получил БД новостей
  _newsStorage = await getNewsDb();

  // Создал папку для закачек
  await checkDownloadFolder();

  // настройки cors
  const corsOts = {
    origin: '*',
    // Allow follow-up middleware to override this CORS for options
    preflightContinue: true,
    exposedHeaders: ['Authorization']
  };

  // создал express server
  app = express();

  // роутер для API
  const {url: apiUrl, router: apiRouter} = getApiRouter();
  app.use(apiUrl, cors(corsOts), apiRouter);

  // роутер для Yggdrasil
  const {url: yggUrl, router: yggRouter} = getYggdrasilRouter();
  app.use(yggUrl, cors(corsOts), yggRouter);

  app.use(bodyParser.json());

  // статические файлы
  app.use(express.static(path.resolve('./frontend')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('./frontend/index.html'));
  });

  // Тут настраиваю https ключ
  const server: Server = https.createServer({
    key: fs.readFileSync(path.resolve('_storage', 'ssl', 'selfsigned.key')),
    cert: fs.readFileSync(path.resolve('_storage', 'ssl', 'selfsigned.cert')),
  }, app);

  http.createServer(app)
    .listen(_config.http, () => {
      console.log('http is listening on port:' + _config.http);
    });

  server.listen(_config.https, () => {
    console.log('https is listening on port:' + _config.https);
  });
};

onStartUp();

/////////////////////////////////////////
// Export section
/////////////////////////////////////////

export const clientSecret = (): string => {
  return _clientSecret;
}

export const config = (): BackendConfig => {
  return _config;
}

export const transform = (): IPassTransformer => {
  return _transform;
}

export const admin = (): User => {
  return _admin;
}

export const usersStorage = (): Nedb<User> => {
  return _usersStorage;
}

export const newsStorage = (): Nedb<NewsItem> => {
  return _newsStorage;
}