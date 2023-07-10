import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';

@Entity('calendar_days')
export class CalendarDay extends Base {
  @Column({ name: 'day', nullable: false })
  day: number;

  @Column({ name: 'month', nullable: false })
  month: number;

  @Column({ name: 'year', nullable: false })
  year: number;

  @Column({ name: 'weekday', type: 'varchar', length: 10, nullable: false })
  weekday: string;

  @Column({ name: 'is_weekday', nullable: false })
  isWeekday: Boolean;

  @Column({ name: 'actual_date', nullable: false, precision: 3 })
  actualDate: Date;
}
