import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import {newsStorage} from "../../index";
import {checkAndLog} from "../../log/index";
import {NewsItem} from "../../types/index";

interface NewsResp {
  total: number;
  news: NewsItem[];
}

export const onGetNews = async (request: Request, response: Response, next: NextFunction) => {
  try {
    console.log('onGetNews');

    if (!checkAndLog(request, ['page'], ['size'])) {
      return;
    }

    const page = parseInt(request.query['page'] as string ?? '0');
    const size = parseInt(request.query['size'] as string ?? '10');

    newsStorage().find({})
      .skip(page * size)
      .limit(size)
      .sort({date: -1})
      .exec((err, documents) => {
        if (err) {
          console.log(err);
          return response.status(403).send(err.message);
        }

        newsStorage().count({}).exec((err1, count) => {
          if (err1) {
            console.log(err1);
            return response.status(403).send(err1.message);
          }

          const resp: NewsResp = {
            total: count,
            news: documents
          };

          return response.json(resp);
        })
      });


  } catch (e) {
    console.log(e);
    return response.sendStatus(403);
  }
}