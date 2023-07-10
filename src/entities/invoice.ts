import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { Organization } from './organization';
import { Opportunity } from './opportunity';
import { ProjectSchedule } from './projectSchedule';

@Entity('invoices')
export class Invoice extends Base {
  @Column({ name: 'invoiceId' })
  invoiceId: string;

  @Column({ name: 'start_date', nullable: true, precision: 3 })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true, precision: 3 })
  endDate: Date;

  @Column({ name: 'reference', default: '', type: 'text' })
  reference: string;

  @Column({ name: 'project_id' })
  projectId: number;

  @Column({ name: 'schedule_id', nullable: true })
  scheduleId: number;

  @Column({ name: 'organization_id' })
  organizationId: number;

  @ManyToOne(() => ProjectSchedule)
  @JoinColumn({ name: 'schedule_id' })
  schedule: ProjectSchedule;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'project_id' })
  project: Opportunity;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;
}
