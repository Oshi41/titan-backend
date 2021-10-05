import * as dns from 'dns';
import * as os from 'os';
import path from 'node:path';
import {promises as fs} from 'fs';
import {glob, GlobSync} from 'glob';


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
 * Ищет файлы по маскам
 * @param mask
 */
const findFiles = (mask: string): Promise<string[]> => {
    return new Promise<string[]>((resolve, reject) => {
        glob(mask, (err, matches) => {
            if (err) {
                reject(err)
            } else {
                resolve(matches);
            }
        });
    })
}

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
    let fileContent: string = await fs.readFile(launcherServerPath, 'utf-8');
    if (fileContent) {
        fileContent = fileContent
            .replace('127.0.0.1', ip)
            .replace('localhost', ip);

        await fs.writeFile(launcherServerPath, fileContent, 'utf-8');
    }

    let folderPath: string = path.resolve(sashok, 'profiles');
    let files: string[] = await fs.readdir(folderPath);
    if (files?.length > 0) {
        for (let file of files) {
            file = path.resolve(folderPath, file);

            fileContent = await fs.readFile(file, 'utf-8');
            if (fileContent) {
                fileContent = fileContent.replace('server.tld', ip);
                await fs.writeFile(file, fileContent, 'utf-8');
            }
        }
    }

    const configFile = path.resolve(sashok, 'runtime', 'config.js');
    fileContent = await fs.readFile(configFile, 'utf-8');
    if (fileContent) {
        fileContent = fileContent
            .replace('https://launcher.sashok724.net/', `http://${ip}:5001`)
            .replace('Бесплатные окна', `Регистрация`)
            .replace('http://bit.ly/1SP0Rl8', `http://${ip}:5001/registration`);

        await fs.writeFile(configFile, fileContent, 'utf-8');
    }

    // заменили на нужный ip путь к бэку для [frontend]
    files = await findFiles(front + '/**/*.s');
    if (files?.length > 0) {
        for (let file of files) {
            fileContent = await fs.readFile(file, 'utf-8');
            if (fileContent) {
                fileContent = fileContent.replace('localhost:5001', ip);
                await fs.writeFile(file, fileContent, 'utf-8');
            }
        }
    }
};

setup();