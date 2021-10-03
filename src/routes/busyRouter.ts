import {Request, Response} from "express";
import {store as _store} from '../index';
import {NextFunction} from "express-serve-static-core";

/**
 * ОБрабатываю регистрацию
 * @param request - запрос
 * @param response - ответ
 * @param next - middleware
 */
export const handleBusy = (request: Request, response: Response, next: NextFunction) => {
    let login = request.query['login'] as string;
    if (!login){
        response.status(403)
            .send('No login provided');
        return;
    }

    _store.busy(login)
        .then(x => {
            response.status(200)
                .send(x.valueOf() ? 'busy' : 'free');
        }).catch(x => {
            response.sendStatus(403).send(x);
    })

}