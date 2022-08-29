import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { ExpenseType } from './expenseType';
import { Milestone } from './milestone';

@Entity('milestone_expenses')
export class MilestoneExpense extends Base {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    name: 'buying_rate',
    nullable: true,
  })
  buyingRate: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    name: 'selling_rate',
    nullable: true,
  })
  sellingRate: number;

  @Column({ name: 'expense_id', nullable: false })
  expenseId: number;

  @ManyToOne(() => ExpenseType)
  @JoinColumn({ name: 'expense_id' })
  expenseType: ExpenseType;

  @Column({ name: 'milestone_id', nullable: false })
  milestoneId: number;

  @ManyToOne(() => Milestone)
  @JoinColumn({ name: 'milestone_id' })
  milestone: Milestone;
}
