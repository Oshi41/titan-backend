import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";
import * as fs from "fs";
import path from "path";
import {v4 as uuid} from 'uuid';
import {checkAndLog} from "../../log/index";
import {createPath} from "../../utils/index";
import * as multer from 'multer';

/**
 * Основная папка с репортами
 */
const folder = path.resolve('_storage', 'crash reports');

/**
 * Выбираю имя для будущего файла
 * @param request - запрос от клиента
 * @param file - текущий файл
 * @param callback - callback подтверждения
 */
const selectDirectory = (request: Request,
                         file: Express.Multer.File,
                         callback: (error: Error | null, destination: string) => void): void | undefined => {
  console.log('select dir for uploading');
  checkAndLog(request);

  const author = request?.body?.author as string;

  if (!author) {
    console.log('no info about author ')
    return callback(new Error('no info about author '), '');
  }

  try {
    const byUser = path.resolve(folder, author);
    return callback(null, byUser);

    // createPath(byUser, true)
    //   .then(x => {
    //     if (!x) {
    //       console.log('cannot create user dir')
    //       return callback(new Error('cannot create user dir'), '');
    //     }
    //
    //     const date: Date = new Date();
    //     const name = `${date.toDateString()} ${date.toTimeString()}.txt`;
    //
    //     fs.writeFileSync(name + '.comment', comment, 'utf-8');
    //     return callback(null, name);
    //   });

  } catch (e) {
    console.log(e);
    return callback(new Error(e + ''), '');
  }
};

/**
 * Выбираю имя файла + сохраняю коментарий
 * @param request
 * @param file
 * @param callback
 */
const selectFilename = (request: Request, file: Express.Multer.File, callback: (error: (Error | null), filename: string) => void): void => {
  console.log('select file for uploading');

  const comment = request.body.comment as string;
  if (!comment) {
    return callback(new Error('no comment provided'), '');
  }

  selectDirectory(request, file, (error, destination) => {
    if (error) {
      return callback(error, '');
    }

    const date: Date = new Date();
    const fileName = `${date.getDay()}.${date.getMonth()}.${date.getFullYear()}  ${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}.txt`;

    const fullName = path.resolve(destination, fileName);
    const commentFile = path.resolve(destination, fileName + '.comment');

    createPath(commentFile, false)
      .then(created => {
        if (created) {
          return fs.promises.writeFile(commentFile, comment, 'utf-8')
            .then(() => {
              return createPath(fullName)
                .then(created2 => {
                  if (created2) {
                    return callback(null, fileName);
                  }
                })
            })
        }
      })
      .catch(x => {
        console.log(x);
        callback(new Error(x), '');
      });
  });


  // const comment = request?.body?.comment as string;
  // if (comment) {
  //   console.log('no info about comment ')
  //   return callback(new Error('no info about comment '), '');
  // }
  //
  //
  //
  // try {
  //   fs.writeFileSync(path.resolve(file.destination, fileName + '.comment'), comment, 'utf-8');
  //   console.log('comment created');
  //
  //   const result: string = path.resolve(file.destination, fileName);
  //   return callback(null, result);
  // } catch (e) {
  //   console.log(e);
  //   return callback(new Error(e + ''), '');
  // }
}

// @ts-ignore
export const downloadMulter = multer.default({
  limits: {

    files: 2,
    // Максимум 5 мб файлы
    fileSize: 1024 * 1024 * 5,
  },
  storage: multer.diskStorage({
      destination: selectDirectory,
      filename: selectFilename,
    },
  ),
});

export const onCrashPost = async (request: Request, response: Response, next: NextFunction) => {
  const file: Express.Multer.File | undefined = request.file;
  if (!file) {
    return response.sendStatus(500);
  }

  const comment = request.body.comment as string;
  if (!comment) {
    console.log('no comment provided');
    return response.sendStatus(403);
  }


};