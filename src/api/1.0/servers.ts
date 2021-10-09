import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import * as fs from "fs";
import path from "path";
import {MinecraftServersFolder} from '../../init/srv';
import {checkAndLog} from "../../log/index";
import {OwnServerInfo} from "../../types/index";
import {readJson} from "../../utils/index";

/**
 * Отправляю список всех моих серверов
 */
export const onServers = async (request: Request, response: Response, next: NextFunction) => {
    console.log('ownServers');

    try {
        if (!checkAndLog(request)) {
            return;
        }

        const files: string[] = await fs.promises.readdir(MinecraftServersFolder);
        if (files?.length > 0) {
            const servers: OwnServerInfo[] = [];

            for (let file of files) {
                file = path.resolve(MinecraftServersFolder, file);
                try {
                    const info: OwnServerInfo = await readJson<OwnServerInfo>(file);
                    servers.push(info);
                } catch (e) {
                    console.log(e);
                }
            }

            return response.status(200).json(servers.map(x => x.address));
        } else {
            return response.status(200).json([]);
        }

    } catch (e) {
        console.log(e);
        return response.send(500);
    }
}