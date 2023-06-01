import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { DBColumn } from './dbColumn';
import {
  DisableConditionType,
  DisableCondtionDataType,
} from '../constants/constants';

@Entity('db_column_disable_conditions')
export class DBColumnDisableCondition extends Base {
  @Column({ name: 'column_id' })
  columnId: Number;

  @ManyToOne(() => DBColumn)
  @JoinColumn({ name: 'column_id' })
  column: DBColumn;

  @Column({ name: 'column_data_type' })
  columnDataType: DisableCondtionDataType;

  @Column({ name: 'condition_column_id', nullable: true })
  conditionColumnId: Number;

  @ManyToOne(() => DBColumn)
  @JoinColumn({ name: 'condition_column_id' })
  conditionColumn: DBColumn;

  @Column({ name: 'condition_column_data_type' })
  conditionColumnDataType: DisableCondtionDataType;

  @Column({ name: 'condition_type' })
  conditionType: DisableConditionType;

  @Column({ name: 'condition', nullable: true })
  condition: string;

  @Column({ name: 'value', nullable: true })
  value: string;

  @Column({ name: 'metaData', type: 'json', nullable: true })
  metaData: JSON;
}
