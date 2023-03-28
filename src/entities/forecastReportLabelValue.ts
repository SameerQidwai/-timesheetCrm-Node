import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { ForecastReportLabel } from './forecastReportLabel';

@Entity('forecast_report_label_values')
export class ForecastReportLabelValue extends Base {
  @Column({ name: 'span' })
  span: string;

  @Column({ name: 'value', nullable: true })
  value: number;

  @Column({ name: 'forecast_report_label_id', nullable: false })
  forecastReportLabelId: number;

  @ManyToOne(() => ForecastReportLabel)
  @JoinColumn({ name: 'forecast_report_label_id' })
  label: ForecastReportLabel;

  // @ManyToOne(() => Employee)
  // @JoinColumn({ name: 'user_id' })
  // employee: Employee;
}
