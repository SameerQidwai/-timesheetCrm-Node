import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  BeforeRemove,
  getManager,
} from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { TimesheetMilestoneEntry } from './timesheetMilestoneEntry';

@Entity('timesheet_entries')
export class TimesheetEntry extends Base {
  @Column({ name: 'date' })
  date: string;

  @Column({ name: 'start_time' })
  startTime: string;

  @Column({ name: 'end_time' })
  endTime: string;

  @Column({ name: 'break_hours', type: 'float' })
  breakHours: number;

  @Column({ name: 'actual_hours', type: 'float' })
  hours: number;

  @Column({ name: 'notes', nullable: true })
  notes: string;

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt: Date;

  @Column({ type: 'date', name: 'approved_at', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'date', name: 'rejected_at', nullable: true })
  rejectedAt: Date | null;

  @Column({ name: 'submitted_by', nullable: true })
  submittedBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'submitted_by' })
  submitter: Employee;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'approved_by' })
  approver: Employee;

  @Column({ name: 'rejected_by', nullable: true })
  rejectedBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'rejected_by' })
  rejecter: Employee;

  @Column({ name: 'milestone_entry_id' })
  milestoneEntryId: number;

  @ManyToOne(() => TimesheetMilestoneEntry)
  @JoinColumn({ name: 'milestone_entry_id' })
  milestoneEntry: TimesheetMilestoneEntry;

  // @BeforeInsert()
  // async insert() {
  //   let milestoneEntry = await getManager().findOne(
  //     TimesheetMilestoneEntry,
  //     this.milestoneEntryId,
  //     {
  //       relations: ['milestone', 'milestone.project'],
  //     }
  //   );

  //   if (!milestoneEntry) {
  //     throw new Error('Milestone not found');
  //   }
  //   if (!milestoneEntry.milestone.project.phase) {
  //     throw new Error('Opportunity / Project is closed');
  //   }
  // }
  // @BeforeUpdate()
  // async update() {
  //   let milestoneEntry = await getManager().findOne(
  //     TimesheetMilestoneEntry,
  //     this.milestoneEntryId,
  //     {
  //       relations: ['milestone', 'milestone.project'],
  //     }
  //   );
  //   if (!milestoneEntry) {
  //     throw new Error('Milestone not found');
  //   }
  //   if (!milestoneEntry.milestone.project.phase) {
  //     throw new Error('Opportunity / Project is closed');
  //   }
  // }
  // @BeforeRemove()
  // async delete() {
  //   let milestoneEntry = await getManager().findOne(
  //     TimesheetMilestoneEntry,
  //     this.milestoneEntryId,
  //     {
  //       relations: ['milestone', 'milestone.project'],
  //     }
  //   );
  //   if (!milestoneEntry) {
  //     throw new Error('Milestone not found');
  //   }
  //   if (!milestoneEntry.milestone.project.phase) {
  //     throw new Error('Opportunity / Project is closed');
  //   }
  // }
}
