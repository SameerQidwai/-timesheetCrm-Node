import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Base } from './common/base';
import { TimesheetMilestoneEntry } from './timesheetMilestoneEntry';
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

  public get getStatus(): TimesheetStatus {
    let status: TimesheetStatus = TimesheetStatus.SAVED;

    for (let milestoneEntry of this.milestoneEntries) {
      // for (let entry of milestoneEntry.entries) {
      //   if (entry.rejectedAt !== null) status = TimesheetStatus.REJECTED;
      //   else if (entry.approvedAt !== null) status = TimesheetStatus.APPROVED;
      //   else if (entry.submittedAt !== null) status = TimesheetStatus.SUBMITTED;
      // }
      let entry = milestoneEntry.entries[0];
      if (entry) {
        if (entry.rejectedAt !== null) status = TimesheetStatus.REJECTED;
        else if (entry.approvedAt !== null) status = TimesheetStatus.APPROVED;
        else if (entry.submittedAt !== null) status = TimesheetStatus.SUBMITTED;
      }
    }

    return status;
  }

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @OneToMany(
    () => TimesheetMilestoneEntry,
    (timesheetMilestoneEntry) => timesheetMilestoneEntry.timesheet,
    {
      cascade: true,
    }
  )
  milestoneEntries: TimesheetMilestoneEntry[];
}
