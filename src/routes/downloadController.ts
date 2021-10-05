import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import * as fs from "fs";
import path from "node:path";

/**
 * Папка, где лежат разрешенные файлы для скачивания
 */
const folder = path.normalize(path.resolve('_download'));

/**
 * Пытаемся скачать файл
 * @param request
 * @param response
 * @param next
 */
export const handleDownload = (request: Request, response: Response, next: NextFunction) => {

    // Создали папку по необходимости
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    const file: string = request.query['file'] as string;
    // нет файла, выходим
    if (!file) {
        response.status(403)
            .send('No file provided');
        return;
    }

    // файлы должны лежать в папке _download
    const filepath: string = path.normalize(path.resolve(folder, file));
    if (!fs.existsSync(filepath)) {
        response.status(404)
            .send(`this file [${file}] is not existing`);
        return;
    }

    // нацелили файл выше папки download, защищаемся
    if (!filepath.includes(folder)) {
        response.status(403)
            .send('outside of download folder');
        return;
    }

    const clientFileName: string = path.basename(filepath);

    response.sendFile(filepath, {
        headers: {
            "Content-Disposition": `attachment; filename="${clientFileName}"`
        }
    });
}
