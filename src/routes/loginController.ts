import {store as _store, pass as _transformer} from '../index';
import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";

/**
 * ОБрабатываю регистрацию
 * @param request - запрос
 * @param response - ответ
 * @param next - middleware
 */
export const handleLogin = (request: Request, response: Response, next: NextFunction) => {
    let login = request.query['login'] as string;
    if (!login){
        response.status(403)
            .send('No login provided');
        return;
    }

    let pass = request.query['pass'] as string;
    if (!pass){
        response.status(403)
            .send('No password provided');
        return;
    }

    _store.check(login, _transformer.transform(pass))
        .then(x => {
            response.status(200)
                .send(x.valueOf() ? `OK:${login}` : 'Login or password or both are incorrect');
        })
        .catch(x => {
            response.status(403).send(x);
        })
}