import {Request, Response} from 'express';
import {NextFunction} from 'express-serve-static-core';
import {usersStorage} from '../../../index';
import {checkAndLog} from '../../../log';
import {User} from '../../../types';
import {fromHexString} from '../../../utils';

/**
 * Что приходит от Minecraft клиента
 */
interface JoinBody {
  /**
   * Токен доступа. В этой экосистеме выписываем его при authenticate.
   * Без тире, надо подставить, чтобы получить то, что лежит в базе данных
   *
   * Вместо 11111111-2222-3333-4444-555555555555
   * Приходит 11111111222233334444555555555555
   */
  accessToken: string;

  /**
   * UUID игрока.
   * Без тире, надо подставить, чтобы получить то, что лежит в базе данных
   *
   * Вместо 11111111-2222-3333-4444-555555555555
   * Приходит 11111111222233334444555555555555
   */
  selectedProfile: string;

  /**
   * Hash ID сервера
   *
   * Примерно вот такое:
   * 1d34520d63762e69b0f49e24b2615fa0648649b2
   */
  serverId: string;
}

/**
 * Что отправляем Minecraft клиентов
 */
export interface JoinResp {
  /**
   * UUID игрока
   */
  id: string;

  /**
   * Логин
   */
  name: string;
}

/**
 * Вызывается при подключении к серверу
 * @see https://wiki.vg/Protocol_Encryption#Client
 */
export const onJoin = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('join');

    if (!checkAndLog(request)) {
      return;
    }

    const body: JoinBody = request.body as JoinBody;
    if (!body.selectedProfile) {
      return response.sendStatus(400);
    }

    // распарсил значения в читабельные
    body.accessToken = fromHexString(body.accessToken);
    body.selectedProfile = fromHexString(body.selectedProfile);

    // поиск текущего пользователя
    const q = {
      $and: [
        {uuid: body.selectedProfile},
        {access: body.accessToken},
      ]
    };

    // Нашел пользователя, который хочет аутентифицироваться
    usersStorage().findOne(q, (err: Error | null, document: User) => {
      // Обработал ошибку поиска
      if (err) {
        console.log(err);
        return response.status(403).send(err.message);
      }

      // Меняю его serverId
      const updateQ = {
        $set: {
          // Изменяю поле сервера
          server: body.serverId
        }
      };

      // выполняю запрос по обновлению
      usersStorage().update(q, updateQ, {
        upsert: false,
        multi: false,
        returnUpdatedDocs: true
      }, (err1: Error | null, numberOfUpdated: number, affectedDocuments: any, upsert: boolean) => {
        // Обработал ошибку обновления документа
        if (err1) {
          console.log(err1);
          return response.status(403).send(err1.message);
        }

        // на всякий случай проверили на ошибку
        if (numberOfUpdated === 1 && !upsert) {
          const authorized: User = <User>affectedDocuments;
          // проверили, что обновление вернуло правильный результат
          if (authorized.login) {

            // создаем ответ
            const resp: JoinResp = {
              id: authorized.uuid,
              name: authorized.login
            };

            // возвращаем ответ
            return response.json(resp);
          }
        }

        // Возаращаю в случае ошибки
        return response.sendStatus(403);
      });
    });

  } catch (e) {
    console.log(e);
    return response.sendStatus(500);
  }
};