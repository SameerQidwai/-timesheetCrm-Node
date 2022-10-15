import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { ExpenseSheet } from './expenseSheet';
import { ExpenseType } from './expenseType';
import { Milestone } from './milestone';

@Entity('expenses')
export class Expense extends Base {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    name: 'amount',
    nullable: false,
  })
  amount: number;

  @Column({ name: 'date', type: 'date' })
  date: Date;

  @Column({ name: 'is_reimbursed', default: false })
  isReimbursed: boolean;

  @Column({ name: 'is_billable', default: false })
  isBillable: boolean;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'file_id', nullable: true })
  fileId: number;

  @ManyToOne(() => ExpenseType)
  @JoinColumn({ name: 'expense_type_id' })
  expenseType: ExpenseType;

  @Column({ type: 'date', name: 'submitted_at', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'date', name: 'approved_at', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'date', name: 'rejected_at', nullable: true })
  rejectedAt: Date | null;

  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'created_by' })
  creator: Employee;

  @Column({ name: 'submitted_by' })
  submittedBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'submitted_by' })
  submitter: Employee;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'approved_by' })
  approver: Employee;

  @Column({ name: 'rejected_by', nullable: true })
  rejectedBy: number | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'rejected_by' })
  rejecter: Employee;

  @Column({ name: 'expense_type_id', nullable: false })
  expenseId: number;
}
