import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { DBColumnDisableCondition } from './dbColumnDisableCondition';

@Entity('db_columns')
export class DBColumn extends Base {
  @Column({ name: 'db_name' })
  dbName: string;

  @Column({ name: 'typeorm_name' })
  typeormName: string;

  @Column({ name: 'table_name' })
  tableName: string;

  @Column({ name: 'entity_name' })
  entityName: string;

  @Column({ name: 'disabled', default: false })
  disabled: Boolean;

  @Column({ name: 'batch' })
  batch: Number;

  @OneToMany(
    () => DBColumnDisableCondition,
    (disableCondition) => disableCondition.column,
    {
      cascade: true,
    }
  )
  disableConditions: DBColumnDisableCondition[];
}
