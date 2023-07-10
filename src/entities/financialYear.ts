import { Entity, Column, BeforeUpdate, getManager, AfterLoad } from 'typeorm';
import { Base } from './common/base';
import { Opportunity } from './opportunity';

@Entity('financial_years')
export class FinancialYear extends Base {
  @Column({ name: 'label' })
  label: String;

  @Column({ name: 'start_date', precision: 3 })
  startDate: Date;

  @Column({ name: 'end_date', precision: 3 })
  endDate: Date;

  @Column({ name: 'closing', default: false })
  closing: Boolean;

  @Column({ name: 'closed', default: false })
  closed: Boolean;

  @Column({ name: 'closed_at', nullable: true, precision: 3 })
  closedAt: Date;

  @Column({ name: 'closed_by', nullable: true })
  closedBy: number;
}
