import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {config, newsStorage, transform, usersStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {Roles, User, WebToken} from "../../types/index";
import {distinct, getIp, getToken} from "../../utils/index";
import {v4 as uuid} from 'uuid';

const basePerms = [Roles.CrashReportCreate, Roles.Comment];

/**
 * endpont регистрации
 * @param request
 * @param response
 * @param next
 */
export const onRegister = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('register');
    if (!checkAndLog(request)) {
      return;
    }

    const user = request.body;

    // проверил данные
    if (!user.login || !user.pass) {
      console.log('not login or pass provided');
      return response.status(403).send('not login or pass provided');
    }

    // является ли юзер админом
    const admin: boolean = isAdmin(request);

    // запросили в неизменённом формате
    if (admin && request.query.hasOwnProperty('unchanged')) {
    } else {
      // выставляю IP
      user.ip = getIp(request);

      // Поменял пароль на шифрованный
      user.pass = transform()(user.pass);

      // выставляю роли
      user.roles = distinct([...(user.roles ?? []), ...basePerms]);

      // Рандомный uuid
      user.uuid = uuid();
    }

    // для не админов делаем проверку на IP
    if (!admin) {
      // проверил макс. кол-во по IP
      const error: string = await checkIpRestrictions(user);

      // ошибка при проверке регистрации
      if (error) {
        console.log(error);
        return response.status(403).send(error);
      }
    }

    // вставляю документ
    usersStorage().insert(user, (err, document) => {
      // обработал ошибку
      if (err) {
        console.log(err);
        return response.status(403).send(err.message);
      }

      // сохранил пользователя и иду дальше
      request.body = document;
      next();
    })

  } catch (e) {
    console.log(e);
    return response.sendStatus(500);
  }
}

/**
 * Проверка на привилегии создания пользователей
 * @param request
 */
const isAdmin = (request: Request): boolean => {
  const token: WebToken | undefined = getToken(request);
  return token?.roles?.includes(Roles.UserCreate) === true;
}

/**
 * Обрабатываем макс. кол-во на IP
 * @param user
 */
const checkIpRestrictions = async (user: User): Promise<string> => {
  const perIP: number = config().maxUsersPerIP;

  // Регистрация запрещена
  if (perIP == 0) {
    return 'registration id forbidden';
  }

  // Нет запретов
  if (perIP < 0) {
    return '';
  }

  return new Promise((resolve) => {
    newsStorage().count({ip: user.ip}, (err: Error | null, count: number) => {
      if (err) {
        return resolve(err.message);
      }

      if (count >= perIP) {
        return resolve('too much accounts per IP');
      } else {
        return resolve('');
      }
    });
  });
}