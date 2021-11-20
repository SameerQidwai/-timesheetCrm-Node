import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Opportunity } from './opportunity';
import { Milestone } from './milestone';
import { Timesheet } from './timesheet';
import { TimesheetEntry } from './timesheetEntry';

@Entity('timesheet_project_entries')
export class TimesheetMilestoneEntry extends Base {
  @Column({ name: 'timesheet_id' })
  timesheetId: number;

  @ManyToOne(() => Timesheet)
  @JoinColumn({ name: 'timesheet_id' })
  timesheet: Timesheet;

  @Column({ name: 'milestone_id' })
  milestoneId: number;

  @ManyToOne(() => Milestone)
  @JoinColumn({ name: 'milestone_id' })
  milestone: Milestone;

  @Column({ name: 'notes', nullable: true })
  notes: string;

  @Column({ name: 'attachment', nullable: true })
  attachment: string;

  @OneToMany(
    () => TimesheetEntry,
    (timesheetEntries) => timesheetEntries.milestoneEntry,
    {
      cascade: true,
    }
  )
  entries: TimesheetEntry[];
}
