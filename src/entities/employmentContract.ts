import { EmploymentType, Frequency } from '../constants/constants';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { Employee } from './employee';

@Entity("employment_contracts")
export class EmploymentContract extends Base {

   @Column({ name: "payslip_email" })
   payslipEmail: String;

   @Column({ name: "membership_account_no" })
   membershipAccountNo: String;

   @Column({
      type: "enum",
      enum: Frequency,
      name: "pay_frequency"
   })
   payFrequency: Frequency;

   @Column({ name: "start_date" })
   startDate: Date;

   @Column({ name: "end_date", nullable: true }) 
   endDate: Date;

   @Column({
      type: "enum",
      enum: EmploymentType,
      name: "type"
   })
   type: EmploymentType;

   @Column({ name: "no_of_hours" }) 
   noOfHours: number;

   @Column({
      type: "enum",
      enum: Frequency,
      name: "no_of_hours_per"
   })
   noOfHoursPer: Frequency;

   @Column({ name: "remuneration_amount" }) 
   remunerationAmount: number;

   @Column({
      type: "enum",
      enum: Frequency,
      name: "remuneration_amount_per"
   })
   remunerationAmountPer: Frequency;

   @ManyToOne(() => Employee, employee => employee.employmentContracts)
   @JoinColumn({ name: "employee_id" })
   employee: Employee;

}