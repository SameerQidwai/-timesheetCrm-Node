import { Entity, Column } from 'typeorm';
import { Base } from './common/base';

@Entity('global_variable_values')
export class GlobalVariableValue extends Base {
  @Column({ name: 'global_variable_id' })
  globalVariableId: number;

  @Column({ name: 'value' })
  value: number;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;
}
