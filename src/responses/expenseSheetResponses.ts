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
  billableAmount: number = 0;
  reimbursedAmount: number = 0;
  rejectedAmount: number = 0;
  status: string;
  notes: string;
  isBillable: Boolean;
  submittedAt: Date | null;
  rejectedAt: Date | null;
  approvedAt: Date | null;
  updatedAt: Date | null;
  createdBy: string | null;
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
    this.notes = sheet.notes;
    sheet.expenseSheetExpenses.forEach((expense) => {
      let expenseAmount = parseFloat(
        parseFloat(expense.expense.amount as any).toFixed(2)
      );
      this.amount += expenseAmount;
      this.billableAmount += expense.expense.isBillable ? expenseAmount : 0;
      this.reimbursedAmount += expense.expense.isReimbursed ? expenseAmount : 0;
      this.rejectedAmount += expense.expense.rejectedAt ? expenseAmount : 0;
      this.expenseSheetExpensesIds.push(expense.expense.id);
    });
    let lastExpense =
      sheet.expenseSheetExpenses[sheet.expenseSheetExpenses.length - 1]
        ?.expense;
    this.status = ExpenseSheetStatus.SAVED;

    if (lastExpense.expenseSheetId) {
      if (sheet.id === lastExpense.expenseSheetId) {
        if (lastExpense.rejectedAt !== null)
          this.status = ExpenseSheetStatus.REJECTED;
        else if (lastExpense.approvedAt !== null)
          this.status = ExpenseSheetStatus.APPROVED;
        else if (lastExpense.submittedAt !== null)
          this.status = ExpenseSheetStatus.SUBMITTED;
      } else {
        this.status = ExpenseSheetStatus.REJECTED;
      }
    } else {
      if (lastExpense.entries.length > 0) {
        this.status = ExpenseSheetStatus.REJECTED;
      }
    }

    this.submittedAt = lastExpense.submittedAt ?? null;
    this.rejectedAt = lastExpense.rejectedAt ?? null;
    this.approvedAt = lastExpense.approvedAt ?? null;
    this.updatedAt = lastExpense.updatedAt ?? null;

    this.submittedBy = lastExpense.submitter?.getFullName ?? null;

    this.createdBy = lastExpense.creator?.getFullName ?? null;

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
