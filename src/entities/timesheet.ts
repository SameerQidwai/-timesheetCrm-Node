import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { TimesheetProjectEntry } from './timesheetProjectEntry';
import { TimesheetEntry } from './timesheetEntry';
import { TimesheetStatus } from '../constants/constants';

@Entity('timesheets')
export class Timesheet extends Base {
  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @Column({ name: 'employee_id' })
  employeeId: number;

  @Column({ name: 'status', type: 'enum', enum: TimesheetStatus })
  status: TimesheetStatus;

  @Column({ name: 'notes', type: 'text' })
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
