import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Base } from './common/base';
import { TimesheetProjectEntry } from './timesheetProjectEntry';
import { TimesheetEntry } from './timesheetEntry';
import { TimesheetStatus } from '../constants/constants';
import { Employee } from './employee';

@Entity('timesheets')
export class Timesheet extends Base {
  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @Column({ name: 'employee_id', unique: false })
  employeeId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @OneToMany(
    () => TimesheetProjectEntry,
    (timesheetProjectEntry) => timesheetProjectEntry.timesheet,
    {
      cascade: true,
    }
  )
  projectEntries: TimesheetProjectEntry[];
}
