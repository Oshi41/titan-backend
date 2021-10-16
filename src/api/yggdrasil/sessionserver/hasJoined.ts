import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {usersStorage} from "../../../index";
import {checkAndLog} from '../../../log';
import {User} from '../../../types';
import {JoinResp} from "./join";

/**
 * Проверяем зашел ли на сервер
 */
export const hasJoined = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('hasJoined');
    if (!checkAndLog(request, ['username'], ['serverId'])) {
      return;
    }

    // создал запрос по поиску
    const q = {
      $and: [
        {server: request.query['serverId'] as string},
        {login: request.query['username'] as string},
      ]
    };

    usersStorage().findOne(q, (err, doc) => {
      // Обработал ошибку поиска
      if (err) {
        console.log(err);
        return response.status(403).send(err.message);
      }

      const resp: JoinResp = {
        name: doc.login,
        id: doc.uuid
      };

      return response.json(resp);
    });

  } catch (e) {
    console.log(e);
    return response.sendStatus(500);
  }
}