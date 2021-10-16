import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {usersStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {User} from "../../types/index";
import {checkSqlString} from "../../utils/index";

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
      .limit(req.size)
      .skip(req.page * req.size)
      .sort(req.sort)
      .exec((err, documents) => {
        if (err) {
          console.log(err);
          return response.status(403).send(err.message);
        }

        // тут запрашиваю общее кол-во по этому запросу
        usersStorage().count(req.query, (err1, n) => {
          if (err1) {
            console.log(err1);
            return response.status(403).send(err1.message);
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