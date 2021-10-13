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

export const onRequestUsers = async (request: Request, response: Response, next: NextFunction) => {
  try {
    if (!checkAndLog(request)) {
      return;
    }

    const filter = (request.query['filter'] as string) ?? '';
    const sort = (request.query['sort'] as string) ?? '';
    const page = parseInt((request.query['page'] as string) ?? '0');
    const size = parseInt((request.query['size'] as string) ?? '10');

    if (filter && !checkSqlString(filter, allKeys)) {
      console.log('wrong sql query');
      console.log(filter);
      return response.sendStatus(403);
    }

    let sql = 'select * from users';
    if (filter) {
      sql += ' where ' + filter;
    }

    if (page >= 0 && size > 0) {
      sql += ` limit ${size} offset ${size * page}`;
    }

    usersStorage.getDb()
      .all(sql, (err: Error | null, rows: User[]) => {
        if (err) {
          console.log(err.message);
          return response.sendStatus(500);
        }

        return response.json(rows);
      });


  } catch (e) {
    console.log(e);
    return response.sendStatus(403);
  }
}