import dns from 'dns';
import os from 'os';

/**
 * Возвращает текущий ip
 * @returns {Promise<string>}
 */
export const getIp = (): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    dns.lookup(os.hostname(), (err, address, family) => {
      return err
        ? reject(err)
        : resolve(address);
    });
  });
};