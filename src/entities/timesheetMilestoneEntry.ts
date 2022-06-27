import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeUpdate,
  BeforeInsert,
  BeforeRemove,
  getManager,
} from 'typeorm';
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

  @Column({ name: 'action_notes', nullable: true })
  actionNotes: string;

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

  public get getEntriesDetails(): any {
    let startDate, endDate;
    this.entries.forEach((entry, index) => {
      index == 0 ? (startDate = entry.date) : '';
      index == this.entries.length - 1 ? (endDate = entry.date) : '';
    });

    return {
      startDate: startDate,
      endDate: endDate,
    };
  }

  // @BeforeInsert()
  // async insert() {
  //   let milestone = await getManager().findOne(Milestone, this.milestoneId, {
  //     relations: ['project'],
  //   });
  //   console.log(
  //     '🚀 ~ file: timesheetMilestoneEntry.ts ~ line 70 ~ TimesheetMilestoneEntry ~ milestone ~ milestone',
  //     milestone
  //   );
  //   if (!milestone) {
  //     throw new Error('Milestone not found');
  //   }
  //   if (!milestone.project.phase) {
  //     throw new Error('Opportunity / Project is closed');
  //   }
  // }
  // @BeforeUpdate()
  // async update() {
  //   let milestone = await getManager().findOne(Milestone, this.milestoneId, {
  //     relations: ['project'],
  //   });
  //   if (!milestone) {
  //     throw new Error('Milestone not found');
  //   }
  //   if (!milestone.project.phase) {
  //     throw new Error('Opportunity / Project is closed');
  //   }
  // }
  // @BeforeRemove()
  // async delete() {
  //   let milestone = await getManager().findOne(Milestone, this.milestoneId, {
  //     relations: ['project'],
  //   });
  //   if (!milestone) {
  //     throw new Error('Milestone not found');
  //   }
  //   if (!milestone.project.phase) {
  //     throw new Error('Opportunity / Project is closed');
  //   }
  // }
}
