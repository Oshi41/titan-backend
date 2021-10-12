export interface IPassEncrypt {
  /**
   * Шифрую
   * @param {string} s
   * @returns {string}
   */
  encrypt(s: string): string;
}