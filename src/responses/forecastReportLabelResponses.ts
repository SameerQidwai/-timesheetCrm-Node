import { ForecastReportLabel } from 'src/entities/forecastReportLabel';
import { ForecastReportLabelValuesInterface } from 'src/utilities/interfaces';
import { Attachment } from '../entities/attachment';

export class ForecastReportLabelResponse {
  title: String;
  values: ForecastReportLabelValuesInterface = {};

  constructor(label: ForecastReportLabel) {
    this.title = label.title;

    if (label.values.length)
      for (let value of label.values) {
        this.values[value.span] = value.value;
      }
  }
}

export class ForecastReportLabelsResponse {
  labels: ForecastReportLabelResponse[] = [];

  constructor(labels: ForecastReportLabel[]) {
    for (let label of labels) {
      this.labels.push(new ForecastReportLabelResponse(label));
    }
  }
}
