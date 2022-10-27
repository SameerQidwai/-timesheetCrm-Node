import { ExpenseSheetStatus } from '../constants/constants';
import { ExpenseSheet } from '../entities/expenseSheet';
import { ExpenseResponse, ExpensesResponse } from './expenseResponses';
import { ExpenseSheetExpensesResponse } from './expenseSheetExpenseResponses';

export class ExpenseSheetResponse {
  id: number;
  label: String;
  projectId: number | null;
  projectName: String | null;
  amount: number = 0;
  status: string;
  submittedAt: Date | null;
  expenseSheetExpenses: ExpenseResponse[];

  constructor(sheet: ExpenseSheet) {
    this.id = sheet.id;
    this.label = sheet.label;
    this.projectId = sheet.projectId;
    this.projectName = sheet.project?.title ?? null;
    sheet.expenseSheetExpenses.forEach((expense) => {
      this.amount += parseFloat(
        parseFloat(expense.expense.amount as any).toFixed(2)
      );
    });
    this.status = sheet.expenseSheetExpenses[0]?.expense.rejectedAt
      ? ExpenseSheetStatus.REJECTED
      : sheet.expenseSheetExpenses[0]?.expense.approvedAt
      ? ExpenseSheetStatus.APPROVED
      : ExpenseSheetStatus.SUBMITTED;
    this.submittedAt =
      sheet.expenseSheetExpenses[0]?.expense.submittedAt ?? null;
    this.expenseSheetExpenses = new ExpenseSheetExpensesResponse(
      sheet.expenseSheetExpenses
    ).expenses;
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
