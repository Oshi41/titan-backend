import dns from 'dns';
import {Request, Response} from 'express';
import * as fs from 'fs';
import {verify} from "jsonwebtoken";
import {server} from "minecraft-lookup";
import os from 'os';
import {machineId} from 'node-machine-id';
import path from 'path';
import {v4 as uuid} from 'uuid';
import {clientSecret} from "../index";
import {WebToken} from "../types/index";

/**
 * Возвращает текущий ip адрес
 * @returns {Promise<string>}
 */
export const getMachineIp = (): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    dns.lookup(os.hostname(), (err, address, family) => {
      return err
        ? reject(err)
        : resolve(address);
    });
  });
};

/**
 * Возвращает укникальный ID для машины
 */
export const getUniqueMachineId = (): Promise<string> => {
  return machineId(true);
};

/**
 * Создаю путь или файл
 * @param file - путь к папке/файлу
 * @param isFolder - путь - папка?
 */
export const createPath = async (file: string, isFolder = false): Promise<boolean> => {
  try {
    // нормализовали путь
    file = path.normalize(file);

    // пока папки не существуют
    while (!fs.existsSync(path.dirname(file))) {
      // создаю
      await createPath(path.dirname(file), true);
    }

    if (!fs.existsSync(file)) {
      if (isFolder) {
        await fs.promises.mkdir(file);
        console.log('created dir: ' + file);
      } else {
        await fs.promises.writeFile(file, '', 'utf-8');
        console.log('created file: ' + file);
      }

      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

/**
 * Читаю JSON содержимое файла
 * @param file
 */
export const readJson = async <T>(file: string): Promise<T> => {
  const raw: string = await fs.promises.readFile(file, 'utf-8');
  const result: T = JSON.parse(raw) as T;
  return result;
};

/**
 * Печатаю красивый json
 * @param file - файл
 * @param value - любое значение, которое будет сериализовано
 */
export const writeJSON = async (file: string, value: any): Promise<boolean> => {
  try {
    const json: string = JSON.stringify(value, null, 4);
    await fs.promises.writeFile(file, json, 'utf-8');
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

/**
 * Возвращаю IP от запроса
 * @param request - запрос
 */
export const getIp = (request: Request) => {
  const ip: string = request.header('X-Client-IP')
    || request.header('X-Forwarded-For')
    || request.header('CF-Connecting-IP')
    || request.header('Fastly-Client-Ip')
    || request.header('True-Client-Ip')
    || request.header('X-Cluster-Client-IP')
    || request.header('X-Forwarded')
    || request.header('X-Forwarded-For')
    || request.header('Forwarded')
    || request.socket.remoteAddress
    || '';

  return ip;
};

/**
 * Формат обычного uuid.
 * Если передать undefined, сгенерируем рандомный uuid
 * @param s - hex string
 */
export const fromHexString = (s: string | undefined): string => {
  if (!s) {
    s = uuid();
  }

  // @ts-ignore
  return `${s.substr(0, 8)}-${s.substr(8, 4)}-${s.substr(8 + 4, 4)}-${s.substr(8 + 4 + 4, 4)}-${s.substr(
    8 + 4 + 4 + 4)}`;
};

/**
 * Возвращает HEX string
 * @param s
 */
export const toHexString = (s: string | undefined): string => {
  return (s ?? uuid()).split('-')
    .join('');
};

/**
 * Доступные операнды для запроса и сортировки sql
 * @type {string[]}
 */
const operands = [',', 'or', 'and', '=', '<', '>', '+', '-', '!',
  'between', 'like', 'not', 'in', '(', ')',
  'order by', 'limit', 'offset', 'desc', 'asc', 'where', 'date(', 'datetime(']
  // Сначала самые длинные!
  .sort((a, b) => b.length - a.length);

/**
 * Проверяем безопасна ли SQL строка
 * @param {string} sql - запрос
 * @param {string[]} fieldKeys - список полей таблицы. Метод вызовет toLowerCase() для каждого из ключей
 * @returns {boolean} - валидна ли строка
 */
export const checkSqlString = (sql: string, fieldKeys: string[]): boolean => {
  // на всякий случай добавляю пробел для корректного поиска + lower_case
  sql = ` ${sql.toLowerCase()} `;

  // Вырезал все возможные поля. Они через пробел идут!
  sql = removeAll(sql, fieldKeys.map(x => ` ${x} `), ' ');

  // убрал все значения для полей (обязательно в кавычках)
  sql = sql.replace(/'(.*?)'/g, '');

  // убрал операнды
  sql = removeAll(sql, operands);

  // Убираю все числа
  sql = removeAll(sql, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => x + ''));

  return !removeAll(sql, [' ']);
};

/**
 * Преобразую в строку
 * @param date
 */
export const toString = (date: Date): string => {
  return `${date.getFullYear().toString().padStart(4, '0')}.${date.getMonth().toString()
      .padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}` +
    `  ${date.getHours().toString().padStart(2, '0')}.${date.getMinutes().toString()
      .padStart(2, '0')}.${date.getSeconds().toString().padStart(2, '0')}`;
}

/**
 * Читаю дату из моего формата
 * @param s
 */
export const fromString = (s: string): Date => {
  try {
    const [date, time] = s.split('  ');
    const [year, month, day] = date.split('.');
    const [hour, minute, second] = time.split('.');

    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  } catch (e) {
    console.log(e);
    return new Date();
  }
}

/**
 * Удаляю все вхождения этой строки
 * @param {string} source - строка-источник
 * @param {string[]} patterns - список строк, которые вырезаем
 * @param replace - на что заменяем
 * @returns {string}
 */
const removeAll = (source: string, patterns: string[], replace = ''): string => {
  for (let pattern of
    patterns) {
    source = source.split(pattern)
      .join(replace);
  }
  return source;
};

/**
 * Возаращает токен пользователя из заголовка
 * @param request - http(s) запрос
 */
export const getToken = (request: Request): WebToken | undefined => {
  const token = request?.headers?.authorization as string;
  if (!token) {
    return undefined;
  }

  try {
    const decoded = verify(token.replace('Bearer ', ''), clientSecret(), {
      algorithms: ['HS256']
    }) as WebToken;

    if (!decoded?.login) {
      return undefined;
    }

    return decoded;

  } catch (e) {
    console.log(e);
    return undefined;
  }
}

/**
 * Возвращаю уникальные записи в массиве
 * @param a
 */
export const distinct = <T>(a: T[]): T[] => {
  function onlyUnique(value: T, index: number, self: T[]) {
    return self.indexOf(value) === index;
  }

  return a.filter(onlyUnique);
}
