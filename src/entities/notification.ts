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
  title: string;

  @Column({ name: 'content' })
  content: string;

  //0 = ALERT
  //1 = INFO
  //2 = SUCCESS
  //3 = DANGER
  @Column({ name: 'type', default: 1 })
  type: number;

  @Column({ name: 'generated_at', type: 'datetime' })
  generatedAt: Date;

  @Column({ name: 'read_at', nullable: true })
  readAt: Date;

  @Column({ name: 'notifiable_id' })
  notifiableId: number;

  @Column({ name: 'url' })
  url: string;

  @Column({ name: 'silent', default: false })
  silent: Boolean;

  @Column({ name: 'event' })
  event: string;
}
