import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Attachment } from './attachment';
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

  @Column({ name: 'is_billable', default: false })
  isBillable: boolean;

  @Column({ name: 'notes', nullable: true })
  notes: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: number;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'project_id' })
  project: Opportunity;

  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'created_by' })
  creator: Employee;

  @OneToMany(
    () => ExpenseSheetExpense,
    (expenseSheetExpenses) => expenseSheetExpenses.sheet,
    {
      cascade: true,
    }
  )
  expenseSheetExpenses: ExpenseSheetExpense[];

  @OneToMany(() => Attachment, (attachments) => attachments.entity, {
    cascade: true,
  })
  attachments: Attachment[];
}
