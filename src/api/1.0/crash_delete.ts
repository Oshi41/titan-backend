import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import * as fs from "fs";
import path from "path";
import {checkAndLog} from "../../log/index";

const folder = path.resolve('_storage', 'crash reports');

export const onCrashDelete = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('onCrashDelete');
    if (!checkAndLog(request, ['login'], ['name'])) {
      return;
    }

    const login = request.query.login as string;
    const name = request.query.name as string;


    const toRemove: string = path.resolve(folder, login, name);
    await fs.promises.unlink(toRemove);
    await fs.promises.unlink(toRemove + '.comment');

    return response.sendStatus(200);

  } catch (e) {
    console.log(e);
    return response.sendStatus(500);
  }
}