import bodyParser from "body-parser";
import express from "express";
import * as core from "express-serve-static-core";
import {onBusy} from "./busy";
import {onDownload} from "./download";
import {onLogin} from "./login";
import {onRegister} from "./register";
import {onServers} from "./servers";
import {onSingleServer} from "./single_server";

/**
 * Возаращаю настроенный роутер
 */
export const getApiRouter = (): { url: string, router: core.Router } => {
    const apiRouter = express.Router();
    apiRouter.post('/register',bodyParser.json(), onRegister);
    apiRouter.get('/ownServers', onServers);
    apiRouter.get('/server', onSingleServer);
    apiRouter.get('/download', onDownload);
    apiRouter.get('/busy', onBusy);
    apiRouter.get('/login', onLogin);

    return {url: '/api/1.0', router: apiRouter};
}