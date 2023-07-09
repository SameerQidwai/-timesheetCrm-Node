import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Base } from './common/base';
import { File } from './file';
import { Opportunity } from './opportunity';

@Entity('purchase_orders')
export class PurchaseOrder extends Base {
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'issue_date', precision: 3 })
  issueDate: Date;

  @Column({ name: 'expiry_date', precision: 3 })
  expiryDate: Date;

  @Column({ name: 'value', type: 'float', precision: 11, scale: 2 })
  value: number;

  @Column({ name: 'comment', nullable: true })
  comment: string;

  @Column({ name: 'expense', type: 'float', precision: 11, scale: 2 })
  expense: number;

  @Column({ name: 'order_no', nullable: true })
  orderNo: string;

  @Column({ name: 'file_id', nullable: true })
  fileId: number;

  @OneToOne(() => File)
  @JoinColumn({ name: 'file_id' })
  file: File;

  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'project_id' })
  project: Opportunity;
}
