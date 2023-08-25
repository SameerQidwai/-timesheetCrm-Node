export interface ForecastReportLabelValuesInterface {
  [key: string]: number;
}

export interface ForecastReportInterface {
  [key: string]: {
    [key: string]: number | string;
  };
}

export interface BudgetReportLabelValuesInterface {
  [key: string]: number;
}

export interface BudgetReportInterface {
  [key: string]: {
    [key: string]: number | string;
  };
}

export interface CashflowReportLabelValuesInterface {
  [key: string]: number;
}

export interface CashflowReportInterface {
  [key: string]: {
    [key: string]: number | string;
  };
}

export interface StandardMailInterface {
  fileName: string;
  html: string;
  subject: string;
  template: HandlebarsTemplateDelegate;
  content: string;
  replacements: {};
}
export interface StandardMailUserInterface {
  username: string | String;
  email: string | String;
}

export interface InvoicesInterface {
  id: number;
  invoiceId: string;
  type: string;
  status: string;
  organization: {
    xeroId: string;
    name: string;
    id: number;
  };
  purchaseOrder: {
    id: number;
    orderNo: String,
  }
  issueDate: Date | null;
  dueDate: Date | null;
  invoiceNumber: string;
  reference: string;
  project: {
    id: number;
    name: String,
  },
}