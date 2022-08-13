import { Entity, Column } from 'typeorm';
import { Base } from './common/base';

@Entity('expense_types')
export class ExpenseType extends Base {
  @Column({ type: 'varchar', length: '255', name: 'label' })
  label: String;
}
