import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { LeaveRequest } from './leaveRequest';

@Entity('leave_request_entries', {
  orderBy: {
    date: 'ASC',
  },
})
export class LeaveRequestEntry extends Base {
  @Column({ name: 'date', type: 'date' })
  date: Date;

  @Column({ name: 'hours', type: 'float' })
  hours: number;

  @Column({ name: 'leave_request_id' })
  leaveRequestId: number;

  @ManyToOne(() => LeaveRequest)
  @JoinColumn({ name: 'leave_request_id' })
  leaveRequest: LeaveRequest;
}
