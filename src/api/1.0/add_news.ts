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
    if (!body?.author || !body?.html || !body?.name) {
      console.log('not enought data');
      return response.sendStatus(403);
    }

    // текущая дата
    body.date = new Date();

    // Добавляю новость
    newsStorage()
      .insert(body, (err, document) => {
        // обрабатываю ошибку
        if (err) {
          console.log(err);
          return response.status(403).send(err.message);
        }

        return response.status(200).send(document?._id);
      });


  } catch (e) {
    console.log(e);
    return response.sendStatus(403);
  }
}