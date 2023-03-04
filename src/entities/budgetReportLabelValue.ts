import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { BudgetReportLabel } from './budgetReportLabel';

@Entity('budget_report_label_values')
export class BudgetReportLabelValue extends Base {
  @Column({ name: 'span' })
  span: string;

  @Column({ name: 'value' })
  value: number;

  @Column({ name: 'budget_report_label_id', nullable: false })
  budgetReportLabelId: number;

  @ManyToOne(() => BudgetReportLabel)
  @JoinColumn({ name: 'budget_report_label_id' })
  label: BudgetReportLabel;

  // @ManyToOne(() => Employee)
  // @JoinColumn({ name: 'user_id' })
  // employee: Employee;
}
