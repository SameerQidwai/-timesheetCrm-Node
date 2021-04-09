import { Gender, ProjectType } from '../constants/constants';
import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Base } from './common/base';
import { StandardSkillStandardLevel } from './standardSkillStandardLevel';
import { State } from './state';
import { ContactPersonOrganization } from './contactPersonOrganization';
import { ContactPerson } from './contactPerson';
import { Organization } from './organization';
import { Panel } from './panel';
import { OpportunityResource } from './opportunityResource';

@Entity("opportunities")
export class Opportunity extends Base {

   @Column({ name: "title" })
   title: String;

   @Column({ name: "value" })
   value: number;

   @Column({
      type: "enum",
      enum: ProjectType,
      name: "type"
   })
   type: ProjectType;

   @Column({ name: "start_date", nullable: true })
   startDate: Date;

   @Column({ name: "end_date", nullable: true }) 
   endDate: Date;


   @Column({ name: "bid_date", nullable: true })
   bidDate: Date;

   @Column({ name: "entry_date", nullable: true })
   entryDate: Date;

   @Column({ name: "qualified_ops", nullable: true })
   qualifiedOps: boolean;

   @Column()
   tender: string;

   @Column({ name: "tender_number", nullable: true })
   tenderNumber: String;

   @Column({ name: "cm_percentage", nullable: true })
   cmPercentage: number;

   @Column({ name: "go_percentage", nullable: true })
   goPercentage: number;

   @Column({ name: "get_percentage", nullable: true })
   getPercentage: number;

   @Column({ name: "hours_per_day", nullable: true })
   hoursPerDay: number;

   @Column({ name: "organization_id", nullable: true})
   organizationId: number;
   
   @ManyToOne(() => Organization)
   @JoinColumn({ name: "organization_id" })
   organization: Organization;

   @Column({ name: "panel_id", nullable: true})
   panelId: number;
   
   @ManyToOne(() => Panel)
   @JoinColumn({ name: "panel_id" })
   panel: Panel;

   @Column({ name: "contact_person_id", nullable: true})
   contactPersonId: number;

   @ManyToOne(() => ContactPerson)
   @JoinColumn({ name: "contact_person_id" })
   contactPerson: ContactPerson;

   @Column({ name: "state_id", nullable: true})
   stateId: number;

   @ManyToOne(() => State)
   @JoinColumn({ name: "state_id" })
   state: State;

   @OneToMany(() => OpportunityResource, opportunityResource => opportunityResource.opportunity, {
      cascade: true
   })
   opportunityResources: OpportunityResource[];
}