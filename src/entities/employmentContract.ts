import { EmploymentType, Frequency } from '../constants/constants';
import { Entity, Column, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';
import { File } from './file';
import { LeaveRequestPolicy } from './leaveRequestPolicy';
import moment from 'moment-timezone';

@Entity('employment_contracts')
export class EmploymentContract extends Base {
  @Column({ name: 'payslip_email', nullable: true })
  payslipEmail: String;

  @Column({ name: 'comments', nullable: true })
  comments: String;

  @Column({
    type: 'enum',
    enum: Frequency,
    name: 'pay_frequency',
  })
  payFrequency: Frequency;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    name: 'type',
  })
  type: EmploymentType;

  @Column({
    name: 'no_of_hours',
    nullable: true,
    type: 'float',
    precision: 11,
    scale: 2,
  })
  noOfHours: number;

  @Column({ name: 'no_of_days', default: 5 })
  noOfDays: number;

  @Column({ name: 'boh_percent', default: 0 })
  bohPercent: number;

  // @Column({
  //   type: 'enum',
  //   enum: Frequency,
  //   name: 'no_of_hours_per',
  // })
  // noOfHoursPer: Frequency;

  @Column({
    name: 'remuneration_amount',
    type: 'float',
    precision: 11,
    scale: 2,
  })
  remunerationAmount: number;

  @Column({
    type: 'enum',
    enum: Frequency,
    name: 'remuneration_amount_per',
  })
  remunerationAmountPer: Frequency;

  @Column({ name: 'leave_request_policy_id', nullable: true })
  leaveRequestPolicyId: number;

  @ManyToOne(() => LeaveRequestPolicy)
  @JoinColumn({ name: 'leave_request_policy_id' })
  leaveRequestPolicy: LeaveRequestPolicy;

  @Column({ name: 'file_id', nullable: true })
  fileId: number;

  @OneToOne(() => File)
  @JoinColumn({ name: 'file_id' })
  file: File;

  @Column({ name: 'employee_id', nullable: true })
  employeeId: number;

  @ManyToOne(() => Employee, (employee) => employee.employmentContracts)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  public get isActive(): boolean {
    if (
      this.endDate == null ||
      moment().isBetween(this.startDate, this.endDate, 'date', '[]')
    ) {
      return true;
    }

    return false;
  }
}
