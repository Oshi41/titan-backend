import path from "path";
import {BackendConfig, Digest} from "../types/index";
import {createPath, readJson, writeJSON} from "../utils/index";

/**
 * Путь к файлу настроек
 */
const file = path.resolve('_storage', 'config.json');

/**
 * Дефолтное значение конфига
 */
const defaults = {
    passEncrypt: Digest.MD5,
    port: 80,
    maxUsersPerIP: 3,
} as BackendConfig;

/**
 * Читаю конфиг
 */
export const readCfg = async (): Promise<BackendConfig> => {
    try {
        if (await createPath(file)) {
            await writeJSON(file, defaults);
        }

        return await readJson<BackendConfig>(file);
    } catch (e) {
        console.log(e);
    }

    return {...defaults};
}