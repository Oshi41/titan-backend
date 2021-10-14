import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {newsStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {NewsItem} from "../../types/index";

export const onDeleteNews = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('onDeleteNews');

    if (!checkAndLog(request)) {
      return;
    }

    const recordId = request?.body?.id as string;
    if (!recordId) {
      console.log('no id provided');
      return response.sendStatus(403);
    }

    const wasDeleted: boolean = await newsStorage.delete({newsItem: {id: recordId} as NewsItem});

    return response.sendStatus(wasDeleted ? 200 : 404);
  } catch (e) {
    console.log(e);
    return response.sendStatus(403);
  }
}