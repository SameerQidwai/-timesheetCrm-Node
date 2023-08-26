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

@Entity('notifications')
export class Notification extends Base {
  @Column({ name: 'title' })
  title: String;

  @Column({ name: 'content' })
  content: string;

  @Column({ name: 'type' })
  type: number;

  @Column({ name: 'read_at' })
  readAt: Date;

  @Column({ name: 'notifiable_id' })
  notifiableId: number;

  @Column({ name: 'url' })
  url: string;

  @Column({ name: 'event' })
  event: string;
}
