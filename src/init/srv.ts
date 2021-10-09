import path from "path";
import {OwnServerInfo} from "../types/index";
import {createPath, getMachineIp, writeJSON} from "../utils/index";

/**
 * Папка с серверами майнкрафта
 */
export const MinecraftServersFolder = path.resolve('_minecraft', 'servers');

/**
 * Устанавливаю свой сервер, если его не чуществует
 */
export const setServers = async () => {
    await createPath(MinecraftServersFolder, true);
    const ip: string = await getMachineIp();
    let file = path.resolve(MinecraftServersFolder, ip + '.json');

    if (await createPath(file)) {
        await writeJSON(file, {address: ip} as OwnServerInfo);
    }

    file = path.resolve(MinecraftServersFolder, '../', '_mods.json');

    if (await createPath(file, false)) {
        await writeJSON(file, []);
    }
};