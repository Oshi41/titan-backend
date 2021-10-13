import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {usersStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {Roles, User} from "../../types/index";

/**
 * Пытаюсь залогинится
 */
export const onLogin = async (request: Request, response: Response, next: NextFunction) => {
  try {
    if (!checkAndLog(request, ['login'], ['pass'])) {
      return;
    }

    const users: User[] = await usersStorage.find(['login', request.query['login']], ['pass', usersStorage.encrypt(request.query['pass'] as string)]);
    if (users?.length !== 1) {
      return response
        .status(404)
        .send('There is no such user');
    }

    if (!request.query['token']) {
      // передал параметр глубже
      request.body = users[0];
      // запросили токен, переадресуем
      next();
    } else {
      return response.status(200)
        .send('OK:' + users[0].login);
    }

  } catch (e) {
    console.log(e);
    return response.sendStatus(500);
  }
}