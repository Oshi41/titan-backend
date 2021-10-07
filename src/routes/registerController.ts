import {Request, Response} from 'express';
import {LoginRequest} from "../types/types";
import {store as _store} from '../index';
import {NextFunction} from "express-serve-static-core";

/**
 * ОБрабатываю регистрацию
 * @param request - запрос
 * @param response - ответ
 * @param next - middleware
 */
export const handleRegister = (request: Request, response: Response, next: NextFunction) => {
    let body = request.body as LoginRequest;
    if (!body) {
        response
            .status(403)
            .send('No body provided');
        return;
    }

    if (!body.login || body.login.length > 30) {
        response
            .status(403)
            .send('No login provided or length is greater than 30');
        return;
    }

    if (!body.pass || body.pass.length < 5 || body.pass.length > 60) {
        response
            .status(403)
            .send('Password is empty or less than 5 symbols length or more than 60 symbols length');
        return;
    }

    _store.busy(body.login)
        .then(x => {
            if (x.valueOf()) {
                return Promise.reject('Login is busy');
            }

            return _store.add(body.login, body.pass);
        })
        .then(x => {
            if (x.valueOf()) {
                response.sendStatus(200);
                return;
            }

            response.status(500).send('Error during database injection');
        })
        .catch(x => {
            response.status(403).send(x);
        })
};