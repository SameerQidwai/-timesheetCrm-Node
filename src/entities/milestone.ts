import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Opportunity } from './opportunity';
import { OpportunityResource } from './opportunityResource';
import { TimesheetMilestoneEntry } from './timesheetMilestoneEntry';

@Entity('milestones')
export class Milestone extends Base {
  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true })
  endDate: Date;

  @Column({ name: '%completed', default: 0 })
  progress: number;

  @Column({ name: 'is_approved', default: false })
  isApproved: Boolean;

  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'project_id' })
  project: Opportunity;

  @OneToMany(
    () => OpportunityResource,
    (opportunityResource) => opportunityResource.milestone,
    {
      cascade: true,
    }
  )
  opportunityResources: OpportunityResource[];

  @OneToMany(
    () => TimesheetMilestoneEntry,
    (milestoneEntry) => milestoneEntry.milestone,
    {
      cascade: true,
    }
  )
  timesheetMilestoneEntries: TimesheetMilestoneEntry[];
}
