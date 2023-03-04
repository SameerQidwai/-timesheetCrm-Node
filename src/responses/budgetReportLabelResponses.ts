import { BudgetReportLabel } from 'src/entities/budgetReportLabel';
import { BudgetReportLabelValuesInterface } from 'src/utilities/interfaces';

export class BudgetReportLabelResponse {
  title: String;
  values: BudgetReportLabelValuesInterface = {};

  constructor(label: BudgetReportLabel) {
    this.title = label.title;

    if (label.values.length)
      for (let value of label.values) {
        this.values[value.span] = value.value;
      }
  }
}

export class BudgetReportLabelsResponse {
  labels: BudgetReportLabelResponse[] = [];

  constructor(labels: BudgetReportLabel[]) {
    for (let label of labels) {
      this.labels.push(new BudgetReportLabelResponse(label));
    }
  }
}
