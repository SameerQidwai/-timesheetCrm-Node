import { createConnection } from 'typeorm';
const connection = createConnection();
import { runMonthly } from './monthCronScript';

connection
  .then(async () => {
    console.log('Monthly Cron Starts');
    await runMonthly();
    console.log('Monthly Cron Ends');
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
