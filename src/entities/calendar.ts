import { Entity, Column, OneToMany } from 'typeorm'; 
import { CalendarHoliday } from './calendarHoliday';
import { Base } from './common/base';

@Entity("calendars") 
export class Calendar extends Base {

   @Column({ name: "label" })
   label: string;

   @Column({ name: "is_active" })
   isActive: boolean;

   @OneToMany(() => CalendarHoliday, calendarHoliday => calendarHoliday.calendar, { 
      cascade: true 
    })
    calendarHolidays: CalendarHoliday[];
}