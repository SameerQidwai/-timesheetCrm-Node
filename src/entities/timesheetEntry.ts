import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { TimesheetProjectEntry } from './timesheetProjectEntry';

@Entity('timesheet_entries')
export class TimesheetEntry extends Base {
  @Column({ name: 'start_time' })
  startTime: Date;

  @Column({ name: 'end_time' })
  endTime: Date;

  @Column({ name: 'break_hours' })
  breakHours: number;

  @Column({ name: 'actual_hours' })
  hours: number;

  @Column({ name: 'note', nullable: true })
  note: string;

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt: Date;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejected_at', nullable: true })
  rejectedAt: Date;

  @Column({ name: 'submitted_by', nullable: true })
  submittedBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'submitted_by' })
  submitter: Employee;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'approved_by' })
  approver: Employee;

  @Column({ name: 'rejected_by', nullable: true })
  rejectedBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'rejected_by' })
  rejecter: Employee;

  @Column({ name: 'project_entry_id' })
  projectEntryId: number;

  @ManyToOne(() => TimesheetProjectEntry)
  @JoinColumn({ name: 'project_entry_id' })
  projectEntry: TimesheetProjectEntry;
}
