import axios, {AxiosError, AxiosResponse} from "axios";
import {PlainPass} from "../password/plainPass";
import {User} from "../types/types";
import {Store} from "./store";

type BusyResp = {
    id: string;
    name: string;
}

type Resp = {
    accessToken: string;
}

export class ElyByStore extends Store {

    constructor() {
        super(new PlainPass());
    }

    protected addInner(login: string, pass: string): Promise<boolean> {
        return Promise.reject('Visit account.ely.by/register instead');
    }

    async busy(login: string): Promise<boolean> {
        const url = `https://authserver.ely.by/api/users/profiles/minecraft/${login}`;
        const response: AxiosResponse<BusyResp> = await axios.get<BusyResp>(url);
        return response.status === 200 && response.data.id?.length > 0;
    }

    protected checkInner(login: string, pass: string): Promise<User> {
        return axios.post<any, Resp>('https://authserver.ely.by/auth/authenticate', {
            username: login,
            password: pass,
            clientToken: 'does not mater',
            requestUser: false
        })
            // @ts-ignore
            .then((x: AxiosResponse<Resp>) => {
                    if (!x.data.accessToken) {
                        throw new Error('Not autentificated');
                    }

                    return {
                        login,
                        pass,
                        access: x.data.accessToken
                    } as User;
                }
            )
            .catch((x: AxiosError) => {
                throw new Error(x.message);
            });
    }
}