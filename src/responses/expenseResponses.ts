import { EntityType } from '../constants/constants';
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
  isBillable: Boolean;
  isReimbursed: Boolean;
  isInSheet: Boolean;
  notes: string | null;
  attachments: AttachmentResponse[];

  constructor(expense: Expense) {
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
    this.attachments = new AttachmentsResponse(
      expense.attachments.filter(
        (attachment) => attachment.targetType === EntityType.EXPENSE
      )
    ).attachments;
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
