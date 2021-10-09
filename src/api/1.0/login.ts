import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {storage} from "../../index";
import {checkAndLog} from "../../log/index";
import {User} from "../../types/index";

/**
 * Пытаюсь залогинится
 */
export const onLogin = async (request: Request, response: Response, next: NextFunction) => {
    try {
        if (!checkAndLog(request, ['login'], ['pass'])) {
            return;
        }

        const users: User[] = await storage.find(['login', request.query['login']], ['pass', storage.encrypt(request.query['pass'] as string)]);
        if (users?.length === 1) {
            return response.status(200).send("OK:" + users[0].login);
        } else {
            return response.status(200).send('There is no such user');
        }

    } catch (e) {
        console.log(e);
        return response.sendStatus(500);
    }
}