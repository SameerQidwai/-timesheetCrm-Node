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
