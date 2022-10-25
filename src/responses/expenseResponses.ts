import { Expense } from '../entities/expense';

export class ExpenseResponse {
  id: number;
  expenseTypeName: String;
  date: Date;
  projectName: String | null;
  amount: number;
  isBillable: Boolean;
  isReimbursed: Boolean;
  notes: string | null;

  constructor(expense: Expense) {
    this.id = expense.id;
    this.expenseTypeName = expense.expenseType.label;
    this.date = expense.date;
    this.projectName = expense.project?.title;
    this.amount = expense.amount;
    this.isBillable = expense.isBillable ? true : false;
    this.isReimbursed = expense.isReimbursed ? true : false;
    this.notes = expense.notes;
  }
}

export class ExpensesResponse {
  expenses: ExpenseResponse[] = [];

  constructor(expenses: Expense[]) {
    expenses.forEach((expense) => {
      this.expenses.push(new ExpenseResponse(expense));
    });
  }
}
