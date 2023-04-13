import { ForecastReportLabel } from 'src/entities/forecastReportLabel';
import { ForecastReportInterface } from 'src/utilities/interfaces';

export class ForecastReportResponse {
  labels: ForecastReportInterface = {};

  constructor(labels: ForecastReportLabel[]) {
    for (let label of labels) {
      let stringLabel = label.title as string;
      this.labels[stringLabel] = {};
      this.labels[stringLabel]['description'] = label.description;
      if (label.values.length)
        for (let value of label.values) {
          this.labels[stringLabel][value.span] = value.value;
        }
    }
  }
}
