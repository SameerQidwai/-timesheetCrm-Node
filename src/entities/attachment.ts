import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Base } from './common/base';
import { File } from './file';
import { EntityType } from '../constants/constants';
import { Expense } from './expense';
import { ExpenseSheet } from './expenseSheet';

@Entity('attachments')
export class Attachment extends Base {
  @Column({ type: 'varchar', length: '20', name: 'target_type' })
  targetType: EntityType;
  @Column({ name: 'file_id', unique: false })
  fileId: number;
  @Column({ name: 'target_id' })
  targetId: number;
  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @ManyToOne(() => File)
  @JoinColumn({ name: 'file_id' })
  file: File;
}
