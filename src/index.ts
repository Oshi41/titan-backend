import bodyParser from "body-parser";
import express, {Application} from "express";
import path from "path";
import {getApiRouter} from "./api/1.0/index";
import {getYggdrasilRouter} from "./api/yggdrasil/index";
import {readCfg} from "./init/cfg";
import {checkDownloadFolder} from "./init/download";
import {initLog} from "./init/log";
import {getPass} from "./init/pass";
import {setServers} from "./init/srv";
import {IStorage} from "./storage/IStorage";
import {UsersSql} from "./storage/usersSql";
import {BackendConfig} from "./types/index";

const cors = require('cors');

export let config: BackendConfig;
export let storage: IStorage;

let app: Application;

const onStartUp = async () => {
    // самый первый шаг
    initLog();

    config = await readCfg();
    await setServers();
    storage = new UsersSql(getPass(config.passEncrypt));
    await checkDownloadFolder();

    app = express();
    const {url: apiUrl, router: apiRouter} = getApiRouter();
    app.use(apiUrl, apiRouter);

    const {url: yggUrl, router: yggRouter} = getYggdrasilRouter();
    app.use(yggUrl, yggRouter);

    app.use(cors());

    app.use(bodyParser.json());

    // статические файлы
    app.use(express.static(path.resolve('./frontend')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve('./frontend/index.html'));
    });

    app.listen(config.port);
};

onStartUp();