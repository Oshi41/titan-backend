import bodyParser from "body-parser";
import express, {Request} from "express";
import * as core from "express-serve-static-core";
import {Roles} from "../../types/index";
import {onAddNews} from "./add_news";
import {onAuth, onCheckAuth} from "./auth";
import {onBusy} from "./busy";
import {onCrashDelete} from "./crash_delete";
import {downloadMulter} from "./crash_file";
import {onDeleteNews} from "./delete_news";
import {onUsersDelete} from "./delete_users";
import {onDownload} from "./download";
import {onEditUsers} from "./edit_users";
import {onGetNews} from "./get_news";
import {onLogin} from "./login";
import {onRegister} from "./register";
import {onServerCrashes} from "./server_crashes";
import {onServers} from "./servers";
import {onSingleServer} from "./single_server";
import {onRequestUsers} from "./get_users";


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

  apiRouter.post('/users',
    onCheckAuth(t => t.roles.includes(Roles.UserView)),
    bodyParser.json(),
    onRequestUsers);

  apiRouter.post('/edit_users',
    onCheckAuth(t => t.roles.includes(Roles.UserEdit)),
    bodyParser.json(),
    onEditUsers);

  apiRouter.delete('/users',
    onCheckAuth(t => t.roles.includes(Roles.UserDelete)),
    bodyParser.json(),
    onUsersDelete);

  apiRouter.get('/news', onGetNews);
  apiRouter.post('/news',
    onCheckAuth(t => t.roles.includes(Roles.NewsCreate)),
    bodyParser.json(),
    onAddNews);

  apiRouter.delete('/news',
    onCheckAuth(t => t.roles.includes(Roles.NewsDelete)),
    bodyParser.json(),
    onDeleteNews);

  apiRouter.post('/crashes',
    downloadMulter.any(),
    onCheckAuth(t => t.roles.includes(Roles.CrashReportCreate)),
    downloadMulter.single('file'),
    (req, res) => res.sendStatus(200));

  apiRouter.get('/crashes',
    onCheckAuth(t => t.roles.includes(Roles.CrashReportView)),
    onServerCrashes);

  apiRouter.delete('/crashes',
    onCheckAuth(t => t.roles.includes(Roles.CrashReportDelete)),
    onCrashDelete);


  return {url: '/api/1.0', router: apiRouter};
}