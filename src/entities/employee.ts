import { Gender } from '../constants/constants';
import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { ContactPersonOrganization } from './contactPersonOrganization';
import { EmploymentContract } from './employmentContract';
import { BankAccount } from './bankAccount';
import { Lease } from './lease';

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

   @Column({ name: "tfn", nullable: true }) 
   tfn: string;

   @Column({ name: "super_annuation_name", nullable: true }) 
   superAnnuationName: string;

   @Column({ name: "member_number", nullable: true }) 
   memberNumber: string;

   @Column({ name: "smsf_name", nullable: true }) 
   smsfName: string;

   @Column({ name: "smsf_abn", nullable: true }) 
   smsfABN: string;

   @Column({ name: "smsf_address", nullable: true }) 
   smsfAddress: string;

   @Column({ name: "smsf_bank_name", nullable: true }) 
   smsfBankName: string;

   @Column({ name: "smsf_bank_bsb", nullable: true }) 
   smsfBankBsb: string;

   @Column({ name: "smsf_bank_account_no", nullable: true }) 
   smsfBankAccountNo: string;

   @Column({ name: "tax_free_threshold", nullable: true })
   taxFreeThreshold: boolean;

   @Column({ name: "help_hecs", nullable: true })
   helpHECS: boolean;

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

   @OneToMany(() => Lease, lease => lease.employee, {
      cascade: true
   })
   leases: Lease[];
}