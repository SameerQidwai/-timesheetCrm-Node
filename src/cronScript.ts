import { createConnection } from 'typeorm';
const connection = createConnection();
import runCrons from './utilities/crons';

connection
  .then(() => {
    runCrons();
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
