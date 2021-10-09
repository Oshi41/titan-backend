import path from "path";
import {createPath} from "../utils/index";

export const DownloadFolder: string = path.resolve('_download');

export const checkDownloadFolder = async () => {
    await createPath(DownloadFolder);
}