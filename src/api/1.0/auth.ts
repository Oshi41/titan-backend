import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {sign, verify} from 'jsonwebtoken';
import {clientSecret, usersStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {Roles, User, UserAuthType, WebToken} from "../../types/index";

/**
 *
 * @param request
 * @param response
 * @param next
 */
export const onAuth = async (request: Request, response: Response, next: NextFunction) => {
  const user = request.body as User;

  if (!user?.login) {
    return response.sendStatus(403);
  }

  const token = {
    login: user.login,
    id: user.uuid,
    auth: UserAuthType.Own,
    roles: getRoles(user)
  } as WebToken;

  const signed: string = sign(token, clientSecret, {
    algorithm: 'HS256',
    expiresIn: '18h'
  });

  return response
    .header('Authorization', 'Bearer ' + signed)
    .status(200)
    .send('Bearer ' + signed);
}

/**
 * Проверяю аутентификацию
 * @param tokenCheck
 */
export const onCheckAuth = (tokenCheck: (t: WebToken) => boolean) => async (request: Request, response: Response, next: NextFunction) => {
  const token = request?.headers?.authorization as string;
  // || request?.query?.token
  // || request?.headers["x-access-token"]
  // ||
  // || request?.cookies['access_token'];

  try {
    if (!token) {
      checkAndLog(request);
      throw new Error('no token provided');
    }

    const decoded = verify(token.replace('Bearer ', ''), clientSecret, {
      algorithms: ['HS256']
    }) as WebToken;

    if (!decoded?.login) {
      console.log(decoded);
      throw new Error('cannot authenticate');
    }

    if (tokenCheck(decoded)) {
      next();
    } else {
      return response.sendStatus(401);
    }

  } catch (e) {
    console.log(e);
    return response
      // удаляю web token
      .header('x-auth-token', '')
      .sendStatus(401);
  }
}

/**
 * Возвращаю список ролей для пользователя
 * @param user
 */
const getRoles = (user: User): Roles[] => {
  const result = [Roles.Comment];

  if (user.login === usersStorage.admin().login && user.pass === usersStorage.admin().pass) {
    result.push(Roles.Moderator);
  }

  return result;
}