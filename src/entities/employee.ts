import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Base } from './common/base';
import { ContactPersonOrganization } from './contactPersonOrganization';
import { EmploymentContract } from './employmentContract';
import { BankAccount } from './bankAccount';
import { Lease } from './lease';
import { SuperannuationType } from '../constants/constants';
import { Role } from './role';
import moment from 'moment';
import { LeaveRequestBalance } from './leaveRequestBalance';

@Entity('employees')
export class Employee extends Base {
  @Column({ name: 'contact_person_organization_id' })
  contactPersonOrganizationId: number;

  @OneToOne(
    () => ContactPersonOrganization,
    (contactPersonOrganization) => contactPersonOrganization.employee
  )
  @JoinColumn({ name: 'contact_person_organization_id' })
  contactPersonOrganization: ContactPersonOrganization;

  @Column({ name: 'username', unique: true })
  username: String; // unique email for login

  @Column({ name: 'password' })
  password: string; // password for login

  // ---------------------------------------------------Next of kin info----------------------------------------
  @Column({ name: 'next_of_kin_name', nullable: true })
  nextOfKinName: string;

  @Column({ name: 'next_of_kin_phone_number', nullable: true })
  nextOfKinPhoneNumber: string;

  @Column({ name: 'next_of_kin_email', nullable: true })
  nextOfKinEmail: string;

  @Column({ name: 'next_of_kin_relation', nullable: true })
  nextOfKinRelation: string;
  // ---------------------------------------------------Next of kin info----------------------------------------

  @Column({ name: 'tfn', nullable: true })
  tfn: string; // tax file number

  @Column({ name: 'tax_free_threshold', nullable: true })
  taxFreeThreshold: boolean;

  @Column({ name: 'help_hecs', nullable: true })
  helpHECS: boolean;

  // ---------------------------------------------------Superannuation info----------------------------------------
  @Column({ name: 'superannuation_name', nullable: true })
  superannuationName: string; // same as SMSF Name

  @Column({
    type: 'enum',
    enum: SuperannuationType,
    name: 'superannuation_type',
    nullable: true,
  })
  superannuationType: SuperannuationType;

  @Column({ name: 'superannuation_bank_name', nullable: true })
  superannuationBankName: string;

  @Column({
    name: 'superannuation_bank_account_or_membership_number',
    nullable: true,
  })
  superannuationBankAccountOrMembershipNumber: string; //Same as membership number

  @Column({ name: 'superannuation_abn_or_usi', nullable: true })
  superannuationAbnOrUsi: string; // Same as USI number

  @Column({ name: 'superannuation_bank_bsb', nullable: true })
  superannuationBankBsb: string;

  @Column({ name: 'superannuation_address', nullable: true })
  superannuationAddress: string; // ESA Address
  // ---------------------------------------------------Superannuation info----------------------------------------

  @Column({ name: 'training', nullable: true })
  training: string;

  // ---------------------------------------------------Management----------------------------------------

  @Column({ name: 'line_manager_id', nullable: true })
  lineManagerId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'line_manager_id' })
  lineManager: Employee;

  @OneToMany(
    () => EmploymentContract,
    (employmentContract) => employmentContract.employee,
    {
      cascade: true,
    }
  )
  employmentContracts: EmploymentContract[];

  @OneToMany(() => BankAccount, (bankAccount) => bankAccount.employee, {
    cascade: true,
  })
  bankAccounts: BankAccount[];

  @OneToMany(() => Lease, (lease) => lease.employee, {
    cascade: true,
  })
  leases: Lease[];

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(
    () => LeaveRequestBalance,
    (leaveRequestBalance) => leaveRequestBalance.employee,
    {
      cascade: true,
    }
  )
  leaveRequestBalances: LeaveRequestBalance[];

  public get getActiveContract(): EmploymentContract | null {
    let activeContract: EmploymentContract | null = null;
    this.employmentContracts.forEach((contract) => {
      if (contract.endDate == null) {
        activeContract = contract;
      } else if (
        moment(contract.startDate) <= moment() &&
        moment(contract.endDate) >= moment()
      ) {
        activeContract = contract;
      } else {
        activeContract = null;
      }
    });

    return activeContract;
  }
}
