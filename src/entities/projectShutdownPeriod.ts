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
import { Opportunity } from './opportunity';

@Entity('project_shutdown_periods')
export class ProjectShutdownPeriod extends Base {
  @Column({ name: 'start_date', precision: 3 })
  startDate: Date;

  @Column({ name: 'end_date', precision: 3 })
  endDate: Date;

  @Column({ name: 'project_id', unique: false })
  projectId: number;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'project_id' })
  project: Opportunity;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;
}
