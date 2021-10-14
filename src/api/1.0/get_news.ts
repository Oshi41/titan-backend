import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {newsStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {NewsResp, QueryMeta} from "../../news/INewsStorage";

export const onGetNews = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('onGetNews');

    if (!checkAndLog(request, ['page'], ['size'])) {
      return;
    }

    const page = parseInt(request.query['page'] as string ?? '0');

    const size = parseInt(request.query['size'] as string ?? '10');

    const query = {
      page,
      size,
      // поле дата нужно окружить пробелами! Иначе упадёт проверка на валидность SQL строки
      filters: 'order by datetime( date ) desc'
    } as QueryMeta;

    const resp: NewsResp = await newsStorage.get(query);
    return response.json(resp);
  } catch (e) {
    console.log(e);
    return response.sendStatus(403);
  }
}