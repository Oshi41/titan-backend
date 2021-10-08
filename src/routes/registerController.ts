import { Request, Response } from 'express';
import { LoginRequest } from '../types/types';
import { store as _store, config } from '../index';
import { NextFunction } from 'express-serve-static-core';
import path from 'path';
import * as fs from 'fs';

const file = path.resolve('_store', 'ips.json');

/**
 * ОБрабатываю регистрацию
 * @param request - запрос
 * @param response - ответ
 * @param next - middleware
 */
export const handleRegister = async (request: Request, response: Response, next: NextFunction) => {
  console.log('handle register');
  console.log(request);
  console.log(response);

  let body = request.body as LoginRequest;
  if (!body) {
    console.log('No body provided');
    return response
      .status(403)
      .send('No body provided');
  }

  if (!body.login || body.login.length > 30) {
    console.log('No login provided or length is greater than 30');
    return response
      .status(403)
      .send('No login provided or length is greater than 30');
  }

  if (!body.pass || body.pass.length < 5 || body.pass.length > 60) {
    console.log('Password is empty or less than 5 symbols length or more than 60 symbols length');
    return response
      .status(403)
      .send('Password is empty or less than 5 symbols length or more than 60 symbols length');
  }

  let map: Map<string, string[]> | undefined = undefined;
  const ip: string = request.header('x-forwarded-for')
    || request.socket.remoteAddress
    || '';

  console.log('ip=' + ip);

  if (ip && config.registrationByIp > 0) {
    try {
      await fs.promises.writeFile(file, '[]', { flag: 'wx' });
      console.log('created file: ' + file);
    } catch (e) {
      // ignored
    }

    try {
      const json = await fs.promises.readFile(file, 'utf-8');
      const ips: [ string, string[] ][] = JSON.parse(json) as [ string, string[] ][];
      map = new Map(ips);
      const logins: string[] | undefined = map.get(ip);
      // @ts-ignore
      if (logins?.length >= config.registrationByIp) {
        return response.status(403).send('Too much logins per IP:' + ip);
      }
    } catch (e) {
      console.log(e);
      return response.sendStatus(500);
    }
  }

  try {
    const busy: boolean = await _store.busy(body.login);
    if (busy) {
      console.log('Login is busy');
      return response.status(403).send('Login is busy');
    }

    const wasAdded: boolean = await _store.add(body.login, body.pass);
    if (wasAdded) {
      console.log('Error during registration');
      return response.status(500).send('Error during registration');
    }

    if (map) {
      let ips: string[] = map.get(ip) ?? [];
      ips.push(body.login);
      try {
        await fs.promises.writeFile(file, JSON.stringify(ips), 'utf-8');
      } catch (e) {
        console.log(e);
        return response.sendStatus(500);
      }
    }

    return response.sendStatus(200);
  } catch (e) {
    console.log(e);
    response.sendStatus(403);
  }
};