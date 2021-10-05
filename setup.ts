import * as dns from 'dns';
import * as os from 'os';
import path from 'node:path';
import * as fs from 'fs';
import { glob } from 'glob';
import {Config} from 'cfg-reader';

/**
 * Ищу настройку по параметру
 * @param {string} name - имя аргумента
 * @param {string[]} all - список аргументов
 * @returns {string | undefined} - undefined - настройки нет
 */
const findSettings = (name: string, all: string[]): string | undefined => {
  const indexOf: number = all.indexOf(name);
  if (indexOf < 0) {
    return undefined;
  }

  return all[indexOf + 1];
};

/**
 * Возвращает текущий ip
 * @returns {Promise<string>}
 */
const getIp = (): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    dns.lookup(os.hostname(), (err, address, family) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(address);
    });
  });
};

/**
 * Настройка для сайта + сервиса лаунчера
 *
 * Запускать ts-node ./setup.ts [АРГУМЕНТЫ]
 *
 * Аргументы:
 * --front ПУТЬ
 * Путь к папке с исходниками frontend
 *
 * --back ПУТЬ
 * Путь к папке с исходниками backend
 *
 *  --sashok ПУТЬ
 * Путь к папке с лаунч сервером

 */
const setup = async () => {
  const params: string[] = process.argv.splice(2);

  const front: string | undefined = findSettings('--front', params);
  if (!front) {
    throw new Error('no path to frontend folder');
  }

  const back: string | undefined = findSettings('--back', params);
  if (!back) {
    throw new Error('no path to backend folder');
  }

  const sashok: string | undefined = findSettings('--sashok', params);
  if (!sashok) {
    throw new Error('no path to launcher server folder');
  }

  let ip: string = await getIp();

  const launcherServerPath: string = path.resolve(sashok, 'LaunchServer.cfg');

  if (fs.existsSync(launcherServerPath)){
    const config = new Config(launcherServerPath);

    console.log(config.get('address'));
  }

  // заменили на нужный ip путь к бэку для [frontend]
  glob(front + '**/*.*s', (err, matches) => {
    if (!err) {
      for (let file of matches) {
        fs.readFile(file, 'utf-8', (err1, data) => {
          if (!err) {
            const content: string = data.replace('localhost:5001', ip);
            fs.writeFile(file, content, err2 => {
              if (err) {
                console.log(err);
              }
            });
          } else {
            console.log(err);
          }
        });
      }
    } else {
      console.log(err);
    }
  });
};

setup();