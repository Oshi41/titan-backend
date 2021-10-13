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
   * Сервер
   */
  server?: string;

  /**
   * IP регистрации
   */
  ip?: string;
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
    modList: { modid: string, version: string }[];
  };
  latency: number;
}

/**
 * Сайт данного мода
 */
export interface ModInfo {
  modid: string;
  page: string;
}

/**
 * Представление новости
 */
export interface NewsItem {
  /**
   * uuid новости
   */
  id: string;

  /**
   * Автор новости
   */
  author: string;

  /**
   * Дата создания
   */
  date: string;

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
  image: Blob;
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
  Moderator = 'moderator',
  Comment = 'comment',
}
