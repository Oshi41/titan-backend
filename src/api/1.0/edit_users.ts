import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {user} from "minecraft-lookup";
import {config, usersStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {User, WhitelistItem} from "../../types/index";
import {readJson, writeJSON} from "../../utils/index";


export const onEditUsers = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('onEditUsers');

    if (!checkAndLog(request)) {
      return;
    }

    const changed: User = request.body as User;
    if (!changed?._id) {
      console.log('no data to change');
      return response.sendStatus(403);
    }

    const q = {_id: changed._id};

    usersStorage().findOne(q, async (err: Error | null, document: User) => {
      if (err) {
        console.log(err);
        return response.status(403).send(err.message);
      }

      if (!document) {
        console.log('No user founded');
        return response.sendStatus(404);
      }

      // Ручками добавляем/убираем человечка из белого списка
      if (document.whitelisted !== changed.whitelisted) {
        const whitelistPath: string | undefined = config().whitelistPath;
        if (whitelistPath) {
          let items: WhitelistItem[] = await readJson<WhitelistItem[]>(whitelistPath as string);

          if (changed.whitelisted) {
            items.push({
              uuid: changed.uuid,
              name: changed.login
            });
          } else {
            items = items.filter(x => x.uuid !== changed.uuid);
          }

          await writeJSON(whitelistPath as string, items);
        }
      }

      // Это поле в БД не храним
      delete changed["whitelisted"];

      usersStorage().update(q, changed, {
        multi: false,
        upsert: false,
        returnUpdatedDocs: true
      }, (err1: Error | null, numberOfUpdated: number, affectedDocuments: User, upsert: boolean) => {
        if (err1) {
          console.log(err1);
          return response.status(403).send(err1.message);
        }

        if (!affectedDocuments?.uuid) {
          return response.sendStatus(404);
        }

        return response.status(200).send(affectedDocuments.uuid);
      });
    });

  } catch (e) {
    console.log(e);
    return response.sendStatus(403);
  }
}