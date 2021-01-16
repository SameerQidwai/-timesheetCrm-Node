import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'; 
import { Base } from './common/base';
import { ContactPersonOrganization } from './contactPersonOrganization';

@Entity("organizations") 
export class Organization extends Base { 

   @Column() 
   name: string;
   
   @Column({ name: "phone_number", nullable: true }) 
   phoneNumber: string;
   
   @Column({ nullable: true }) 
   email: string;

   @Column ({ type: "text", name: "address", nullable: true }) 
   address: string;

   @Column({ nullable: true }) 
   website: string;

   @Column({ name: "australian_business_number", nullable: true }) 
   abn: string;

   @Column({ name: "text_code", nullable: true }) 
   textCode: string;

   @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, name: "expected_business_amount", nullable: true }) 
   expectedBusinessAmount: number;

   @Column({ name: "invoice_email", nullable: true }) 
   invoiceEmail: string;

   @Column({ name: "pi_insurer", nullable: true }) 
   piInsurer: string;

   @Column({ name: "pl_insurer", nullable: true }) 
   plInsurer: string;

   @Column({ name: "wc_insurer", nullable: true }) 
   wcInsurer: string;

   @Column({ name: "pi_policy_number", nullable: true }) 
   piPolicyNumber: string;

   @Column({ name: "pl_policy_number", nullable: true }) 
   plPolicyNumber: string;

   @Column({ name: "wc_policy_number", nullable: true }) 
   wcPolicyNumber: string;

   @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, name: "pi_sum_insured", nullable: true }) 
   piSumInsured: number;

   @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, name: "pl_sum_insured", nullable: true }) 
   plSumInsured: number;

   @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, name: "wc_sum_insured", nullable: true }) 
   wcSumInsured: number;

   @Column({ name: "pi_insurance_expiry", nullable: true }) 
   piInsuranceExpiry: Date;

   @Column({ name: "pl_insurance_expiry", nullable: true }) 
   plInsuranceExpiry: Date;

   @Column({ name: "wc_insurance_expiry", nullable: true }) 
   wcInsuranceExpiry: Date;

   @ManyToOne(() => Organization)
   @JoinColumn({ name: "parent_organization_id" })
   parentOrganization?: Organization;

   @ManyToOne(() => ContactPersonOrganization)
   @JoinColumn({ name: "delegate_contact_person_organization_id" })
   delegateContactPersonOrganization?: ContactPersonOrganization;

}