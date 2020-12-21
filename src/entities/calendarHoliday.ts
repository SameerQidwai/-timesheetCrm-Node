import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'; 
import { Base } from './common/base';
import { Calendar } from './calendar';
import { HolidayType } from './holidayType';

@Entity("calendar_holidays") 
export class CalendarHoliday extends Base { 

   @ManyToOne(() => Calendar)
   @JoinColumn({ name: "calendar_id" })
   calendar: Calendar;

   @ManyToOne(() => HolidayType)
   @JoinColumn({ name: "holiday_type_id" })
   holidayType: HolidayType;

   @Column({ name: "date" }) 
   date: Date;

}