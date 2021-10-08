import {promises as fs} from "fs";
import {PassTransformer} from "../password/passTransformer";
import {FileConfig, User} from "../types/types";
import {Store} from "./store";
import {v4 as uuid} from 'uuid';
import {machineId} from 'node-machine-id';

const {EOL} = require('os');

let admin: User;

type Whitelist = {
    uuid: string;
    name: string;
}

export class FileStore extends Store {
    private config: FileConfig;
    private pass: PassTransformer;

    constructor(pass: PassTransformer, config: FileConfig) {
        super(pass);
        this.pass = pass;
        this.config = config;

        fs.writeFile(config.users, '', {flag: 'wx'})
            .catch(x => console.log(x));

        fs.writeFile(config.uuids, '', {flag: 'wx'})
            .catch(x => console.log(x));

        fs.writeFile(config.serverWhiteList, '', {flag: 'wx'})
            .catch(x => console.log(x));

        machineId().then(x => {
            const login = 'owner_admin';

            admin = {
                login,
                uuid: x,
                pass: pass.transform(uuid()),
                access: uuid(),
                server: uuid(),
            };

            this.busy(login).then(x => {
                if (!x) {
                    this.save(admin);
                }
            })
        });
    }

    protected async addInner(login: string, pass: string): Promise<boolean> {

        return await this.save({
            login,
            pass
        } as User) !== undefined;
    }

    async busy(login: string): Promise<boolean> {
        const raw: string = await fs.readFile(this.config.users, 'utf-8');
        return raw.includes(`"${login}";`);
    }

    protected async checkInner(login: string, pass: string): Promise<User> {
        const raw: string = await fs.readFile(this.config.users, 'utf-8');
        const map: string[] = raw.split(EOL);
        const index: number = map.findIndex(x => x.includes(`"${login}";`));
        if (index >= 0) {
            if (map[index + 1].includes(pass)) {
                return {
                    pass,
                    login
                } as User;
            }
        }

        throw new Error('No user found');
    }

    async save(user: User): Promise<User> {
        if (!user.uuid) {
            user.uuid = uuid();
        }

        if (!user.server) {
            user.server = uuid();
        }

        if (!user.access) {
            user.access = uuid();
        }

        let toAdd = `${user.login}: {
    username: "${user.login}";
    password: "${user.pass}";
};
`;
        await fs.appendFile(this.config.users, toAdd, 'utf-8');

        const id = uuid();

        toAdd = `${id}: {
   username: "${user.login}";
   accessToken: ${uuid()};
};
`;
        await fs.appendFile(this.config.uuids, toAdd, 'utf-8');

        const parse = JSON.parse(await fs.readFile(this.config.serverWhiteList, 'utf-8')) as Whitelist[];
        parse.push({
            name: user.login,
            uuid: id
        });

        await fs.writeFile(this.config.serverWhiteList, JSON.stringify(parse));
        return user;
    }
}