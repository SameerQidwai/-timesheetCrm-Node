import { ExpenseSheetExpense } from '../entities/expenseSheetExpense';
import { Expense } from '../entities/expense';
import { AttachmentResponse, AttachmentsResponse } from './attachmentResponses';
import { ExpenseSheetStatus } from '../constants/constants';
import { Attachment } from '../entities/attachment';

export class ExpenseSheetExpenseResponse {
  id: number;
  expenseTypeId: number;
  expenseTypeName: String;
  date: Date;
  projectId: number | null;
  projectName: String | null;
  amount: number;
  status: string;
  isBillable: Boolean;
  isReimbursed: Boolean;
  isInSheet: Boolean;
  notes: string | null;
  attachments: AttachmentResponse[];

  constructor(expense: ExpenseSheetExpense & { attachments?: Attachment[] }) {
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
    this.status = ExpenseSheetStatus.SAVED;
    if (expense.expense.rejectedAt !== null)
      this.status = ExpenseSheetStatus.REJECTED;
    else if (expense.expense.approvedAt !== null)
      this.status = ExpenseSheetStatus.APPROVED;
    else if (expense.expense.submittedAt !== null)
      this.status = ExpenseSheetStatus.SUBMITTED;
    this.attachments = expense.attachments?.length
      ? new AttachmentsResponse(expense.attachments).attachments
      : [];
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
