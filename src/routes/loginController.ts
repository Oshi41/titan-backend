import {store as _store} from '../index';
import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";

/**
 * ОБрабатываю вход в систему
 * @param request - запрос
 * @param response - ответ
 * @param next - middleware
 */
export const handleLogin = (request: Request, response: Response, next: NextFunction) => {
    let login = request.query['login'] as string;
    if (!login) {
        response.status(403)
            .send('No login provided');
        return;
    }

    let pass = request.query['pass'] as string;
    if (!pass) {
        response.status(403)
            .send('No password provided');
        return;
    }

    _store.check(login, pass)
        .then(x => {
            if (x.login !== login) {
                throw new Error("Login or password or both are incorrect");
            }

            response.send(`OK:${login}`);
        })
        .catch(x => {
            console.log(x);
            response.status(403).send(x.toString());
        })
}