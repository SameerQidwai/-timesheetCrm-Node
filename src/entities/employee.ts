import { Gender } from '../constants/constants';
import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { ContactPersonOrganization } from './contactPersonOrganization';
import { EmploymentContract } from './employmentContract';
import { BankAccount } from './bankAccount';

@Entity("employees")
export class Employee extends Base {

   @Column({ name: "contact_person_organization_id" })
   contactPersonOrganizationId: number;

   @OneToOne(() => ContactPersonOrganization, contactPersonOrganization => contactPersonOrganization.employee)
   @JoinColumn({ name: "contact_person_organization_id" })
   contactPersonOrganization: ContactPersonOrganization;

   @Column({ name: "next_of_kin_name", nullable: true })
   nextOfKinName: String;

   @Column({ name: "next_of_kin_phone_number", nullable: true })
   nextOfKinPhoneNumber: String;

   @Column({ name: "next_of_kin_email", nullable: true }) 
   nextOfKinEmail: string;

   @Column({ name: "next_of_kin_relation", nullable: true }) 
   nextOfKinRelation: string;
   
   @Column({
      type: "enum",
      enum: Gender,
      name: "next_of_kin_gender", 
      nullable: true
   })
   nextOfKinGender: Gender;

   @Column({ name: "tfn", nullable: true }) 
   tfn: string;

   @Column({ name: "super_annuation_name", nullable: true }) 
   superAnnuationName: string;

   @Column({ name: "super_annuation_id", nullable: true }) 
   superAnnuationId: string;

   @Column({ name: "member_number", nullable: true }) 
   memberNumber: string;

   @Column({ name: "smsf_bank_account_id", nullable: true }) 
   smsfBankAccountId: string;

   @Column({ name: "training", nullable: true }) 
   training: string;

   @OneToMany(() => EmploymentContract, employmentContract => employmentContract.employee, { 
      cascade: true 
    })
    employmentContracts: EmploymentContract[];

   @OneToMany(() => BankAccount, bankAccount => bankAccount.employee, {
      cascade: true
   })
   bankAccounts: BankAccount[];
}