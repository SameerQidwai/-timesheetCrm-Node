import cron from 'node-cron';
import moment from 'moment-timezone';
import { runMonthly } from '../monthCronScript';
import { runYearly } from '../yearCronScript';

let monthCronString = '* * * * * *';
let yearCronString = '1 10 0 15 6 *';

export const leaveRequestMonthlyCron = cron.schedule(
  monthCronString,
  async () => {
    try {
      await runMonthly();
      console.log('Monthly Cron Ran At', moment().format('DD MMM YYYY H:mm:s'));
    } catch (e) {
      console.log(
        'Monthly Cron Failed At',
        moment().format('DD MMM YYYY H:mm:s')
      );
      console.log(e);
    }
  },
  {
    scheduled: true,
    timezone: 'Australia/Melbourne',
  }
);

export const leaveRequestYearlyCron = cron.schedule(
  yearCronString,
  async () => {
    try {
      await runYearly();
      console.log('Yearly Cron Ran At', moment().format('DD MMM YYYY H:mm:s'));
    } catch (e) {
      console.log(
        'Yearly Cron Failed At',
        moment().format('DD MMM YYYY H:mm:s')
      );
      console.log(e);
    }
  },
  {
    scheduled: true,
    timezone: 'Australia/Melbourne',
  }
);

let startMonthlyCrons = () => {
  console.log('Scheduling Monthly Crons');
  leaveRequestMonthlyCron.start();
  return 1;
};

let startYearlyCrons = () => {
  console.log('Scheduling Yearly Crons');
  leaveRequestYearlyCron.start();
  return 1;
};

let runCrons = async () => {
  console.log('Starting Crons');
  startMonthlyCrons();
  startYearlyCrons();
};

export default runCrons = runCrons;
