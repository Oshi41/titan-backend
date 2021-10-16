import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {transform, usersStorage} from "../../../index";
import {checkAndLog} from "../../../log/index";
import {User} from "../../../types/index";
import {v4 as uuid} from 'uuid';

interface AuthBody {
  agent: {
    name: 'Minecraft';
    version: number | 1;
  };
  username: string;
  password: string;
  clientToken: string;
  requestUser: boolean;
};

interface AuthResponse {
  selectedProfile: {
    name: string;

    /**
     * Отсюда удалены все тире!!!
     * вместо
     * e0148d30-b5d8-49ad-86b6-491a99646a64
     * надо отправлять
     * e0148d30b5d849ad86b6491a99646a64
     */
    id: string;
  };

  /**
   * Отсюда удалены все тире!!!
   * вместо
   * e0148d30-b5d8-49ad-86b6-491a99646a64
   * надо отправлять
   * e0148d30b5d849ad86b6491a99646a64
   */
  clientToken: string;
  accessToken: string;
};

/**
 * Обрабатываю запрос аутентификации
 * https://wiki.vg/Authentication#Authenticate
 * @param request
 * @param response
 * @param next
 */
export const onAuth = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('authenticate');

    if (!checkAndLog(request)) {
      return;
    }

    const body: AuthBody = request.body as AuthBody;

    // проверяю правильность ввода
    if (!body.username || !body.password) {
      return response.sendStatus(400);
    }

    // Сразу же его шифрую
    body.password = transform()(body.password);

    // создал запрос
    const q = {
      $and: [
        {login: body.username},
        {pass: body.password},
      ]
    };

    usersStorage().findOne(q, (err: Error | null, current: User) => {
      if (err) {
        console.log(err);
        return response.status(403).send(err.message);
      }

      // находим по нику
      const findQ = {login: current.login};
      // обновляем поле access
      const updateQ = {$set: {access: uuid()}};

      usersStorage().update(findQ, updateQ, {
        // только изменения, не добавление
        upsert: false,
        // ток один элемент будет обновлен
        multi: false,
        // нужно вернуть изменённый элемент
        returnUpdatedDocs: true
      }, (err1: Error | null, numberOfUpdated: number, affectedDocuments: any, upsert: boolean) => {
        if (err1) {
          console.log(err1);
          return response.status(403).send(err1.message);
        }

        // изменённый элемент ток один
        if (numberOfUpdated === 1 && !upsert) {
          const authentificated: User = affectedDocuments as User;
          if (authentificated?.login) {

            const jsonResp: AuthResponse = {
              selectedProfile: {
                id: authentificated.uuid.split('-').join(''),
                name: authentificated.login,
              },
              accessToken: authentificated.access.split('-').join(''),
              // т.к. токен может и не прийти!
              clientToken: authentificated.access.split('-').join(''),
            };

            return response.json(jsonResp);
          } else {
            console.log('no changes detected or upsert the doc instead of updating');
            return response.sendStatus(403);
          }
        }
      });
    });

  } catch (e) {
    console.log(e);
    return response.sendStatus(500);
  }
}