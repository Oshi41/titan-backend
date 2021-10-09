import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import * as fs from "fs";
import path from "path";
import {DownloadFolder} from "../../init/download";
import {checkAndLog} from "../../log/index";

/**
 * Обработчик скачивания файла
 */
export const onDownload = async (request: Request, response: Response, next: NextFunction) => {
    console.log('download');

    try {
        if (!checkAndLog(request, ['file'])) {
            return;
        }

        const file = path.normalize(path.resolve(DownloadFolder, request.query['file'] as string));
        if (!fs.existsSync(file)) {
            return response.sendStatus(404);
        }

        // файл где то снаружи
        if (!DownloadFolder.includes(file)) {
            console.log('trying to download outside the folder!')
            return response.sendStatus(403);
        }

        const clientFileName: string = path.basename(file);
        const original: string = await fs.promises.realpath(file);

        return response.download(original, clientFileName);
    } catch (e) {
        console.log(e);
        return response.sendStatus(500);
    }
}