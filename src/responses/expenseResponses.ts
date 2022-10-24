import { Expense } from '../entities/expense';

export class ExpenseResponse {
  id: number;

  constructor(expense: Expense) {
    this.id = expense.id;
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
