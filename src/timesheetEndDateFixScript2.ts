import moment from 'moment';
import {
  createConnection,
  EntityManager,
  getManager,
  IsNull,
  Not,
} from 'typeorm';
import { LeaveRequest } from './entities/leaveRequest';
import { LeaveRequestBalance } from './entities/leaveRequestBalance';
import { LeaveRequestPolicyLeaveRequestType } from './entities/leaveRequestPolicyLeaveRequestType';
import { Timesheet } from './entities/timesheet';
const connection = createConnection();

connection
  .then(async () => {
    const manager = getManager();

    await manager.transaction(async (trx: EntityManager) => {
      let timesheets = await trx.find(Timesheet, {});
      for (let timesheet of timesheets) {
        let momentEndDate = moment(
          timesheet.endDate,
          'YYYY-MM-DD HH:mm:ss:SSS'
        );

        if (momentEndDate.format('DD') === '01') {
          timesheet.endDate = momentEndDate
            .subtract('1', 'millisecond')
            .toDate();
        } else {
          timesheet.endDate = momentEndDate.endOf('day').toDate();
        }

        await trx.save(timesheet);
      }
    });

    console.log('timesheets updated');

    return true;
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
