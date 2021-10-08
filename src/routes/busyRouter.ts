import { Request, Response } from 'express';
import { store as _store } from '../index';
import { NextFunction } from 'express-serve-static-core';

/**
 * ОБрабатываю регистрацию
 * @param request - запрос
 * @param response - ответ
 * @param next - middleware
 */
export const handleBusy = (request: Request, response: Response, next: NextFunction) => {
  console.log('handleBusy');
  console.log(request);

  let login = request.query['login'] as string;
  console.log(`login=${login}`);
  if (!login) {
    console.log('No login provided');
    return response.status(403)
      .send('No login provided');
  }

  _store.busy(login)
    .then(x => {
      console.log(`busy: ` + x.valueOf());
      response.status(200)
        .send(x.valueOf() ? 'busy' : 'free');
    }).catch(x => {
    console.log(x);
    response.sendStatus(403);
  });

};