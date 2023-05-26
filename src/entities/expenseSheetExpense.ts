import { Entity, Column, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Base } from './common/base';
import { Expense } from './expense';
import { ExpenseSheet } from './expenseSheet';
import { Employee } from './employee';

@Entity('expense_sheet_expenses')
export class ExpenseSheetExpense extends Base {
  @Column({ type: 'date', name: 'submitted_at', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'date', name: 'approved_at', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'date', name: 'rejected_at', nullable: true })
  rejectedAt: Date | null;

  @Column({ name: 'submitted_by', nullable: true })
  submittedBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'submitted_by' })
  submitter: Employee | null;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'approved_by' })
  approver: Employee | null;

  @Column({ name: 'rejected_by', nullable: true })
  rejectedBy: number | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'rejected_by' })
  rejecter: Employee | null;

  @Column({ name: 'expense_id', nullable: false })
  expenseId: number;

  @ManyToOne(() => Expense)
  @JoinColumn({ name: 'expense_id' })
  expense: Expense;

  @Column({ name: 'sheet_id', nullable: false })
  sheetId: number;

  @ManyToOne(() => ExpenseSheet)
  @JoinColumn({ name: 'sheet_id' })
  sheet: ExpenseSheet;
}
