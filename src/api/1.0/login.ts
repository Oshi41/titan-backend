import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {transform, usersStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {User} from "../../types/index";

/**
 * Пытаюсь залогинится
 */
export const onLogin = async (request: Request, response: Response, next: NextFunction) => {
  try {
    if (!checkAndLog(request, ['login'], ['pass'])) {
      return;
    }

    // создал запрос
    const userQ = {
      // проверяю по двум полям
      $and: [
        // ищем по логину
        {login: request.query['login'] as string},
        // ищем по паролю
        {pass: transform()(request.query['pass'] as string)}
      ]
    };

    // запускаю поиск
    usersStorage().findOne(userQ, (err: Error | null, user: User) => {
      if (err) {
        console.log(err);
        return response.status(403).send(err.message);
      }

      if (!user){
        return response.sendStatus(404);
      }

      // токен не запросили
      if (!request.query.hasOwnProperty('token')) {
        // отправляем ответ-подтверждение
        return response.status(200).send('OK:' + user.login);
      }

      // записал текущего пользователя в body
      request.body = user;
      // перехожу к сл. обработчику
      next();
    });

  } catch (e) {
    console.log(e);
    return response.sendStatus(500);
  }
}