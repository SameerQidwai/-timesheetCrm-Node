import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { LeaveRequestPolicyLeaveRequestType } from './leaveRequestPolicyLeaveRequestType';

@Entity('leave_request_policies')
export class LeaveRequestPolicy extends Base {
  @Column({ name: 'label' })
  label: string;

  @OneToMany(
    () => LeaveRequestPolicyLeaveRequestType,
    (leaveRequestPolicyLeaveRequestType) =>
      leaveRequestPolicyLeaveRequestType.leaveRequestPolicy,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      cascade: true,
    }
  )
  leaveRequestPolicyLeaveRequestTypes: LeaveRequestPolicyLeaveRequestType[];
}
