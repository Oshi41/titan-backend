import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {storage} from "../../../index";
import {checkAndLog} from "../../../log/index";
import {User} from "../../../types/index";
import {fromHexString} from "../../../utils/index";

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

        const users: User[] = await storage.find(['uuid', body.selectedProfile]);
        if (users?.length !== 1) {
            return response.sendStatus(400);
        }

        const original = {
            ...users[0],
            server: body.serverId,
            access: body.accessToken,
        } as User;

        if (!await storage.update(original)) {
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
}