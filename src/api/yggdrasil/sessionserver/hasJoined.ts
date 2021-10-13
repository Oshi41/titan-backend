import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {usersStorage} from "../../../index";
import {checkAndLog} from '../../../log';
import {User} from '../../../types';
import {JoinResp} from "./join";

/**
 * Проверяем зашел ли на сервер
 */
export const hasJoined = async (request: Request, response: Response, next: NextFunction) => {
    try {
        console.log('hasJoined');
        if (!checkAndLog(request, ['username'], ['serverId'])) {
            return;
        }

        const server = request.query['serverId'] as string;
        const login = request.query['username'] as string;

        const users: User[] = await usersStorage.find(['server', server], ['login', login]);
        if (users?.length !== 1) {
            return response.sendStatus(204);
        }

        const user = users[0];

        const resp: JoinResp = {
            name: user.login,
            id: user.uuid
        };

        return response.json(resp);

    } catch (e) {
        console.log(e);
        return response.sendStatus(500);
    }
}