import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Opportunity } from './opportunity';
import { Timesheet } from './timesheet';
import { TimesheetEntry } from './timesheetEntry';

@Entity('timesheet_project_entries')
export class TimesheetProjectEntry extends Base {
  @Column({ name: 'timesheet_id' })
  timesheetId: number;

  @ManyToOne(() => Timesheet)
  @JoinColumn({ name: 'timesheet_id' })
  timesheet: Timesheet;

  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'project_id' })
  project: Opportunity;

  @Column({ name: 'notes', nullable: true })
  notes: string;

  @Column({ name: 'attachment' })
  attachment: string;

  @OneToMany(
    () => TimesheetEntry,
    (timesheetEntries) => timesheetEntries.projectEntry,
    {
      cascade: true,
    }
  )
  entries: TimesheetEntry[];
}
