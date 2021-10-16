import * as fs from "fs";
import {WriteStream} from "fs";
import path from "path";
import * as util from "util";

let stream: WriteStream | undefined = undefined;
let logFile: string | undefined = undefined;

const logs = path.resolve('logs');

/**
 * Возвращаю текущий файл дял записи
 */
const getStream = () => {
    const currentDate: Date = new Date();
    const name = path.resolve('logs', `${currentDate.getDate().toString().padStart(2, '0')}.${currentDate.getMonth().toString().padStart(2, '0')}.${currentDate.getFullYear()}.log`);

    if (name !== logFile || !stream || !logFile) {
        logFile = name;
        stream = fs.createWriteStream(logFile, {flags: 'w'});
    }

    return stream;
};

/**
 * Устанавливаю логирование
 */
export const initLog = () => {
    if (!fs.existsSync(logs)) {
        fs.mkdirSync(logs);
        console.log('logs folder created');
    }

    console.log = o => {
        process.stdout.write(util.format(o) + '\n');
        getStream().write(util.format(o) + '\n');
    };
};
