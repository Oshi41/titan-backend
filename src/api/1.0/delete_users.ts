import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {usersStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {User} from "../../types/index";

export const onUsersDelete = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('onUsersDelete');
    if (!checkAndLog(request)) {
      return;
    }

    const toDelete = request.body as User;
    if (!toDelete?.login && !toDelete?.uuid) {
      console.log('No login or uuid defined');
      return response.status(403).send('No login or uuid defined');
    }

    usersStorage().remove(toDelete, {
      multi: false
    }, (err, n) => {
      if (err) {
        console.log(err);
        return response.status(403).send(err.message);
      }

      const status = n == 1 ? 200 : 400;
      return response.sendStatus(status);
    })

  } catch (e) {
    console.log(e);
    return response.sendStatus(500);
  }
}