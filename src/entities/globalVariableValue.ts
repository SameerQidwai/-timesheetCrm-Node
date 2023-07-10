import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { GlobalVariableLabel } from './globalVariableLabel';

@Entity('global_variable_values')
export class GlobalVariableValue extends Base {
  @Column({ name: 'global_variable_id' })
  globalVariableId: number;

  @Column({
    name: 'value',
    nullable: true,
    type: 'float',
    precision: 11,
    scale: 4,
  })
  value: number;

  @Column({ name: 'start_date', nullable: true, precision: 3 })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true, precision: 3 })
  endDate: Date;

  @ManyToOne(() => GlobalVariableLabel)
  @JoinColumn({ name: 'global_variable_id' })
  variable: GlobalVariableLabel;
}
