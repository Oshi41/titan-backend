import path from "node:path";
import {ConfigTypes} from "./types/types";
import * as fs from 'fs';

const defaults: ConfigTypes = {
    port: 5001,
    store: {
        type: 'file',
        config: {
            file: path.resolve('./_store/auth.cfg'),
            digest: 'md5',
        }
    }
}

/**
 * Читаю конфиг или возвращаю по умолчанию
 * @param path - путь к файлу
 */
export const readConfig = (path: string): ConfigTypes => {
    try {
        if (!fs.existsSync(path)) {
            throw new Error('no default config');
        }

        const content: string = fs.readFileSync(path, 'utf-8');
        const result: ConfigTypes = JSON.parse(content) as ConfigTypes;
        if (!result) {
            throw new Error('wrong format');
        }
        return result;

    } catch (e) {
        console.log('Error during using default config - ');
        console.log(e);

        fs.writeFileSync(path, JSON.stringify(defaults), {
            encoding: 'utf-8',
            mode: 0x777,
        });
        return {...defaults};
    }
}