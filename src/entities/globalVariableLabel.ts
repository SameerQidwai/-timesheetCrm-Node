import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { GlobalVariableValue } from './globalVariableValue';

@Entity('global_variable_labels')
export class GlobalVariableLabel extends Base {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'state_id', nullable: true })
  stateId: number;

  @OneToMany(
    () => GlobalVariableValue,
    (variableValues) => variableValues.variable,
    {
      cascade: true,
    }
  )
  values: GlobalVariableValue[];
}
