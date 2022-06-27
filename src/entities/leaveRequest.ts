import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  getManager,
} from 'typeorm';
import { Base } from './common/base';
import { Opportunity } from './opportunity';
import { Employee } from './employee';
import { LeaveRequestPolicyLeaveRequestType } from './leaveRequestPolicyLeaveRequestType';
import { LeaveRequestEntry } from './leaveRequestEntry';
import { LeaveRequestStatus } from '../constants/constants';

@Entity('leave_requests')
export class LeaveRequest extends Base {
  @Column({ name: 'desc', nullable: true })
  desc: string;

  @Column({ type: 'date', name: 'submitted_at', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'date', name: 'approved_at', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'date', name: 'rejected_at', nullable: true })
  rejectedAt: Date | null;

  @Column({ type: 'text', name: 'note', nullable: true })
  note: string;

  @Column({ name: 'employee_id' })
  employeeId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'submitted_by' })
  submittedBy: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'submitted_by' })
  submitter: Employee;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'approved_by' })
  approver: Employee;

  @Column({ name: 'rejected_by', nullable: true })
  rejectedBy: number | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'rejected_by' })
  rejecter: Employee;

  @Column({ name: 'type_id', nullable: true })
  typeId: number | null;

  @ManyToOne(() => LeaveRequestPolicyLeaveRequestType)
  @JoinColumn({ name: 'type_id' })
  type: LeaveRequestPolicyLeaveRequestType;

  @Column({ name: 'work_id', nullable: true })
  workId: number | null;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'work_id' })
  work: Opportunity | null;

  @OneToMany(
    () => LeaveRequestEntry,
    (leaveRequestEntries) => leaveRequestEntries.leaveRequest,
    {
      cascade: true,
    }
  )
  entries: LeaveRequestEntry[];

  public get getEntriesDetails(): any {
    let startDate,
      endDate,
      totalHours = 0;
    this.entries.forEach((entry, index) => {
      index == 0 ? (startDate = entry.date) : '';
      index == this.entries.length - 1 ? (endDate = entry.date) : '';
      totalHours += parseFloat((entry.hours as any).toFixed(2));
    });

    return {
      startDate: startDate,
      endDate: endDate,
      totalHours: totalHours,
    };
  }

  public get getStatus(): LeaveRequestStatus {
    return this.rejectedAt
      ? LeaveRequestStatus.REJECTED
      : this.approvedAt
      ? LeaveRequestStatus.APPROVED
      : LeaveRequestStatus.SUBMITTED;
  }

  @BeforeInsert()
  async insert() {
    if (this.workId) {
      let work = await getManager().findOne(Opportunity, this.workId);
      if (work) {
        if (!work.phase) {
          throw new Error('Opportunity / Project is closed');
        }
      }
    }
  }
}
