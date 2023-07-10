import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { Opportunity } from './opportunity';
import { ProjectScheduleSegment } from './projectScheduleSegment';
import { Invoice } from './invoice';

@Entity('project_schedules')
export class ProjectSchedule extends Base {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'amount',
    nullable: false,
  })
  amount: number;

  @Column({ name: 'start_date', precision: 3 })
  startDate: Date;

  @Column({ name: 'end_date', precision: 3 })
  endDate: Date;

  @Column({ name: 'payment_date', precision: 3 })
  paymentDate: Date;

  @Column({ name: 'notes', nullable: true })
  notes: string;

  @Column({ name: 'project_id', nullable: false })
  projectId: number;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'project_id' })
  project: Opportunity;

  @OneToMany(() => ProjectScheduleSegment, (segment) => segment.schedule, {
    cascade: true,
  })
  segments: ProjectScheduleSegment[];

  @OneToMany(() => Invoice, (invoice) => invoice.schedule, {
    cascade: true,
  })
  invoices: Invoice[];
}
