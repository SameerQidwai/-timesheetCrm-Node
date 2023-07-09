import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Calendar } from './calendar';
import { HolidayType } from './holidayType';

@Entity('calendar_holidays')
export class CalendarHoliday extends Base {
  @Column({ name: 'calendar_id', nullable: true })
  calendarId: number;

  @Column({ name: 'holiday_type_id', nullable: true })
  holidayTypeId: number;

  @Column({ name: 'date', precision: 3 })
  date: Date;

  @ManyToOne(() => Calendar)
  @JoinColumn({ name: 'calendar_id' })
  calendar: Calendar;

  @ManyToOne(() => HolidayType)
  @JoinColumn({ name: 'holiday_type_id' })
  holidayType: HolidayType;
}
