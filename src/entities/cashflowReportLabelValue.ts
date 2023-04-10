import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { CashflowReportLabel } from './cashflowReportLabel';

@Entity('cashflow_report_label_values')
export class CashflowReportLabelValue extends Base {
  @Column({ name: 'span' })
  span: string;

  @Column({
    name: 'value',
    nullable: true,
    type: 'float',
    precision: 11,
    scale: 2,
  })
  value: number;

  @Column({ name: 'cashflow_report_label_id', nullable: false })
  cashflowReportLabelId: number;

  @ManyToOne(() => CashflowReportLabel)
  @JoinColumn({ name: 'cashflow_report_label_id' })
  label: CashflowReportLabel;

  // @ManyToOne(() => Employee)
  // @JoinColumn({ name: 'user_id' })
  // employee: Employee;
}
