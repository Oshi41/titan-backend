import {promises as fs} from "fs";
import {PassTransformer} from "../password/passTransformer";
import {FileConfig, FileUser, User} from "../types/types";
import {Store} from "./store";

const {EOL} = require('os');

export class FileStore extends Store {
    private config: FileConfig;

    constructor(pass: PassTransformer, config: FileConfig) {
        super(pass);
        this.config = config;

        fs.writeFile(config.file, '', {flag: 'wx'})
            .catch(x => console.log(x));
    }

    protected async addInner(login: string, pass: string): Promise<boolean> {

        const toAdd = `${login}: {
    username: "${login}";
    password: "${pass}";
};
`;
        await fs.appendFile(this.config.file, toAdd, 'utf-8');
        return true;
    }

    async busy(login: string): Promise<boolean> {
        const raw: string = await fs.readFile(this.config.file, 'utf-8');
        return raw.includes(`"${login}";`);
    }

    protected async checkInner(login: string, pass: string): Promise<User> {
        const raw: string = await fs.readFile(this.config.file, 'utf-8');
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
}