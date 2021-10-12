import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';
import { checkAndLog } from '../../log';
import path from 'path';
import * as fs from 'fs';

const file = path.resolve('_storage', 'ssl', 'selfsigned.public.key');

/**
 * Обрабатываю запрос метаданных
 */
export const onMeta = async (request: Request, response: Response, next: NextFunction) => {
  if (!checkAndLog(request)) {
    return;
  }

  try {
    const content: string = await fs.promises.readFile(file, 'utf-8');
    response.json({
      meta: {
        signaturePublickey: content
      }
    });
  } catch (e) {
    response.sendStatus(500);
  }
};