import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import * as fs from "fs";
import {server as minecraftServer} from "minecraft-lookup";
import * as mc from "minecraft-protocol";
import path from "path";
import {usersStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {MinecraftServersFolder} from '../../init/srv';
import {ForgeInfo, ModInfo, OwnServerInfo, ServerInfo} from "../../types/index";
import {readJson} from "../../utils/index";

const modsFile = path.resolve(MinecraftServersFolder, '../', '_mods.json');

export type SingleServerResp = {
    server: ServerInfo,
    forge?: ForgeInfo,
    extra?: OwnServerInfo;
}

/**
 * Возвращаю заполненное состояние для
 * @param request
 * @param response
 * @param next
 */
export const onSingleServer = async (request: Request, response: Response, next: NextFunction) => {
    try {
        console.log('server');

        if (!checkAndLog(request, ['address'])) {
            return;
        }

        const address = request.query['address'] as string;
        const serverInfo = await fillServerInfo(address);
        if (!serverInfo) {
            return response.status(403).send('No connection');
        }

        const forgeInfo = await fillForgeInfo(serverInfo.hostname, serverInfo.port);
        const ownInfo = await findOwnInfo(serverInfo.ip);

        if (forgeInfo?.modinfo?.modList?.length > 0) {
            await fillModsInfo(forgeInfo);
        }

        const resp = {
            server: serverInfo,
            forge: forgeInfo,
            extra: ownInfo,
        } as SingleServerResp;

        return response.json(resp);

    } catch (e) {
        console.log(e);
        return response.sendStatus(400);
    }
}

/**
 * Запрашиваю свойства сервера
 * @param address
 */
const fillServerInfo = (address: string): Promise<ServerInfo> => {
    return minecraftServer(address).then(x => x as ServerInfo);
};

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
            username: usersStorage.admin().login
        });

        // @ts-ignore
        if (!client.autoVersionHooks) {
            // @ts-ignore
            client.autoVersionHooks = [];
        }

        // @ts-ignore
        client.autoVersionHooks.push(function (response, client, options) {
            resolve(response as ForgeInfo);
        });
    });
};

/**
 * Нахожу определение для своего сервера
 * @param address
 */
const findOwnInfo = async (address: string): Promise<OwnServerInfo | undefined> => {
    try {
        const files: string[] = await fs.promises.readdir(MinecraftServersFolder);
        for (let file of files) {
            file = path.resolve(MinecraftServersFolder, file);
            const info: OwnServerInfo = await readJson<OwnServerInfo>(file);
            if (info.address === address)
                return info;
        }
    } catch (e) {
        console.log(e);
    }
    return undefined;
}

/**
 * Заполняю данные по модам
 * @param forge
 */
const fillModsInfo = async (forge: ForgeInfo): Promise<boolean> => {
    const infos: ModInfo[] = await readJson<ModInfo[]>(modsFile);
    const map = new Map(infos.map(x => [x.modid, x]));

    for (let element of forge.modinfo.modList) {
        const version = `[${element.modid}], version ${element.version}`;
        const info: ModInfo | undefined = map.get(element.modid);
        const url = info?.page ?? '';

        element.modid = version;
        element.version = url;
    }

    return true;
}