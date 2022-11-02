import { ExpenseSheetExpense } from '../entities/expenseSheetExpense';
import { Expense } from '../entities/expense';
import { AttachmentResponse } from './attachmentResponses';

export class ExpenseSheetExpenseResponse {
  id: number;
  expenseTypeId: number;
  expenseTypeName: String;
  date: Date;
  projectId: number | null;
  projectName: String | null;
  amount: number;
  isBillable: Boolean;
  isReimbursed: Boolean;
  isInSheet: Boolean;
  notes: string | null;

  constructor(expense: ExpenseSheetExpense) {
    this.id = expense.id;
    this.expenseTypeId = expense.expense.expenseTypeId;
    this.expenseTypeName = expense.expense.expenseType.label;
    this.date = expense.expense.date;
    this.projectId = expense.expense.projectId;
    this.projectName = expense.expense.project?.title;
    this.amount = expense.expense.amount;
    this.isBillable = expense.expense.isBillable ? true : false;
    this.isReimbursed = expense.expense.isReimbursed ? true : false;
    this.isInSheet = !expense.expense.rejectedAt ? true : false;
    this.notes = expense.expense.notes;
  }
}

export class ExpenseSheetExpensesResponse {
  expenses: ExpenseSheetExpenseResponse[] = [];

  constructor(expenses: ExpenseSheetExpense[]) {
    expenses.forEach((expense) => {
      this.expenses.push(new ExpenseSheetExpenseResponse(expense));
    });
  }
}
