import { Gender } from '../constants/constants';
import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { StandardSkillStandardLevel } from './standardSkillStandardLevel';
import { State } from './state';
import { ContactPersonOrganization } from './contactPersonOrganization';

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