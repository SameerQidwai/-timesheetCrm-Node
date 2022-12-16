import { EntityType, ExpenseSheetStatus } from '../constants/constants';
import { Expense } from '../entities/expense';
import { AttachmentResponse, AttachmentsResponse } from './attachmentResponses';

export class ExpenseResponse {
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
  attachments: AttachmentResponse[]

  // constructor(expense: Expense) {
  constructor(expense: any) {
    this.id = expense.id;
    this.expenseTypeId = expense.expenseTypeId;
    this.expenseTypeName = expense.expenseType.label;
    this.date = expense.date;
    this.projectId = expense.projectId;
    this.projectName = expense.project?.title;
    this.amount = expense.amount;
    this.isBillable = expense.isBillable ? true : false;
    this.isReimbursed = expense.isReimbursed ? true : false;
    this.isInSheet =
      expense.entries.length > 0 && !expense.rejectedAt ? true : false;
    this.notes = expense.notes;
    this.status = ExpenseSheetStatus.SAVED;
    if (expense.rejectedAt !== null)
      this.status = ExpenseSheetStatus.REJECTED;
    else if (expense.approvedAt !== null)
      this.status = ExpenseSheetStatus.APPROVED;
    else if (expense.submittedAt !== null)
      this.status = ExpenseSheetStatus.SUBMITTED;
    this.attachments = new AttachmentsResponse(expense.attachments).attachments
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
