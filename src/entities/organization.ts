import { BusinessType } from "./../constants/constants";
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BankAccount } from "./bankAccount";
import { Base } from "./common/base";
import { ContactPersonOrganization } from "./contactPersonOrganization";

@Entity("organizations")
export class Organization extends Base {
  @Column()
  name: string;

  @Column({ name: "phone_number", nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: "text", name: "address", nullable: true })
  address: string;

  @Column({ nullable: true })
  website: string;

  @Column({ name: "australian_business_number", nullable: true })
  abn: string;

  @Column({
    type: "enum",
    enum: BusinessType,
    name: "business_type"
  })
  businessType: BusinessType;

  @Column({ name: "tax_code", nullable: true })
  taxCode: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 3,
    default: 0,
    name: "current_financial_year_total_forecast",
    nullable: true,
  })
  currentFinancialYearTotalForecast: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 3,
    default: 0,
    name: "next_financial_year_total_forecast",
    nullable: true,
  })
  nextFinancialYearTotalForecast: number;

  @Column({ name: "invoice_email", nullable: true })
  invoiceEmail: string;

  @Column({ name: "invoice_contact_number", nullable: true })
  invoiceContactNumber: string;
  
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

  @Column({
    type: "decimal",
    precision: 10,
    scale: 3,
    default: 0,
    name: "pi_sum_insured",
    nullable: true,
  })
  piSumInsured: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 3,
    default: 0,
    name: "pl_sum_insured",
    nullable: true,
  })
  plSumInsured: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 3,
    default: 0,
    name: "wc_sum_insured",
    nullable: true,
  })
  wcSumInsured: number;

  @Column({ name: "pi_insurance_expiry", nullable: true })
  piInsuranceExpiry: Date;

  @Column({ name: "pl_insurance_expiry", nullable: true })
  plInsuranceExpiry: Date;

  @Column({ name: "wc_insurance_expiry", nullable: true })
  wcInsuranceExpiry: Date;

  @Column({ name: "parent_organization_id", nullable: true })
  parentOrganizationId: number;

  @Column({ name: "delegate_contact_person_organization_id", nullable: true })
  delegateContactPersonOrganizationId: number;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: "parent_organization_id" })
  parentOrganization?: Organization;

  @ManyToOne(() => ContactPersonOrganization)
  @JoinColumn({ name: "delegate_contact_person_organization_id" })
  delegateContactPersonOrganization?: ContactPersonOrganization;

  @OneToMany(() => BankAccount, (bankAccount) => bankAccount.organization, {
    cascade: true,
  })
  bankAccounts: BankAccount[];
}
