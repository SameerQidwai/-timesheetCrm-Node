import { Entity, Column } from 'typeorm';
import { Base } from './common/base';
import { SystemVariableValueType } from '../constants/constants';

@Entity('system_variables')
export class SystemVariable extends Base {
  @Column({ name: 'label' })
  label: string;

  @Column({ name: 'value' })
  value: string;

  @Column({ name: 'type' })
  type: SystemVariableValueType;
}
