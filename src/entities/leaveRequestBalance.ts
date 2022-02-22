import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { LeaveRequestPolicyLeaveRequestType } from './leaveRequestPolicyLeaveRequestType';
import { LeaveRequestType } from './leaveRequestType';

@Entity('leave_request_balance')
export class LeaveRequestBalance extends Base {
  @Column({ name: 'balance_hours', type: 'float' })
  balanceHours: number;

  @Column({ name: 'carry_forward', type: 'float' })
  carryForward: number;

  @Column({ name: 'used', type: 'float' })
  used: number;

  @Column({ name: 'type_id' })
  typeId: number;

  @ManyToOne(() => LeaveRequestPolicyLeaveRequestType)
  @JoinColumn({ name: 'type_id' })
  type: LeaveRequestPolicyLeaveRequestType;

  @Column({ name: 'employee_id' })
  employeeId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}