import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {sign, verify} from 'jsonwebtoken';
import {clientSecret} from "../../index";
import {checkAndLog} from "../../log/index";
import {Roles, User, UserAuthType, WebToken} from "../../types/index";
import {getToken} from "../../utils/index";

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
    roles: user.roles ?? []
  } as WebToken;

  const signed: string = sign(token, clientSecret(), {
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
  try {
    const token: WebToken | undefined = getToken(request);
    if (!token) {
      checkAndLog(request);
      throw new Error('no token provided');
    }

    if (tokenCheck(token)) {
      next();
    } else {
      return response.sendStatus(401);
    }

  } catch (e) {
    console.log(e);
    return response
      // удаляю web token
      .header('Authorization', '')
      .sendStatus(401);
  }
}