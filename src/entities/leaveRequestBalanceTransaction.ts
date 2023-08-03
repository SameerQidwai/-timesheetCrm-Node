import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { LeaveRequestBalance } from './leaveRequestBalance';

@Entity('leave_request_balance_transactions')
export class LeaveRequestBalanceTransaction extends Base {
  @Column({ nullable: true, type: 'simple-json' })
  previousState: LeaveRequestBalance;

  @Column({ type: 'simple-json' })
  newState: LeaveRequestBalance;

  @Column({ type: 'simple-array', nullable: true })
  delta: Array<string>;
  // delta: Partial<LeaveRequestBalance>;

  @Column({ name: 'employee_id' })
  employeeId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
