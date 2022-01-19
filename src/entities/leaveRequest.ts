import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './common/base';
import { Opportunity } from './opportunity';
import { Employee } from './employee';
import { TimeOffType } from './timeOffType';
import { LeaveRequestEntry } from './leaveRequestEntry';

@Entity('leave_requests')
export class LeaveRequest extends Base {
  @Column({ name: 'desc' })
  desc: string;

  @Column({ type: 'date', name: 'submitted_at', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'date', name: 'approved_at', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'date', name: 'rejected_at', nullable: true })
  rejectedAt: Date | null;

  @Column({ name: 'submitted_by', nullable: true })
  submittedBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'submitted_by' })
  submitter: Employee;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'approved_by' })
  approver: Employee;

  @Column({ name: 'rejected_by', nullable: true })
  rejectedBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'rejected_by' })
  rejecter: Employee;

  @Column({ name: 'type_id' })
  typeId: number;

  @ManyToOne(() => TimeOffType)
  @JoinColumn({ name: 'type_id' })
  type: TimeOffType;

  @Column({ name: 'work_id' })
  workId: number;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'work_id' })
  work: Opportunity;

  @OneToMany(
    () => LeaveRequestEntry,
    (leaveRequestEntries) => leaveRequestEntries.leaveRequest,
    {
      cascade: true,
    }
  )
  entries: LeaveRequestEntry[];
}
