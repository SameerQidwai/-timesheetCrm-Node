import { CashflowReportLabel } from 'src/entities/cashflowReportLabel';
import { CashflowReportLabelValuesInterface } from 'src/utilities/interfaces';

export class CashflowReportLabelResponse {
  title: String;
  values: CashflowReportLabelValuesInterface = {};

  constructor(label: CashflowReportLabel) {
    this.title = label.title;

    if (label.values.length)
      for (let value of label.values) {
        this.values[value.span] = value.value;
      }
  }
}

export class CashflowReportLabelsResponse {
  labels: CashflowReportLabelResponse[] = [];

  constructor(labels: CashflowReportLabel[]) {
    for (let label of labels) {
      this.labels.push(new CashflowReportLabelResponse(label));
    }
  }
}
