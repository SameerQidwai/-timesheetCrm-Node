import cron from 'node-cron';
import moment from 'moment-timezone';
import { runMonthly } from '../monthCronScript';
import { runYearly } from '../yearCronScript';
import { getManager } from 'typeorm';
import { EmploymentContract } from '../entities/employmentContract';
import { NotificationManager } from './notifier';
import { NotificationEventType, TimesheetStatus } from '../constants/constants';
import { Organization } from '../entities/organization';
import { Timesheet } from '../entities/timesheet';
moment.tz.setDefault('Australia/Melbourne');

let monthCronString = '1 0 0 15 * *';
let yearCronString = '1 0 5 15 6 *';
let notificationsCronString = '1 0 0 * * *';
let everySecondCronString = '* * * * * *';

export const everySecondCron = cron.schedule(
  everySecondCronString,
  async () => {
    console.log(
      moment().format('s'),
      moment().format('D'),
      moment().format('M')
    );
    if (moment().format('s') === '35') return true;
    console.log('Every second');
  },
  {
    scheduled: false,
    timezone: 'Australia/Melbourne',
  }
);

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
    scheduled: false,
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
    scheduled: false,
    timezone: 'Australia/Melbourne',
  }
);

export const notficiationsCron = cron.schedule(
  notificationsCronString,
  async () => {
    try {
      if (moment().format('D') == '15') return true;
      await getManager().transaction(async (transactionalEntityManager) => {
        //-- CONTRACTS ENDING
        let contracts = await transactionalEntityManager.find(
          EmploymentContract,
          {
            relations: [
              'employee',
              'employee.contactPersonOrganization',
              'employee.contactPersonOrganization.contactPerson',
            ],
          }
        );

        for (let contract of contracts) {
          if (!contract.endDate) {
            continue;
          }

          let isEmployee =
            contract.employee.contactPersonOrganization.organizationId === 1;

          if (moment().add(3, 'days').isAfter(moment(contract.endDate))) {
            await NotificationManager.danger(
              [],
              'Contract Ending',
              `Contract of ${
                isEmployee ? 'Employee' : 'Sub Contractor'
              } with the name ${contract.employee.getFullName} is ending on ${
                contract.endDate
              }`,
              `${isEmployee ? '/Employee' : 'sub-contractors'}/${
                contract.employeeId
              }/contracts`,
              isEmployee
                ? NotificationEventType.EMPLOYEE_CONTRACT_ENDING
                : NotificationEventType.SUBCONTRACTOR_CONTRACT_ENDING
            );
          }
        }

        //-- ORGANIZATIONS CREATED
        // let organizations = await transactionalEntityManager.find(Organization);

        // for (let organization of organizations) {
        //   if (
        //     moment(organization.createdAt).isAfter(moment().subtract(1, 'day'))
        //   ) {
        //     await NotificationManager.info(
        //       [],
        //       'New Organization',
        //       `New Organization with the name ${organization.name} (${
        //         organization.title
        //       }) was created yesterday at ${moment(
        //         organization.createdAt
        //       ).format('HH:mm')}`,
        //       `/organisations`,
        //       NotificationEventType.ORGANIZATION_CREATE
        //     );
        //   }
        // }

        //-- NOT SUBMITTED TIMESHEETS
        let timesheets = await transactionalEntityManager.find(Timesheet, {
          relations: [
            'milestoneEntries',
            'milestoneEntries.entries',
            'employee',
            'employee.contactPersonOrganization',
            'employee.contactPersonOrganization.contactPerson',
          ],
        });

        let _index = 1;
        for (let timesheet of timesheets) {
          console.log((_index / timesheets.length) * 100);
          if (moment().add(3, 'days').isAfter(moment(timesheet.endDate))) {
            if (timesheet.getStatus !== TimesheetStatus.SAVED) continue;

            await NotificationManager.danger(
              [timesheet.employeeId],
              'Timesheet Pending',
              `Timesheet of month ${moment(timesheet.startDate).format(
                'MMM'
              )} is not submitted by ${timesheet.employee.getFullName}`,
              `/time-sheet-approval`,
              NotificationEventType.TIMESHEET_PENDING
            );
          }
          _index++;
        }
      });
      console.log(
        'Notifications Cron Ran At',
        moment().format('DD MMM YYYY H:mm:s')
      );

      return true;
    } catch (e) {
      console.log(
        'Notifications Cron Failed At',
        moment().format('DD MMM YYYY H:mm:s')
      );
      console.log(e);
    }
  },
  {
    scheduled: false,
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

let startNotificationsCron = () => {
  console.log('Scheduling Notifications Crons');
  notficiationsCron.start();
  return 1;
};

let startEverySecondCron = () => {
  console.log('Scheduling EverySecond Cron');
  everySecondCron.start();
  return 1;
};

let runCrons = async () => {
  console.log('Starting Crons');
  startMonthlyCrons();
  startYearlyCrons();
  startNotificationsCron();
  // startEverySecondCron();
};

export default runCrons = runCrons;
