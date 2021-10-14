import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {newsStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {NewsItem} from "../../types/index";

/**
 * Добавляю новость
 * @param request
 * @param response
 * @param next
 */
export const onAddNews = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('onAddNews');

    if (!checkAndLog(request)) {
      return;
    }

    const body: NewsItem = request.body as NewsItem;
    if (!body?.author || !body?.date || !body?.html || !body?.name) {
      console.log('not enought data');
      return response.sendStatus(403);
    }

    // Так работает БД
    body.date = new Date(body.date).toISOString();

    const result: NewsItem = await newsStorage.put({newsItem: body});
    if (!result) {
      return response.sendStatus(500);
    }

    return response.status(200)
      .send(result.id);
  } catch (e) {
    console.log(e);
    return response.sendStatus(403);
  }
}