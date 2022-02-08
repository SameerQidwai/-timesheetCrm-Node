import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { LeaveRequest } from './leaveRequest';

@Entity('leave_request_entries')
export class LeaveRequestEntry extends Base {
  @Column({ name: 'date' })
  date: Date;

  @Column({ name: 'hours', type: 'float' })
  hours: number;

  @Column({ name: 'leave_request_id' })
  leaveRequestId: number;

  @ManyToOne(() => LeaveRequest)
  @JoinColumn({ name: 'leave_request_id' })
  leaveRequest: LeaveRequest;
}
