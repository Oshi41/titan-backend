import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {usersStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {User} from "../../types/index";
import {checkSqlString} from "../../utils/index";

const allKeys = Object.keys({
  login: '',
  pass: '',
  uuid: '',
  ip: '',
  access: '',
  server: ''
} as User);

interface UsersResp {
  items: User[],
  count: number
}

export const onRequestUsers = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('onRequestUsers');

    if (!checkAndLog(request)) {
      return;
    }

    const filter = (request.query['filter'] as string) ?? '';
    const page = parseInt((request.query['page'] as string) ?? '0');
    const pageSize = parseInt((request.query['size'] as string) ?? '0');

    if (filter && !checkSqlString(filter, allKeys)) {
      console.log('wrong sql query');
      console.log(filter);
      return response.sendStatus(403);
    }

    usersStorage.getDb()
      .all(`select *
            from users ${filter}`, (err: Error | null, rows: User[]) => {
        if (err) {
          console.log(err.message);
          return response.sendStatus(500);
        }

        let result = rows;

        if (page >= 0 && pageSize > 0) {
          result = rows.slice(pageSize * page, pageSize * (page + 1));
        }

        return response.json({
          items: result,
          count: rows.length
        } as UsersResp);
      });


  } catch (e) {
    console.log(e);
    return response.sendStatus(403);
  }
}