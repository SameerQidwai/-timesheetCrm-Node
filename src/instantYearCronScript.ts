import { createConnection } from 'typeorm';
const connection = createConnection();

import { runYearly } from './yearCronScript';

connection
  .then(async () => {
    console.log('Yearly Cron Starts');
    await runYearly();
    console.log('Yearly Cron Ends');
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
