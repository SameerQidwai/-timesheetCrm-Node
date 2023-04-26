import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { DBColumn } from './dbColumn';
import {
  DisableConditionTye,
  DisableCondtionDataType,
} from '../constants/constants';

@Entity('db_column_disable_conditions')
export class DBColumnDisableCondition extends Base {
  @Column({ name: 'condition_type' })
  conditionType: DisableConditionTye;

  @Column({ name: 'data_type' })
  dataType: DisableCondtionDataType;

  @Column({ name: 'condition', nullable: true })
  condition: string;

  @Column({ name: 'value', nullable: true })
  value: string;

  @Column({ name: 'metaData', type: 'json', nullable: true })
  metaData: JSON;

  @Column({ name: 'column_id' })
  columnId: Number;

  @ManyToOne(() => DBColumn)
  @JoinColumn({ name: 'column_id' })
  column: DBColumn;
}
