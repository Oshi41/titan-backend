import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {usersStorage, config} from "../../index";
import {checkAndLog} from "../../log/index";
import {User} from "../../types/index";
import {getIp} from "../../utils/index";

/**
 * endpont регистрации
 * @param request
 * @param response
 * @param next
 */
export const onRegister = async (request: Request, response: Response, next: NextFunction) => {
  console.log('register');
  if (!checkAndLog(request)) {
    return;
  }

  const user = {
    ...request.body as User,
    ip: getIp(request),
  };

  try {

    if (config.maxUsersPerIP === 0) {
      return response.sendStatus(403);
    } else if (config.maxUsersPerIP > 0) {
      const users: User[] = await usersStorage.find(['ip', user.ip]);

      if (users?.length === config.maxUsersPerIP) {
        return response.status(403)
          .send('too much accounts per IP');
      }
    }

    const added = await usersStorage.add(user);
    if (added?.login === user.login) {
      request.body = user;
      next();
    } else {
      return response.sendStatus(400);
    }
  } catch (e) {
    console.log(e);
    return response.sendStatus(400);
  }
}