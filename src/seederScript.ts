import { createConnection } from 'typeorm';
const connection = createConnection();
import runSeeders from './utilities/seeders';

connection
  .then(() => {
    runSeeders();
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });