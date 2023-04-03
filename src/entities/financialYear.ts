import { Entity, Column } from 'typeorm';
import { Base } from './common/base';

@Entity('financial_years')
export class FinancialYear extends Base {
  @Column({ name: 'label' })
  label: string;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @Column({ name: 'closed' })
  closed: Boolean;
}
