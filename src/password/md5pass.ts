import {PassTransformer} from "./passTransformer";
import md5 = require("md5");

/**
 * Генерирует md5 строку
 */
export class Md5pass implements PassTransformer {
    transform(pass: string): string {
        return md5(pass);
    }
}
