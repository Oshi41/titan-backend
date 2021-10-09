import dns from 'dns';
import {Request} from "express";
import * as fs from "fs";
import os from 'os';
import {machineId} from 'node-machine-id';
import path from "path";

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
}

/**
 * Создаю путь или файл
 * @param file - путь к папке/файлу
 * @param isFolder - путь - папка?
 */
export const createPath = async (file: string, isFolder = false): Promise<boolean | undefined> => {
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

            return true;
        }

        return false;
    } catch (e) {
        console.log(e);
        return undefined;
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
}

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
}

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
}

/**
 * Формат обычного uuid
 * @param s - hex string
 */
export const fromHexString = (s: string): string => {
    return `${s.substr(0, 8)}-${s.substr(8, 4)}-${s.substr(8 + 4, 4)}-${s.substr(8 + 4 + 4, 4)}-${s.substr(8 + 4 + 4 + 4)}`;
}