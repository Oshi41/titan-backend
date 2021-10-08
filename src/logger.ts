import { WriteStream } from 'fs';
import util from 'util';
import fs from 'fs';
import path from 'path';

let stream: WriteStream | undefined = undefined;
let logFile: string | undefined = undefined;

const logs = path.resolve('logs');

const getStream = () => {
  const currentDate: Date = new Date();
  const name = path.resolve('logs', `${currentDate.getDay()}.${currentDate.getMonth()}.${currentDate.getFullYear()}.log`);

  if (name !== logFile || !stream || !logFile) {
    logFile = name;
    stream = fs.createWriteStream(logFile, { flags: 'w' });
  }

  return stream;
};


export const init = () => {
  if (!fs.existsSync(logs)){
    fs.mkdirSync(logs);
    console.log('logs folder created');
  }

  console.log = o => {
    process.stdout.write(util.format(o) + '\n');
    getStream().write(util.format(o) + '\n');
  };
};