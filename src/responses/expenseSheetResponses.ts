import { EntityType, ExpenseSheetStatus } from '../constants/constants';
import { ExpenseSheet } from '../entities/expenseSheet';
import { AttachmentResponse, AttachmentsResponse } from './attachmentResponses';
import { ExpenseResponse, ExpensesResponse } from './expenseResponses';
import { ExpenseSheetExpensesResponse } from './expenseSheetExpenseResponses';

export class ExpenseSheetResponse {
  id: number;
  label: String;
  projectId: number | null;
  projectName: String | null;
  amount: number = 0;
  status: string;
  notes: string;
  isBillable: Boolean;
  submittedAt: Date | null;
  submittedBy: string | null;
  attachments: AttachmentResponse[];
  expenseSheetExpensesIds: number[] = [];
  expenseSheetExpenses: ExpenseResponse[];

  constructor(sheet: ExpenseSheet) {
    this.id = sheet.id;
    this.label = sheet.label;
    this.projectId = sheet.projectId;
    this.isBillable = sheet.isBillable;
    this.projectName = sheet.project?.title ?? null;
    this.notes = sheet.notes
    sheet.expenseSheetExpenses.forEach((expense) => {
      this.amount += parseFloat(
        parseFloat(expense.expense.amount as any).toFixed(2)
      );
      this.expenseSheetExpensesIds.push(expense.expense.id);
    });
    let firstExpense = sheet.expenseSheetExpenses[0]?.expense;
    this.status = ExpenseSheetStatus.SAVED;
    if (firstExpense.rejectedAt !== null)
      this.status = ExpenseSheetStatus.REJECTED;
    else if (firstExpense.approvedAt !== null)
      this.status = ExpenseSheetStatus.APPROVED;
    else if (firstExpense.submittedAt !== null)
      this.status = ExpenseSheetStatus.SUBMITTED;

    this.submittedAt =
      sheet.expenseSheetExpenses[0]?.expense.submittedAt ?? null;

    this.submittedBy =
      sheet.expenseSheetExpenses[0]?.expense.submitter?.getFullName ?? null;

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
