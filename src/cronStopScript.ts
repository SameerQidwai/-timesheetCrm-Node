import { createConnection } from 'typeorm';
const connection = createConnection();
import {
  leaveRequestMonthlyCron,
  leaveRequestYearlyCron,
} from './utilities/crons';

connection
  .then(() => {
    console.log('stopping all cron jobs');

    console.log('stopping mongthly cron job');
    leaveRequestMonthlyCron.stop();

    console.log('stopping yearly cron job');
    leaveRequestYearlyCron.stop();

    console.log('all cron jobs stopped');
    return 1;
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
