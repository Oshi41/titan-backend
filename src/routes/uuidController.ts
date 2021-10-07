import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import * as fs from "fs";
import {config} from '../index';
import {StoreType} from "../types/types";

export const handleUuid = (request: Request, response: Response, next: NextFunction) => {
    const name = request.query['name'] as string;
    if (!name) {
        response.status(403).send('no name provided');
        return;
    }

    const uuidFile: string | undefined = config.store[StoreType.FILE]?.uuids;
    if (!uuidFile) {
        response.status(500).send('No file with uuid settings');
    }

    fs.readFile(uuidFile as string, 'utf-8', (err, data) => {
        if (err) {
            response.status(500).send(err);
        } else {
            const lines: string[] = data.split('\n');
            const searchStr = `"${name}";`;
            const index = lines.findIndex(x => x.includes(searchStr));
            if (index < 0) {
                response.send('No user founded');
            } else {
                const above = lines[index - 1].slice(0, 36);
                response.send('OK:' + above);
            }
        }
    });
}