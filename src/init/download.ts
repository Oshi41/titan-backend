import path from "path";
import {createPath} from "../utils/index";

export const DownloadFolder: string = path.resolve('_download');
const reportsFolder: string = path.resolve('_storage', 'crash reports');

export const checkDownloadFolder = async () => {
    await createPath(DownloadFolder);
    await createPath(reportsFolder);
}