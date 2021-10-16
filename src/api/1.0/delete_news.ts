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

    const news: NewsItem = request?.body as NewsItem;

    if (!news._id) {
      console.log('no id provided');
      return response.sendStatus(403);
    }

    newsStorage().remove(news, (err, n) => {
      const status = n > 0 ? 200 : 404;
      return response.sendStatus(status);
    });

  } catch (e) {
    console.log(e);
    return response.sendStatus(403);
  }
}