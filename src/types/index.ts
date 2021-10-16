/**
 * Описание пользователя
 */
export interface User {
  /**
   * Логин
   */
  login: string;

  /**
   * Пароль
   */
  pass: string;

  /**
   * UUID пользователя
   */
  uuid: string;

  /**
   * токен доступа
   */
  access: string;

  /**
   * hash сервера
   */
  server?: string;

  /**
   * IP регистрации
   */
  ip?: string;

  /**
   * Роли пользователя
   */
  roles: Roles[];
}

/**
 * Тип хранения пароля
 */
export enum Digest {
  PLAIN = 'plain',
  MD5 = 'md5',
}

/**
 * Текущий конфиг
 */
export interface BackendConfig {
  /**
   * Шифрование пароля
   */
  passEncrypt: Digest;

  /**
   * Порт http
   */
  http: number;

  /**
   * Порт https
   */
  https: number;

  /**
   * Максимальное кол-во учёток под одним IP адресом
   */
  maxUsersPerIP: number;
}

/**
 * Собственная информация о сервере
 */
export interface OwnServerInfo {
  address: string;
}

/**
 * Описание сервера от обычного запроса
 */
export interface ServerInfo {
  servericon: string;
  ip: string;
  port: number;
  debug: {
    ping: any;
    query: any;
    srv: any;
    querymismatch: any;
    ipinsrv: any;
    cnameinsrv: any;
    animatedmotd: any;
    cachetime: any;
    apiversion: string;
  };
  motd: {
    raw: string[];
    clean: string[];
    html: string[];
  };
  players: {
    online: number;
    max: number;
  };
  version: string;
  online: boolean;
  protocol: number;
  hostname: string;
}

/**
 * Тип описания мода, который приходит от Forge
 */
export interface ForgeModInfo {
  modid: string,
  version: string
}

/**
 * Описание forge сервера
 */
export interface ForgeInfo {
  description: string;
  players: {
    max: number;
    online: number;
    sample: { id: string, name: string }[];
  };
  version: {
    name: string;
    protocol: number;
  };
  modinfo: {
    type: string;
    modList: (ModInfo | ForgeModInfo)[];
  };
  latency: number;
}

/**
 * Описание мода
 */
export interface ModInfo {
  /**
   * ID мода
   */
  modid: string;

  /**
   * Wiki страница
   */
  page: string;

  /**
   * Описание
   */
  desc: string;
}

/**
 * Представление новости
 */
export interface NewsItem {
  /**
   * Уникальная 16-сивольная строка
   */
  _id: string;

  /**
   * Автор новости
   */
  author: string;

  /**
   * Дата создания
   */
  date: Date;

  /**
   * Заголовок новости
   */
  name: string;

  /**
   * Текст новости (в формате HTML)
   */
  html: string;

  /**
   * изображение
   */
  image64: string;
}

/**
 * Токен пользователя
 */
export interface WebToken {
  /**
   * Поле из Users
   */
  login: string;

  /**
   * Поле из Users
   */
  id: string;

  /**
   * Тип аутентификации юзера
   */
  auth: UserAuthType;

  /**
   * Список ролей
   */
  roles: Roles[];
}

/**
 * Тип аутентифицированного клиента
 */
export enum UserAuthType {
  Own = 'own',
  ElyBy = 'elyby',
}

/**
 * Возможные типы данных
 */
export enum Roles {
  //
  // CRUD для таблицы пользователей
  // + View привилегия
  //
  UserView = 'user_v',
  UserCreate = 'user_c',
  UserEdit = 'user_e',
  UserDelete = 'user_d',

  //
  // CRUD для таблицы новостей
  //
  NewsCreate = 'news_c',
  NewsEdit = 'news_u',
  NewsDelete = 'news_d',

  //
  // Для таблицы crash reports
  //
  CrashReportView = 'crash_v',
  CrashReportCreate = 'crash_c',
  CrashReportDelete = 'crash_d',

  Comment = 'comment',
}

/**
 * Описание краш репорта
 */
export interface Report {
  login: string;
  date: string;
  comment: string;
  content: string;
  file: string;
}
