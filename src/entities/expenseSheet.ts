import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Attachment } from './attachment';
import { Base } from './common/base';
import { Employee } from './employee';
import { ExpenseSheetExpense } from './expenseSheetExpense';
import { Opportunity } from './opportunity';
import { ExpenseStatus } from '../constants/constants';

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
    (expenseSheetExpense) => expenseSheetExpense.sheet,
    {
      cascade: true,
    }
  )
  expenseSheetExpenses: ExpenseSheetExpense[];

  public get getStatus(): ExpenseStatus {
    let status: ExpenseStatus = ExpenseStatus.SAVED;

    let entry = this.expenseSheetExpenses[0];

    if (entry.submittedAt !== null) {
      status = ExpenseStatus.SUBMITTED;
    }
    if (entry.rejectedAt !== null) {
      status = ExpenseStatus.REJECTED;
    }
    if (entry.approvedAt !== null) {
      status = ExpenseStatus.APPROVED;
    }

    return status;
  }
}
