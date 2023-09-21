import { createConnection } from 'typeorm';
const connection = createConnection();
import {
  leaveRequestMonthlyCron,
  leaveRequestYearlyCron,
  notficiationsCron,
} from './utilities/crons';

connection
  .then(() => {
    console.log('stopping all cron jobs');

    console.log('stopping mongthly cron job');
    leaveRequestMonthlyCron.stop();

    console.log('stopping yearly cron job');
    leaveRequestYearlyCron.stop();

    console.log('stopping notifications cron job');
    notficiationsCron.stop();

    console.log('all cron jobs stopped');

    process.exit();
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
