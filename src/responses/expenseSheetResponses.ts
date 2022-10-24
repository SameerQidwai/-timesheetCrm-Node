import { ExpenseSheet } from '../entities/expenseSheet';

export class ExpenseSheetResponse {
  id: number;

  constructor(sheet: ExpenseSheet) {
    this.id = sheet.id;
  }
}

export class ExpensesResponse {
  expenses: ExpenseSheetResponse[] = [];

  constructor(expenses: ExpenseSheet[]) {
    expenses.forEach((sheet) => {
      this.expenses.push(new ExpenseSheetResponse(sheet));
    });
  }
}
