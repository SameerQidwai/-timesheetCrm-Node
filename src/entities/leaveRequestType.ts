import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { LeaveRequestPolicyLeaveRequestType } from './leaveRequestPolicyLeaveRequestType';

@Entity('leave_request_types')
export class LeaveRequestType extends Base {
  @Column({ name: 'label' })
  label: string;

  @OneToMany(
    () => LeaveRequestPolicyLeaveRequestType,
    (leaveRequestPolicyLeaveRequestType) =>
      leaveRequestPolicyLeaveRequestType.leaveRequestType,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      cascade: true,
    }
  )
  leaveRequestPolicyLeaveRequestTypes: LeaveRequestPolicyLeaveRequestType[];
}
