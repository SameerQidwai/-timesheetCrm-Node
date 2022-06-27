import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
  getManager,
  BeforeRemove,
  BeforeInsert,
} from 'typeorm';
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

  // @BeforeUpdate()
  // async update() {
  //   let leaveRequest = await getManager().findOne(
  //     LeaveRequest,
  //     this.leaveRequestId,
  //     {
  //       relations: ['work'],
  //     }
  //   );
  //   if (!leaveRequest) {
  //     throw new Error('Leave Request not found');
  //   }
  //   if (leaveRequest.work) {
  //     if (!leaveRequest.work.phase) {
  //       throw new Error('Opportunity / Project is closed');
  //     }
  //   }
  // }
  // @BeforeRemove()
  // async delete() {
  //   let leaveRequest = await getManager().findOne(
  //     LeaveRequest,
  //     this.leaveRequestId,
  //     {
  //       relations: ['work'],
  //     }
  //   );
  //   if (!leaveRequest) {
  //     throw new Error('Leave Request not found');
  //   }
  //   if (leaveRequest.work) {
  //     if (!leaveRequest.work.phase) {
  //       throw new Error('Opportunity / Project is closed');
  //     }
  //   }
  // }
}
