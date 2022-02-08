import { LeaveRequestTriggerFrequency } from '../constants/constants';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { LeaveRequestPolicy } from './leaveRequestPolicy';
import { LeaveRequestType } from './leaveRequestType';

@Entity('leave_request_policy_leave_request_types')
export class LeaveRequestPolicyLeaveRequestType extends Base {
  @Column({ name: 'leave_request_policy_id' })
  leaveRequestPolicyId: number;

  @Column({ name: 'leave_request_type_id' })
  leaveRequestTypeId: number;

  @Column({ type: 'float', name: 'earn_hours' })
  earnHours: number;

  @Column({
    type: 'enum',
    enum: LeaveRequestTriggerFrequency,
    name: 'earn_every',
  })
  earnEvery: LeaveRequestTriggerFrequency;

  @Column({ type: 'float', name: 'reset_hours' })
  resetHours: number;

  @Column({
    type: 'enum',
    enum: LeaveRequestTriggerFrequency,
    name: 'reset_every',
  })
  resetEvery: LeaveRequestTriggerFrequency;

  @Column('float')
  threshold: number;

  @Column({ type: 'float', name: 'minimum_balance_required' })
  minimumBalanceRequired: number;

  @Column({ type: 'float', name: 'minimum_balance' })
  minimumBalance: number;

  @Column({ type: 'boolean', name: 'include_off_days' })
  includeOffDays: boolean;

  @ManyToOne(() => LeaveRequestPolicy)
  @JoinColumn({ name: 'leave_request_policy_id' })
  leaveRequestPolicy: LeaveRequestPolicy;

  @ManyToOne(() => LeaveRequestType)
  @JoinColumn({ name: 'leave_request_type_id' })
  leaveRequestType: LeaveRequestType;
}
