import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {usersStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {User} from "../../types/index";

/**
 * Проверяю на зщанятый логин
 */
export const onBusy = async (request: Request, response: Response, next: NextFunction) => {
    try {
        if (!checkAndLog(request, ['login'])) {
            return;
        }

        const users: User[] = await usersStorage.find(['login', request.query['login']]);
        return response.status(200).send(users?.length > 0 ? 'busy' : 'free');
    } catch (e) {
        console.log(e);
        return response.sendStatus(500);
    }
}