import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { Opportunity } from './opportunity';

@Entity('purchase_orders')
export class PurchaseOrder extends Base {
  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'issue_date' })
  issueDate: Date;

  @Column({ name: 'expiry_date' })
  expiryDate: Date;

  @Column({ name: 'value' })
  value: number;

  @Column({ name: 'comment' })
  comment: string;

  @Column({ name: 'expense' })
  expense: number;

  @Column({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'project_id' })
  project: Opportunity;
}
