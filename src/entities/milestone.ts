import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Opportunity } from './opportunity';

@Entity('milestones')
export class Milestone extends Base {
  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: '%completed', default: 0 })
  progress: number;

  @Column({ name: 'is_approved', default: false })
  isApproved: Boolean;

  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'project_id' })
  project: Opportunity;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: number;
}
