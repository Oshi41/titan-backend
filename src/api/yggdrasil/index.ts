import bodyParser from "body-parser";
import express, {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import * as core from "express-serve-static-core";
import {checkAndLog} from "../../log/index";
import {onAuth} from "./authserver/authenticate";
import {hasJoined} from "./sessionserver/hasJoined";
import {onJoin} from "./sessionserver/join";

const handle = async (request: Request, response: Response, next: NextFunction) => {
    checkAndLog(request);
    return response.sendStatus(500);
}

/**
 * Возаращаю настроенный роутер
 */
export const getYggdrasilRouter = (): { url: string, router: core.Router } => {
    const authserver = express.Router();
    authserver.post('/authenticate', bodyParser.json(), onAuth);
    authserver.post('/refresh', bodyParser.json(), handle);
    authserver.post('/validate', bodyParser.json(), handle);
    authserver.post('/invalidate', bodyParser.json(), handle);
    authserver.post('/signout', bodyParser.json(), handle);


    const sessionserver = express.Router();
    sessionserver.post('/session/minecraft/join', bodyParser.json(), onJoin);
    sessionserver.get('/session/minecraft/hasJoined', hasJoined);
    sessionserver.get('/session/minecraft/profile', handle);


    const apiRouter = express.Router();

    apiRouter.use('/authserver', authserver);
    apiRouter.use('/sessionserver', sessionserver);
    apiRouter.get('/', (req, res, next) => {
        if (!checkAndLog(req)) {
            return;
        }

        return res.json({meta: {}});
    });

    return {url: '/yggdrasil', router: apiRouter};
}