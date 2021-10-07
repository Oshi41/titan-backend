import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {store as _store} from '../index';
import {User} from "../types/types";
import {v4 as randomUuid} from 'uuid';

type AuthRequest = {
    agent: {
        name: 'Minecraft';
        version: '1';
    };
    username: string;
    password: string;
};

type AuthResponse = {
    clientToken: string;
    accessToken: string;

    selectedProfile: {
        name: string;
        id: string;
    };
}

const debugUuid = randomUuid();

/**
 *
 * @param request
 * @param response
 * @param next
 */
export const handleAuth = async (request: Request, response: Response, next: NextFunction) => {
    const body: AuthRequest = request.body as AuthRequest;

    if (!body.password || !body.username) {
        response.status(403).send('No username or password provided!');
        return;
    }

    let user: User;

    try {
        user = await _store.check(body.username, body.password);
    } catch (e) {
        response.status(403).json(e);
        return;
    }

    const resp: AuthResponse = {
        accessToken: randomUuid(),
        clientToken: debugUuid,
        // clientToken: user.uuid ?? debugUuid,
        selectedProfile: {
            name: body.username,
            // id: (user.uuid ?? debugUuid).replace('-', ''),
            id: debugUuid.replace('-', ''),
        }
    };

    response.json(resp);
}