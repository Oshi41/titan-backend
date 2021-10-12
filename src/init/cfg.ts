import path from 'path';
import { BackendConfig, Digest } from '../types';
import { createPath, readJson, writeJSON } from '../utils';

/**
 * Путь к файлу настроек
 */
const file = path.resolve('_storage', 'config.json');

/**
 * Дефолтное значение конфига
 */
const defaults = {
  passEncrypt: Digest.MD5,
  https: 443,
  http: 80,
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

  return { ...defaults };
};