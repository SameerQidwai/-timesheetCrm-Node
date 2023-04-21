import { Entity, Column } from 'typeorm';
import { Base } from './common/base';

@Entity('db_column_disable_conditions')
export class DBColumnDisableCondition extends Base {
  @Column({ name: 'type' })
  type: Number;

  @Column({ name: 'column_id' })
  columnId: Number;

  @Column({ name: 'meta', type: 'json' })
  meta: JSON;
}
