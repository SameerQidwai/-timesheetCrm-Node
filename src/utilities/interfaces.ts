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
