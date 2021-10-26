import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {config, usersStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {User, WhitelistItem} from "../../types/index";
import {checkSqlString, readJson} from "../../utils/index";

interface UsersResp {
  items: User[],
  count: number
}

interface UsersRequest {
  page: number;
  size: number;
  query: any;
  sort: any;
}

export const onRequestUsers = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('onRequestUsers');

    if (!checkAndLog(request)) {
      return;
    }

    // Заполняю запрос необязательными данными
    const req = {...request.body} as UsersRequest;
    if (!req.page) {
      req.page = 0;
    }
    if (!req.size) {
      req.size = 10;
    }
    if (!req.query) {
      req.query = {};
    }
    if (!req.sort) {
      req.sort = {};
    }


    // запрос по пользователям с пагинацией и сортировкой
    usersStorage().find(req.query)
      .skip(req.page * req.size)
      .limit(req.size)
      .sort(req.sort)
      .exec((err, documents) => {
        if (err) {
          console.log(err);
          return response.status(403).send(err.message);
        }

        // тут запрашиваю общее кол-во по этому запросу
        usersStorage().count(req.query, async (err1, n) => {
          if (err1) {
            console.log(err1);
            return response.status(403).send(err1.message);
          }

          let whitelist: WhitelistItem[] | null = null;

          if (config().whitelistPath) {
            whitelist = await readJson<WhitelistItem[]>(config().whitelistPath as string);

            // Заполняю признак белого списка
            for (let usr of documents) {
              usr.whitelisted = whitelist.some(x => x.name === usr.login);
            }
          }

          // формирую ответ и высылаю
          const resp: UsersResp = {
            count: n,
            items: documents
          };

          return response.json(resp);
        });
      })


  } catch (e) {
    console.log(e);
    return response.sendStatus(403);
  }
}