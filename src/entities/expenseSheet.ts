import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { ExpenseSheetExpense } from './expenseSheetExpense';
import { ExpenseType } from './expenseType';
import { Milestone } from './milestone';
import { Opportunity } from './opportunity';

@Entity('expense_sheets')
export class ExpenseSheet extends Base {
  @Column({ name: 'label' })
  label: String;

  @Column({ name: 'project_id', nullable: true })
  projectId: number;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'project_id' })
  project: Opportunity;

  @OneToMany(
    () => ExpenseSheetExpense,
    (expenseSheetExpenses) => expenseSheetExpenses.sheet,
    {
      cascade: true,
    }
  )
  expenseSheetExpenses: ExpenseSheetExpense[];

  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'created_by' })
  creator: Employee;
}
