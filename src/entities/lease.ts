import { Frequency, Gender } from '../constants/constants';
import { Entity, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { Base } from './common/base';
import { ContactPersonOrganization } from './contactPersonOrganization';
import { EmploymentContract } from './employmentContract';
import { BankAccount } from './bankAccount';
import { Employee } from './employee';
import { Organization } from './organization';

@Entity("leases")
export class Lease extends Base {

   @Column({ name: "company_name" })
   companyName: String;

   @Column({ name: "vehicle_registration_no" })
   vehicleRegistrationNo: String;

   @Column({ name: "vehicle_make_model" })
   vehicleMakeModel: String;
   
   @Column({ name: "start_date" })
   startDate: Date;

   @Column({ name: "end_date", nullable: true }) 
   endDate: Date;

   @Column({ name: "financed_amount" }) 
   financedAmount: number;

   @Column({
      type: "enum",
      enum: Frequency,
      name: "installment_frequency"
   })
   installmentFrequency: Frequency;
   
   @Column({ name: "pre_tax_deduction_amount" }) 
   preTaxDeductionAmount: number;

   @Column({ name: "post_tax_deduction_amount" }) 
   postTaxDeductionAmount: number;

   @Column({ name: "financer_name" }) 
   financerName: string;

   @Column({ name: "employee_id" }) 
   employeeId: number;

   @ManyToOne(() => Employee, employee => employee.leases)
   @JoinColumn({ name: "employee_id" })
   employee: Employee;
}