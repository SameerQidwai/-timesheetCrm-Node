import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { BudgetReportLabelValue } from './budgetReportLabelValue';

@Entity('budget_report_labels')
export class BudgetReportLabel extends Base {
  @Column({ name: 'label', unique: true })
  title: String;

  @Column({ name: 'is_active', default: true })
  isActive: Boolean; // password for login

  @Column({ name: 'created_by', nullable: false })
  createdBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'created_by' })
  creator: Employee;

  @Column({ name: 'updated_by', nullable: false })
  updatedBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'updated_by' })
  updater: Employee;

  @OneToMany(
    () => BudgetReportLabelValue,
    (forcastReportLabelValue) => forcastReportLabelValue.label,
    {
      cascade: true,
    }
  )
  values: BudgetReportLabelValue[];
}
