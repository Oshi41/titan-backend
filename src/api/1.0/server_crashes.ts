import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import * as fs from "fs";
import path from "path";
import {checkAndLog} from "../../log/index";
import {Report} from "../../types/index";
import {fromString} from "../../utils/index";

const folder = path.resolve('_storage', 'crash reports');

interface CrashResp {
  total: number;
  crashes: Report[]
};

/**
 * Запрос всех краш репортов
 * @param request
 * @param response
 * @param next
 */
export const onServerCrashes = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('onServerCrashes');

    if (!checkAndLog(request, ['page'], ['size'])) {
      return;
    }

    let resp: Report[] = [];

    for (let login of
      (await fs.promises.readdir(folder, 'utf-8'))) {
      for (let file of
        (await fs.promises.readdir(path.resolve(folder, login), 'utf-8'))) {
        if (file.endsWith('.txt')) {
          resp.push({
            date: fromString(file.replace('.txt', ''))
              .toISOString(),
            login,
            comment: await fs.promises.readFile(path.resolve(folder, login, file + '.comment'), 'utf-8'),
            content: await fs.promises.readFile(path.resolve(folder, login, file), 'utf-8'),
            file
          })
        }
      }
    }

    const page = parseInt(request.query['page'] as string ?? '0');
    const size = parseInt(request.query['size'] as string ?? '0');

    const reports: Report[] = page >= 0 && size > 0
      ? resp.slice(page * size, (page + 1) * size)
      : resp;

    const r = {
      total: resp.length,
      crashes: reports,
    } as CrashResp;

    return response.json(r);

  } catch (e) {
    console.log(e);
    return response.sendStatus(500);
  }
}