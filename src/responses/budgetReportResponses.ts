import { BudgetReportLabel } from 'src/entities/budgetReportLabel';
import { BudgetReportInterface } from 'src/utilities/interfaces';

export class BudgetReportResponse {
  labels: BudgetReportInterface = {};

  constructor(labels: BudgetReportLabel[]) {
    for (let label of labels) {
      let stringLabel = label.title as string;
      this.labels[stringLabel] = {};
      if (label.values.length)
        for (let value of label.values) {
          this.labels[stringLabel][value.span] = value.value;
        }
    }
  }
}
