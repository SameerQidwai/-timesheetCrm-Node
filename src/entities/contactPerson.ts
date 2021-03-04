import { ClearanceLevel, Gender } from '../constants/constants';
import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { StandardSkillStandardLevel } from './standardSkillStandardLevel';
import { State } from './state';
import { ContactPersonOrganization } from './contactPersonOrganization';
import { Organization } from './organization';

@Entity("contact_persons")
export class ContactPerson extends Base {

   @Column({ name: "first_name" })
   firstName: String;

   @Column({ name: "last_name" })
   lastName: String;

   @Column({
      type: "enum",
      enum: Gender,
      name: "gender"
   })
   gender: Gender;

   @Column({ name: "date_of_birth", nullable: true })
   dateOfBirth: Date;

   @Column({ name: "phone_number", nullable: true })
   phoneNumber: string;

   @Column()
   email: string;

   @Column({ name: "address", nullable: true })
   address: String;

   @Column({ name: "state_id", nullable: true})
   stateId: number;
   
   @ManyToOne(() => State)
   @JoinColumn({ name: "state_id" })
   state: State;

   @Column({
      type: "enum",
      enum: ClearanceLevel,
      name: "clearance_level",
      nullable: true
   })
   clearanceLevel: ClearanceLevel;

   @Column({ name: "clearance_granted_date", nullable: true })
   clearanceGrantedDate: Date;

   @Column({ name: "clearance_expiry_date", nullable: true })
   clearanceExpiryDate: Date;

   @Column({ name: "clearance_sponsor_id", nullable: true})
   clearanceSponsorId: number;
   
   @ManyToOne(() => Organization)
   @JoinColumn({ name: "clearance_sponsor_id" })
   clearanceSponsor: Organization;

   @ManyToMany(() => StandardSkillStandardLevel, standardSkillStandardLevel => standardSkillStandardLevel.contactPersons, {
      cascade: true
   })
   @JoinTable({ name: "contact_person_standard_skill_standard_level" })
   standardSkillStandardLevels: StandardSkillStandardLevel[];

   @OneToMany(() => ContactPersonOrganization, contactPersonOrganization => contactPersonOrganization.contactPerson, {
      cascade: true
   })
   contactPersonOrganizations: ContactPersonOrganization[];

}