import { ExpenseSheetExpense } from 'src/entities/expenseSheetExpense';
import { ExpenseSheet } from '../entities/expenseSheet';

export class ExpenseSheetResponse {
  id: number;
  label: String;
  projectName: String | null;
  amount: number = 0;
  status: string;
  submittedAt: Date | null;
  expenseSheetExpenses: ExpenseSheetExpense[];

  constructor(sheet: ExpenseSheet) {
    this.id = sheet.id;
    this.label = sheet.label;
    this.projectName = sheet.project?.title;
    sheet.expenseSheetExpenses.forEach((expense) => {
      this.amount += expense.expense.amount;
    });
    this.status = sheet.expenseSheetExpenses[0]?.expense.submittedAt
      ? 'Submitted'
      : 'Saved' ?? 'Saved';
    this.submittedAt =
      sheet.expenseSheetExpenses[0]?.expense.submittedAt ?? null;
    this.expenseSheetExpenses = sheet.expenseSheetExpenses;
  }
}

export class ExpenseSheetsResponse {
  sheets: ExpenseSheetResponse[] = [];

  constructor(sheets: ExpenseSheet[]) {
    sheets.forEach((sheet) => {
      this.sheets.push(new ExpenseSheetResponse(sheet));
    });
  }
}
