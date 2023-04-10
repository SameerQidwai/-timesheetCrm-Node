import { Entity, Column, BeforeUpdate, getManager, AfterLoad } from 'typeorm';
import { Base } from './common/base';
import { Opportunity } from './opportunity';

@Entity('financial_years')
export class FinancialYear extends Base {
  @Column({ name: 'label' })
  label: string;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @Column({ name: 'closed', default: false })
  closed: Boolean;
}
