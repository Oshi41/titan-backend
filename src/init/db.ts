import Nedb from "nedb";
import path from "path";
import {admin} from "../index";
import {NewsItem, User} from "../types/index";
import {createPath} from "../utils/index";

/**
 * Создаю базу данных для пользователей
 */
export const getUsersDb = async (): Promise<Nedb<User>> => {
  const file = path.resolve('_storage', 'users.jsonl');
  const created = await createPath(file);

  const db = new Nedb({
    filename: file,
    timestampData: true,
  });

  if (created) {
    db.ensureIndex({
      fieldName: 'login',
      sparse: false,
      unique: true,
    });

    db.ensureIndex({
      fieldName: 'uuid',
      sparse: false,
      unique: true,
    });

    db.update({_id: '1234567890123456'}, admin(), {
      upsert: true
    });
  }

  db.loadDatabase();

  // Раз в час
  db.persistence.setAutocompactionInterval(1000 * 60 * 60);
  return db;
}

/**
 * Достаю БД с новостями
 */
export const getNewsDb = async (): Promise<Nedb<NewsItem>> => {
  const file = path.resolve('_storage', 'news.jsonl');
  const created = await createPath(file);

  const db = new Nedb({
    filename: file,
    timestampData: true,
  });

  if (created) {
    db.ensureIndex({
      fieldName: 'date',
      sparse: false,
      unique: true,
    });
  }

  db.loadDatabase();

  // Раз в час
  db.persistence.setAutocompactionInterval(1000 * 60 * 60);

  return db;
}