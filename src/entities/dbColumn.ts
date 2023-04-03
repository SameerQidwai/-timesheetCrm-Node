import { Entity, Column } from 'typeorm';
import { Base } from './common/base';

@Entity('db_columns')
export class DBColumn extends Base {
  @Column({ name: 'db_name' })
  dbName: string;

  @Column({ name: 'typeorm_name' })
  typeorm_name: string;

  @Column({ name: 'disabled' })
  disabled: Boolean;

  @Column({ name: 'batch' })
  batch: Number;

  @Column({ name: 'disable_conditions', type: 'json' })
  disableConditions: JSON;
}
