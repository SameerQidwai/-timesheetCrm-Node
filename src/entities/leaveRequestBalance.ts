import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { TimeOffType } from './timeOffType';

@Entity('leave_request_balance')
export class LeaveRequestBalance extends Base {
  @Column({ name: 'balance_hours', type: 'float' })
  balanceHours: number;

  @Column({ name: 'type_id' })
  typeId: number;

  @ManyToOne(() => TimeOffType)
  @JoinColumn({ name: 'type_id' })
  type: TimeOffType;

  @Column({ name: 'employee_id' })
  employeeId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
