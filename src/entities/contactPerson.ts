import {
  ClearanceLevel,
  Gender,
  RecruitmentAvailability,
  RecruitmentContractType,
  RecruitmentProspect,
} from '../constants/constants';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Base } from './common/base';
import { StandardSkillStandardLevel } from './standardSkillStandardLevel';
import { State } from './state';
import { ContactPersonOrganization } from './contactPersonOrganization';
import { Organization } from './organization';
import { Employee } from './employee';
import { OpportunityResourceAllocation } from './opportunityResourceAllocation';

@Entity('contact_persons')
export class ContactPerson extends Base {
  @Column({ name: 'first_name' })
  firstName: String;

  @Column({ name: 'last_name' })
  lastName: String;

  @Column({
    type: 'enum',
    enum: Gender,
    name: 'gender',
  })
  gender: Gender;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'email', nullable: true })
  email: string;

  @Column({ name: 'birth_place', nullable: true })
  birthPlace: String;

  @Column({ name: 'address', nullable: true })
  address: String;

  @Column({ name: 'state_id', nullable: true })
  stateId: number;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'state_id' })
  state: State;

  @Column({
    type: 'enum',
    enum: ClearanceLevel,
    name: 'clearance_level',
    nullable: true,
  })
  clearanceLevel: ClearanceLevel;

  @Column({ name: 'csid_number', nullable: true })
  csidNumber: string;

  @Column({ name: 'clearance_granted_date', nullable: true, type: 'date' })
  clearanceGrantedDate: Date | null;

  @Column({ name: 'clearance_expiry_date', nullable: true, type: 'date' })
  clearanceExpiryDate: Date | null;

  @Column({ name: 'clearance_sponsor_id', nullable: true })
  clearanceSponsorId: number;

  @Column({
    type: 'enum',
    enum: RecruitmentProspect,
    name: 'recruitment_prospect',
    nullable: true,
  })
  recruitmentProspect: RecruitmentProspect | null;

  @Column({
    type: 'enum',
    enum: RecruitmentAvailability,
    name: 'recruitment_availability',
    nullable: true,
  })
  recruitmentAvailability: RecruitmentAvailability | null;

  @Column({
    type: 'enum',
    enum: RecruitmentContractType,
    name: 'recruitment_contract_type',
    nullable: true,
  })
  recruitmentContractType: RecruitmentContractType | null;

  @Column({ name: 'recruitment_salary_estimate', nullable: true })
  recruitmentSalaryEstimate: number;

  @Column({ name: 'recruitment_notes', nullable: true, type: 'text' })
  recruitmentNotes: string | null;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'clearance_sponsor_id' })
  clearanceSponsor: Organization;

  @ManyToMany(
    () => StandardSkillStandardLevel,
    (standardSkillStandardLevel) => standardSkillStandardLevel.contactPersons,
    {
      cascade: true,
    }
  )
  @JoinTable({ name: 'contact_person_standard_skill_standard_level' })
  standardSkillStandardLevels: StandardSkillStandardLevel[];

  @OneToMany(
    () => ContactPersonOrganization,
    (contactPersonOrganization) => contactPersonOrganization.contactPerson,
    {
      cascade: true,
    }
  )
  contactPersonOrganizations: ContactPersonOrganization[];

  @OneToMany(
    () => OpportunityResourceAllocation,
    (allocation) => allocation.contactPerson,
    {
      cascade: true,
    }
  )
  allocations: OpportunityResourceAllocation[];

  public get getActiveOrganization(): ContactPersonOrganization | null {
    let activeOrganization = this.contactPersonOrganizations.filter(
      (contactPersonOrganization) => contactPersonOrganization.status == true
    );

    if (activeOrganization.length < 1) {
      return null;
    }

    return activeOrganization[0];
  }

  public get getEmployee(): Employee | null {
    let activeOrganization = this.contactPersonOrganizations.filter(
      (contactPersonOrganization) => contactPersonOrganization.status == true
    );

    if (activeOrganization.length < 1) {
      return null;
    }
    return activeOrganization[0].employee;
  }

  public get getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
