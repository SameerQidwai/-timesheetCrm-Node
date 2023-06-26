import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { ExpenseSheet } from './expenseSheet';
import { ExpenseSheetExpense } from './expenseSheetExpense';
import { ExpenseType } from './expenseType';
import { Opportunity } from './opportunity';
import { ExpenseStatus } from '../constants/constants';

@Entity('expenses')
export class Expense extends Base {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    name: 'amount',
    nullable: false,
  })
  amount: number;

  @Column({ name: 'date', type: 'date' })
  date: Date;

  @Column({ name: 'is_reimbursed', default: false })
  isReimbursed: boolean;

  @Column({ name: 'is_billable', default: false })
  isBillable: boolean;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: number | null;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'project_id' })
  project: Opportunity;

  @Column({ name: 'expense_type_id', nullable: false })
  expenseTypeId: number;

  @ManyToOne(() => ExpenseType)
  @JoinColumn({ name: 'expense_type_id' })
  expenseType: ExpenseType;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'created_by' })
  creator: Employee;

  @Column({ name: 'active_expense_sheet_id', nullable: true })
  activeExpenseSheetId: number | null;

  @ManyToOne(() => ExpenseSheet)
  @JoinColumn({ name: 'active_expense_sheet_id' })
  activeExpenseSheet: ExpenseSheet;

  @OneToMany(
    () => ExpenseSheetExpense,
    (expenseSheetExpenses) => expenseSheetExpenses.expense,
    {
      cascade: true,
    }
  )
  entries: ExpenseSheetExpense[];

  public get getStatus(): ExpenseStatus {
    let status: ExpenseStatus = ExpenseStatus.SAVED;

    for (let entry of this.entries) {
      if (entry.submittedAt && entry.rejectedAt === null) {
        status = ExpenseStatus.SUBMITTED;
      }
      if (entry.rejectedAt !== null) {
        status = ExpenseStatus.REJECTED;
      }
      if (entry.approvedAt !== null) {
        status = ExpenseStatus.APPROVED;
      }

      if (
        status === ExpenseStatus.APPROVED ||
        status === ExpenseStatus.SUBMITTED
      ) {
        break;
      }
    }

    return status;
  }
}
