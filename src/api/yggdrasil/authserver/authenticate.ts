import {randomUUID} from "crypto";
import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {storage} from "../../../index";
import {checkAndLog} from "../../../log/index";
import {User} from "../../../types/index";
import {JoinResp} from "../sessionserver/join";

interface AuthBody {
    agent: {
        name: 'Minecraft';
        version: number | 1;
    };
    username: string;
    password: string;
    clientToken: string;
    requestUser: boolean;
};

interface AuthResponse {
    selectedProfile: {
        name: string;

        /**
         * Отсюда удалены все тире!!!
         * вместо
         * e0148d30-b5d8-49ad-86b6-491a99646a64
         * надо отправлять
         * e0148d30b5d849ad86b6491a99646a64
         */
        id: string;
    };

    /**
     * Отсюда удалены все тире!!!
     * вместо
     * e0148d30-b5d8-49ad-86b6-491a99646a64
     * надо отправлять
     * e0148d30b5d849ad86b6491a99646a64
     */
    clientToken: string;
    accessToken: string;
};

/**
 * Обрабатываю запрос аутентификации
 * https://wiki.vg/Authentication#Authenticate
 * @param request
 * @param response
 * @param next
 */
export const onAuth = async (request: Request, response: Response, next: NextFunction) => {
    try {
        console.log('authenticate');

        if (!checkAndLog(request)) {
            return;
        }

        const body: AuthBody = request.body as AuthBody;

        if (!body.username || !body.password) {
            return response.sendStatus(400);
        }

        const users: User[] = await storage.find(['login', body.username], ['pass', storage.encrypt(body.password)]);
        if (users?.length !== 1) {
            return response.sendStatus(403);
        }

        const user = {
            ...users[0],
            // генерирую рандомный токен
            access: randomUUID()
        } as User;

        if (!await storage.update(user)) {
            console.log("Can't update from user:");
            console.log(users[0]);
            console.log("to user:");
            console.log(user);

            return response.sendStatus(500);
        }

        const jsonResp: AuthResponse = {
            selectedProfile: {
                id: user.uuid.split('-').join(''),
                name: user.login,
            },
            accessToken: user.access.split('-').join(''),
            clientToken: body.clientToken,
        };

        return response.json(jsonResp);

    } catch (e) {
        console.log(e);
        return response.sendStatus(500);
    }
}