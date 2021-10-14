import bodyParser from "body-parser";
import express from "express";
import * as core from "express-serve-static-core";
import {Roles} from "../../types/index";
import {onAddNews} from "./add_news";
import {onAuth, onCheckAuth} from "./auth";
import {onBusy} from "./busy";
import {onDeleteNews} from "./delete_news";
import {onDownload} from "./download";
import {onGetNews} from "./get_news";
import {onLogin} from "./login";
import {onRegister} from "./register";
import {onServers} from "./servers";
import {onSingleServer} from "./single_server";
import {onRequestUsers} from "./users";

/**
 * Возаращаю настроенный роутер
 */
export const getApiRouter = (): { url: string, router: core.Router } => {
  const apiRouter = express.Router();
  apiRouter.post('/register', bodyParser.json(), onRegister, onAuth);
  apiRouter.get('/ownServers', onServers);
  apiRouter.get('/server', onSingleServer);
  apiRouter.get('/download', onDownload);
  apiRouter.get('/busy', onBusy);
  apiRouter.get('/login', onLogin, onAuth);

  apiRouter.get('/users', onCheckAuth(t => t.roles.includes(Roles.Moderator)), onRequestUsers);

  apiRouter.get('/news', onGetNews);
  apiRouter.post('/news',
    onCheckAuth(t => t.roles.includes(Roles.Moderator)),
    bodyParser.json(),
    onAddNews);

  apiRouter.delete('/news',
    onCheckAuth(t => t.roles.includes(Roles.Moderator)),
    bodyParser.json(),
    onDeleteNews);


  return {url: '/api/1.0', router: apiRouter};
}