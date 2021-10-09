import {IPassTransformer} from "../transform/IPassTransformer";
import {md5Pass} from "../transform/md5";
import {plainPass} from "../transform/plain";
import {Digest} from "../types/index";

/**
 * Возвращаю энкриптор по настройкам
 * @param digest
 */
export const getPass = (digest: Digest): IPassTransformer => {
    switch (digest) {
        case Digest.MD5:
            return md5Pass;

        case Digest.PLAIN:
            return plainPass;


        default:
            console.log(`Unknown type: ${digest}, plain text will be used instead`);
            return plainPass;
    }
}