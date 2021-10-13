import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';
import { usersStorage } from '../../../index';
import { checkAndLog } from '../../../log';
import { User } from '../../../types';
import { fromHexString } from '../../../utils';

interface JoinBody {
  accessToken: string;
  /**
   * UUID без тире!!!
   */
  selectedProfile: string;
  serverId: string;
}

export interface JoinResp {
  id: string;
  name: string;
}

/**
 * Вызывается при подключении к серверу
 * @see https://wiki.vg/Protocol_Encryption#Client
 */
export const onJoin = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('join');

    if (!checkAndLog(request)) {
      return;
    }

    const body: JoinBody = request.body as JoinBody;
    if (!body.selectedProfile) {
      return response.sendStatus(400);
    }

    body.accessToken = fromHexString(body.accessToken);
    body.selectedProfile = fromHexString(body.selectedProfile);

    const users: User[] = await usersStorage.find(
      [ 'uuid', body.selectedProfile ],
      [ 'access', body.accessToken ]);
    if (users?.length !== 1) {
      return response.sendStatus(400);
    }

    const original = {
      ...users[0],
      server: body.serverId,
      access: body.accessToken,
    } as User;

    if (!await usersStorage.update(original)) {
      return response.sendStatus(403);
    }

    const resp: JoinResp = {
      id: users[0].uuid,
      name: users[0].login
    };

    return response.json(resp);
  } catch (e) {
    console.log(e);
    return response.sendStatus(500);
  }
};