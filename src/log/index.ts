import {Request, Response} from "express";
import {getIp} from "../utils/index";

/**
 * логирует данные и проверяет параметры запросов
 * @param resp
 * @param request
 */
export const checkAndLog = (resp: Request, ...request: ([string] | [string, (s: string) => boolean])[]): boolean => {

    console.log('\nheaders:');
    console.log(resp.rawHeaders);

    console.log('\nquery:');
    console.log(resp.query);

    console.log('\nbody:');
    console.log(resp.body);

    console.log('\nurl:');
    console.log(resp.url);

    console.log('\nip=' + getIp(resp));

    for (let [key, param] of request) {
        const value = resp.query[key] as string;

        if (!value) {
            console.log(`No key (${key}) founded in query:`);
            console.log(resp.query);
            resp.res?.sendStatus(400);
            return false;
        }

        if (param && !param(value)) {
            console.log(`Value (${value}) is not valid`);
            console.log(resp.query);
            resp.res?.sendStatus(400);
            return false;
        }
    }

    return true;
}