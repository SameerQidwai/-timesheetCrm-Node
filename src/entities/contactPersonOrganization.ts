import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'; 
import { Base } from './common/base';
import { ContactPerson } from './contactPerson';
import { Organization } from './organization';

@Entity("contact_person_organizations") 
export class ContactPersonOrganization extends Base { 

   @Column({ name: "start_date" }) 
   startDate: Date;

   @Column({ name: "end_date", nullable: true }) 
   endDate: Date;

   @Column({ name: "designation" }) 
   designation: string;

   @ManyToOne(() => Organization)
   @JoinColumn({ name: "organization_id" })
   organization: Organization;

   @ManyToOne(() => ContactPerson, contactPerson => contactPerson.contactPersonOrganizations)
   @JoinColumn({ name: "contact_person_id" })
   contactPerson: ContactPerson;

}