import moment from 'moment';
import { createConnection, getManager } from 'typeorm';
import { CalendarDay } from './entities/calendarDays';
import { Opportunity } from './entities/opportunity';
const connection = createConnection();

connection
  .then(async () => {
    let manager = getManager();

    const START_DATE = '2020-01-01';
    const END_DATE = '2025-12-31';

    let startDate = moment(START_DATE, 'YYYY-MM-DD');
    let endDate = moment(END_DATE, 'YYYY-MM-DD');

    let dates = [];

    while (startDate <= endDate) {
      let weekDay = startDate.format('dddd');
      let isWeekDay = weekDay === 'Saturday' || weekDay === 'Sunday' ? 0 : 1;

      dates.push(
        manager.create(CalendarDay, {
          day: startDate.date(),
          month: startDate.month() + 1,
          year: startDate.year(),
          weekday: weekDay,
          isWeekday: isWeekDay,
          actualDate: startDate.format('YYYY-MM-DD'),
        })
      );

      startDate.add(1, 'day');
    }
    await manager.insert(CalendarDay, dates);

    console.log('Script Ran Successfully..');
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
