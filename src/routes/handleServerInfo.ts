import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import fs from "fs";
import path from "node:path";
import {ForgeInfo, ModInfo, ExtraServerInfo, ServerInfo} from "../types/types";
import {server as minecraftServer} from "minecraft-lookup";
import * as mc from 'minecraft-protocol';

/**
 * Папка, где лежат разрешенные файлы для скачивания
 */
const folder = path.normalize(path.resolve('_minecraft'));
/**
 * Путь к файлу с моими серверами
 */
const serversPath = path.resolve(folder, '_servers.json');

/**
 * Обрабатываю запрос сервера
 */
export const handleServerInfo = async (request: Request, response: Response, next: NextFunction) => {
    // Создали папку по необходимости
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    const server = request.query['server'] as string;
    if (!server) {
        response.status(403).send('no server address provided');
    }

    let serverInfo: ServerInfo;

    try {
        serverInfo = await fillServerInfo(server);

        if (!serverInfo) {
            throw new Error('no server info returned');
        }
    } catch (e) {
        response.status(403).send(e);
        return
    }

    let forgeInfo: ForgeInfo;

    try {
        forgeInfo = await fillForgeInfo(serverInfo.hostname, serverInfo.port);

        if (!forgeInfo) {
            throw new Error('no forge info returned');
        }
    } catch (e) {
        response.status(403).send(e);
        return
    }

    const mods = parseModPages();
    const ownServers = parseOwnModMap();

    for (let i = 0; i < forgeInfo.modinfo.modList.length; i++) {
        const {modid, version} = forgeInfo.modinfo.modList[i];
        const clientVersion = `[${modid}] ${version}`;
        const page = mods.get(modid) ?? '';
        forgeInfo.modinfo.modList[i] = {
            modid: clientVersion,
            version: page
        }
    }

    response.json({
        server: serverInfo,
        forge: forgeInfo,
        extra: ownServers.get(server) ?? undefined,
    });
}

/**
 * Запрашиваю свойства сервера
 * @param address
 */
const fillServerInfo = (address: string): Promise<ServerInfo> => {
    return minecraftServer(address).then(x => x as ServerInfo);
}

/**
 * Заполняю forge данные от сервера
 * @param host - хост сервера
 * @param port - текущий порт
 */
const fillForgeInfo = (host: string, port: number): Promise<ForgeInfo> => {
    return new Promise((resolve, reject) => {
        const client = mc.createClient({
            port,
            host,
            username: 'Dash'
        });

        // @ts-ignore
        if (!client.autoVersionHooks) client.autoVersionHooks = [];

        // @ts-ignore
        client.autoVersionHooks.push(function (response, client, options) {
            resolve(response as ForgeInfo);
            // if (!response.modinfo || response.modinfo.type !== 'FML') {
            //     reject('unknown server type')
            //     return; // not ours
            // }
            //
            // // Use the list of Forge mods from the server ping, so client will match server
            // const forgeMods = response.modinfo.modList;
            // console.log('Using forgeMods:', forgeMods);
        });
    });
}

/**
 * Получаю список wiki страниц модов
 */
const parseModPages = () => {
    const raw = fs.readFileSync(path.resolve(folder, '_modPages.json'), 'utf-8');
    const result = JSON.parse(raw) as ModInfo[];
    const map = new Map<string, string>(result.map(x => [x.modid, x.page]));
    return map;
}

/**
 * Дополнительная инфа о сервере
 */
const parseOwnModMap = () => {
    const raw = fs.readFileSync(serversPath, 'utf-8');
    const result = JSON.parse(raw) as ExtraServerInfo[];
    const map = new Map<string, ExtraServerInfo>(result.map(x => [x.address, x]));
    return map;
}

/**
 * Получаю список серверов, которые мои
 */
export const handleAllServers = (request: Request, response: Response, next: NextFunction) => {
    fs.readFile(serversPath, 'utf-8', (err, data) => {
        if (err) {
            response.status(500).send(err.message);
        } else {
            const servers: ExtraServerInfo[] = JSON.parse(data) as ExtraServerInfo[];
            const result: string[] = servers.map(x => x.address);

            response.json(result);
        }
    });
};