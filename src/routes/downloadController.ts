import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';
import * as fs from 'fs';
import path from 'path';

/**
 * Папка, где лежат разрешенные файлы для скачивания
 */
const folder = path.normalize(path.resolve('_download'));

/**
 * Пытаемся скачать файл
 * @param request
 * @param response
 * @param next
 */
export const handleDownload = (request: Request, response: Response, next: NextFunction) => {
  console.log('handleDownload');
  console.log(request);

  // Создали папку по необходимости
  if (!fs.existsSync(folder)) {
    console.log('creating folder');
    fs.mkdirSync(folder);
  }

  const file: string = request.query['file'] as string;
  console.log('origin file from request: ' + file);

  // нет файла, выходим
  if (!file) {
    console.log('No file provided');
    return response.status(403)
      .send('No file provided');
  }

  // файлы должны лежать в папке _download
  const filepath: string = path.normalize(path.resolve(folder, file));
  console.log('filename: ' + filepath);

  if (!fs.existsSync(filepath)) {
    console.log(`this file [${file}] is not existing`);
    return response.status(404)
      .send(`this file [${file}] is not existing`);
  }

  // нацелили файл выше папки download, защищаемся
  if (!filepath.includes(folder)) {
    console.log('outside of download folder');
    response.status(403)
      .send('outside of download folder');
    return;
  }

  const clientFileName: string = path.basename(filepath);

  fs.realpath(filepath, (err, resolvedPath) => {
    if (err) {
      console.log(err);
      response.sendStatus(500);
    } else {
      console.log('resolved path: ' + resolvedPath);
      response.download(resolvedPath, clientFileName);
    }
  });

  // читаю статы файла
  // fs.lstat(filepath, (err, stats) => {
  //   if (err) {
  //     console.log(err);
  //     response.status(500).send(err);
  //   } else {
  //     // если символ. ссылка
  //     if (stats.isSymbolicLink()) {
  //       // узнаю источник
  //       fs.readlink(filepath, (err1, linkString) => {
  //         if (err1) {
  //           console.log(err1);
  //           response.status(500).send(err1);
  //         } else {
  //           // посылаю источник
  //           response.download(linkString, clientFileName);
  //         }
  //       });
  //     } else {
  //       // отсылаю сам файл
  //       response.download(filepath, clientFileName);
  //     }
  //   }
  // });
};
