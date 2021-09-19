import { Entity, Column } from 'typeorm';
import { Base } from './common/base';

@Entity('global_variable_labels')
export class GlobalVariableLabel extends Base {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'state_id', nullable: true })
  stateId: number;
}
