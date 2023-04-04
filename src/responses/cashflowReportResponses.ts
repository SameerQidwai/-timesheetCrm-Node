import { CashflowReportLabel } from 'src/entities/cashflowReportLabel';
import { CashflowReportInterface } from 'src/utilities/interfaces';

export class CashflowReportResponse {
  labels: CashflowReportInterface = {};

  constructor(labels: CashflowReportLabel[]) {
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
