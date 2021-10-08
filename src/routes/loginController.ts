import { store as _store } from '../index';
import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';

/**
 * ОБрабатываю вход в систему
 * @param request - запрос
 * @param response - ответ
 * @param next - middleware
 */
export const handleLogin = (request: Request, response: Response, next: NextFunction) => {
  console.log('handleLogin');
  console.log(request);

  let login = request.query['login'] as string;
  if (!login) {
    console.log('No login provided');
    return response.status(403)
      .send('No login provided');
  }

  console.log('login=' + login);

  let pass = request.query['pass'] as string;
  if (!pass) {
    console.log('No password provided');
    return response.status(403)
      .send('No password provided');
  }

  console.log('pass=' + pass);

  _store.check(login, pass)
    .then(x => {
      if (x.login !== login) {
        throw new Error('Login or password or both are incorrect');
      }

      console.log('log in completed');
      response.send(`OK:${login}`);
    })
    .catch(x => {
      console.log(x);
      response.sendStatus(403);
    });
};