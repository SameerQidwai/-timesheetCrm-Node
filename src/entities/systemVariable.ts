import { Entity, Column } from 'typeorm';
import { Base } from './common/base';

@Entity('system_variables')
export class SystemVariable extends Base {
  @Column({ name: 'label' })
  label: string;

  @Column({ name: 'value' })
  value: string;

  @Column({ name: 'type' })
  type: string;
}
