import { Entity, Column, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Base } from './common/base';
import { StandardSkill } from './standardSkill';
import { StandardLevel } from './standardLevel';
import { ContactPerson } from './contactPerson';
import { Expense } from './expense';
import { ExpenseSheet } from './expenseSheet';

@Entity('expense_sheet_expenses')
export class ExpenseSheetExpense extends Base {
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
