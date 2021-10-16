import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {usersStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {User} from "../../types/index";

/**
 * Проверяю на занятый логин
 */
export const onBusy = async (request: Request, response: Response, next: NextFunction) => {
  try {
    if (!checkAndLog(request, ['login'])) {
      return;
    }
    const toFind = {login: request.query['login'] as string} as User;

    usersStorage().find(toFind, (err: Error | null, docs: User[]) => {
      if (err) {
        console.log(err);
        return response.status(403).send(err.message);
      }

      const msg = docs?.length > 0 ? 'busy' : 'free';
      return response.status(200).send(msg);
    });
  } catch (e) {
    console.log(e);
    return response.sendStatus(500);
  }
}